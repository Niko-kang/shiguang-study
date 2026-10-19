import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,type Store,type Row} from './handler';
import {createStore} from './store';

function memory(){
 const rows=new Map<string,Row>();
 const visits:import('./handler').Visit[]=[];
 const store:Store={async saveCheckin(id,v,row,date){const key='study_entries/'+id;if((rows.get(key)?.version??0)!==v)return false;const progressKey='study_progress/'+date,previous=rows.get(progressKey);rows.set(key,structuredClone(row));if(previous?.status!=='done')rows.set(progressKey,{...previous,date,status:'done',deferredTo:'',version:(previous?.version??0)+1,updatedAt:row.updatedAt});return true;},async list(c){return [...rows.entries()].filter(([id])=>id.startsWith(c+'/')).map(([,r])=>structuredClone(r))},async setVisitsDeleted(ids,deleted){for(const row of visits)if(ids.includes(row.id))row.deleted=deleted},async setVisitDeleted(id,deleted){const row=visits.find(v=>v.id===id);if(row)row.deleted=deleted},async listVisits(){return visits.map(v=>structuredClone(v))},async addVisit(visit){visits.push(structuredClone(visit))},async save(c,id,v,row){const key=c+'/'+id,old=rows.get(key);if((old?.version??0)!==v||(old&&old.kind!==row.kind))return false;rows.set(key,structuredClone(row));return true}};
 return {store,rows,visits};
}
test('progress persists and a competing device cannot overwrite the winner',async()=>{
 const {store}=memory(),handle=createHandler(store);
 const request={path:'/api/record',method:'PUT',body:{date:'2026-10-08',status:'done',version:0}};
 const results=await Promise.all([handle(request),handle({...request,body:{...request.body,status:'doing'}})]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const got=await handle({path:'/api/space',method:'GET'});
 assert.equal(got.status,200);assert.equal((got.body as any).records[0].status,'done');
 assert.equal((await handle({...request,body:{...request.body,status:'deferred',version:1,deferredTo:'2026-10-09'}})).status,200);
 assert.equal((await handle({...request,body:{...request.body,status:'deferred',version:2,deferredTo:'2026-10-04'}})).status,400);
});
test('learning records retain score data and support archive/restore with conflicts',async()=>{
 const {store}=memory(),handle=createHandler(store);
 const exam={id:'13a7fd06-7f0e-45ca-b1f8-647bcda2dcf0',kind:'exam',version:0,archived:false,data:{date:'2026-10-05',title:'真题测试',subject:'英语',minutes:180,scores:[5,30,5,10,8,12],review:'复盘',nextStep:'复习'}};
 const put=(body:unknown)=>handle({path:'/api/learning',method:'PUT',body});
 assert.equal((await put(exam)).status,200);assert.equal((await put(exam)).status,409);
 assert.equal((await put({...exam,version:1,archived:true})).status,200);
 const archived=(await handle({path:'/api/learning',method:'GET',kind:'exam'})).body as any;
 assert.equal(archived.entries[0].archived,true);assert.deepEqual(archived.entries[0].data.scores,exam.data.scores);
 assert.equal((await put({...exam,version:2})).status,200);
 assert.equal((await put({...exam,version:3,data:{...exam.data,scores:[99,30,5,10,8,12]}})).status,400);
 assert.equal((await put({...exam,version:3,data:{...exam.data,date:'2026-02-30'}})).status,400);
 const mistake={id:'7846b0cf-e8dc-4c92-9f3a-6467c56d3ca4',kind:'mistake',version:0,archived:false,data:{date:'2026-10-05',subject:'数学',source:'真题',question:'1+1',myAnswer:'3',answer:'2',reason:'计算失误',correction:'重做',status:'待复习',nextReview:'2026-10-06'}};
 assert.equal((await put(mistake)).status,200);
 assert.equal(((await handle({path:'/api/learning',method:'GET',kind:'mistake'})).body as any).entries.length,1);
});
test('invalid requests and unavailable storage fail closed; migration mode refuses writes',async()=>{
 const {store}=memory(),handle=createHandler(store);
 assert.equal((await handle(undefined)).status,400);
 assert.equal((await handle({path:'/admin/import',method:'PUT'})).status,400);
 assert.equal((await handle({path:'/api/space',method:'PUT'})).status,405);
 assert.equal((await handle({path:'/api/learning',method:'GET'})).status,400);
 const broken=createHandler({...store,async list(){throw new Error('network')}});
 assert.equal((await broken({path:'/api/space',method:'GET'})).status,503);
 assert.equal((await broken({path:'/health',method:'GET'})).status,503);
 assert.equal((await createHandler(store,{readOnly:true})({path:'/api/record',method:'PUT',body:{date:'2026-10-08',status:'done',version:0}})).status,503);
});
test('CloudBase adapter handles transaction single-document reads and paginates past 100 rows',async()=>{
 const rows=Array.from({length:101},(_,i)=>({_id:String(i).padStart(3,'0'),version:1,updatedAt:'2026-10-05T00:00:00Z'}));
 let persisted:Row|null=null;const writes:Row[]=[];
 const db={command:{gt:(x:string)=>x,lt:(x:string)=>x},collection(){let after='';return {where(q:any){after=q._id;return this},orderBy(){return this},limit(){return this},async get(){return {data:rows.filter(r=>r._id>after).slice(0,100)}}}},async runTransaction(fn:any){return fn({collection:()=>({doc:()=>({get:async()=>({data:persisted}),set:async(row:Row)=>{persisted=row;writes.push(row)}})})})}};
 const store=createStore(db as any);
 assert.equal((await store.list('study_entries')).length,101);
 assert.equal(await store.save('study_entries','id',0,{kind:'exam',version:1,updatedAt:'x'}),true);
 assert.equal(await store.save('study_entries','id',0,{kind:'exam',version:1,updatedAt:'x'}),false);
 assert.equal(await store.save('study_entries','id',1,{kind:'mistake',version:2,updatedAt:'x'}),false);
 assert.equal(writes.length,1);
});

test('timer pauses, survives reload, cancels without changing existing progress, and saves separately',async()=>{
 const {store}=memory();const {updateTimer,readTimer}=await import('./timer');const days=new Set(['2026-10-08']);
 await store.save('study_progress','2026-10-08',0,{date:'2026-10-08',status:'done',version:1,updatedAt:'old'});
 let version=0;const at=(minutes:number)=>new Date(Date.parse('2026-10-09T10:00:00Z')+minutes*60000);
 const send=async(action:string,minute:number,extra:object={})=>{const r=await updateTimer(store,{action,version,...extra},days,at(minute));if(r.status===200)version++;return r};
 assert.equal((await send('start',0,{date:'2026-10-08'})).status,200);
 assert.equal((await send('pause',10)).status,200);
 assert.equal((await readTimer(store)).active?.elapsedMs,600000);
 assert.equal((await send('resume',20)).status,200);
 assert.equal((await send('stop',30)).status,200);
 assert.equal((await readTimer(store)).sessions.length,0);
 // An accidental end can be resumed; review time is excluded.
 assert.equal((await send('resume',40)).status,200);
 assert.equal((await send('stop',45)).status,200);
 assert.equal((await send('save',45,{note:'数学'})).status,200);
 const saved=await readTimer(store);assert.equal(saved.sessions[0].durationMs,25*60000);assert.equal(saved.active,null);
 assert.equal((await send('start',50,{date:'2026-10-08'})).status,200);
 assert.equal((await send('cancel',55)).status,200);
 assert.equal((await readTimer(store)).sessions.length,1);
 assert.equal((await store.list('study_progress'))[0].status,'done');assert.equal((await store.list('study_progress'))[0].version,1);
 const id=saved.sessions[0].id;
 assert.equal((await send('edit',60,{id,date:'2026-10-08',startedAt:at(0).toISOString(),endedAt:at(45).toISOString(),durationMs:20*60000,note:'修正'})).status,200);
 assert.equal((await readTimer(store)).sessions[0].adjusted,true);
 assert.equal((await send('delete',60,{id})).status,200);
 assert.equal((await readTimer(store)).sessions[0].deleted,true);
 assert.equal((await send('restore',60,{id})).status,200);
 assert.equal((await readTimer(store)).sessions[0].deleted,false);
});
test('timer validates times and prevents duplicate concurrent starts/saves',async()=>{
 const {store}=memory();const {updateTimer,readTimer}=await import('./timer');const days=new Set(['2026-10-08']),now=new Date('2026-10-09T10:00:00Z');
 const results=await Promise.all([1,2].map(()=>updateTimer(store,{action:'start',date:'2026-10-08',version:0},days,now)));
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal((await updateTimer(store,{action:'stop',version:1},days,new Date(now.getTime()+60000))).status,200);
 const saves=await Promise.all([1,2].map(()=>updateTimer(store,{action:'save',version:2},days,new Date(now.getTime()+61000))));
 assert.deepEqual(saves.map(r=>r.status).sort(),[200,409]);assert.equal((await readTimer(store)).sessions.length,1);
 assert.equal((await updateTimer(store,{action:'manual',version:3,date:'2026-10-08',startedAt:now.toISOString(),endedAt:new Date(now.getTime()+3600000).toISOString(),durationMs:60000},days,now)).status,400);
 assert.equal((await updateTimer(store,{action:'manual',version:3,date:'2026-10-08',startedAt:new Date(now.getTime()-60000).toISOString(),endedAt:now.toISOString(),durationMs:120000},days,now)).status,400);
});

test('confirm check-in atomically completes its task; pause, cancel and edits never complete another task',async()=>{
 const {store}=memory();const {updateTimer,readTimer}=await import('./timer');const days=new Set(['2026-10-08','2026-10-10']);const start=new Date('2026-10-09T10:00:00Z'),end=new Date('2026-10-09T10:30:00Z');
 await store.save('study_progress','2026-10-08',0,{date:'2026-10-08',status:'done',version:1,updatedAt:'original'});
 assert.equal((await updateTimer(store,{action:'start',date:'2026-10-10',version:0},days,start)).status,200);
 assert.equal((await updateTimer(store,{action:'stop',version:1},days,end)).status,200);
 assert.equal((await store.list('study_progress')).length,1);
 assert.equal((await updateTimer(store,{action:'save',version:2},days,end)).status,200);
 assert.equal((await store.list('study_progress')).find(r=>r.date==='2026-10-10')?.status,'done');
 assert.equal((await store.list('study_progress')).find(r=>r.date==='2026-10-08')?.updatedAt,'original');
 const before=await readTimer(store);
 const refusing={...store,async saveCheckin(){return false}};
 assert.equal((await updateTimer(refusing,{action:'manual',version:before.version,date:'2026-10-10',startedAt:start.toISOString(),endedAt:end.toISOString(),durationMs:60000},days,end)).status,409);
 assert.deepEqual(await readTimer(store),before);
});

test('public timer responses omit stored IP/device metadata',async()=>{
 const {store}=memory(),handle=createHandler(store);
 const started=await handle({path:'/api/timer',method:'PUT',body:{action:'start',version:0,date:'2026-10-08',device:'test-device',ip:'203.0.113.5',networkRegion:'test-region'}});
 assert.equal(started.status,200);assert.equal((started.body as any).active.ip,undefined);
 const raw=await store.list('study_entries');assert.equal((raw[0].data as any).active.ip,'203.0.113.5');
 const read=await handle({path:'/api/timer',method:'GET'});assert.equal((read.body as any).active.device,undefined);assert.equal((read.body as any).active.networkRegion,undefined);
});

test('admin fails closed and only exposes owner metadata with the correct key',async()=>{
 const {createAdminHandler}=await import('./admin');const {createHash}=await import('node:crypto');
 const {store}=memory();const key='test-key-that-is-long-enough';
 await store.save('study_progress','2026-10-08',0,{date:'2026-10-08',status:'done',version:1,updatedAt:'original'});
 const admin=createAdminHandler(store,createHash('sha256').update(key).digest('hex'));
 assert.equal((await admin({path:'/api/admin',method:'POST',body:{accessKey:'wrong-key-long-enough'}})).status,401);
 assert.equal((await admin({path:'/api/admin',method:'GET',body:{accessKey:key}})).status,401);
 const result=await admin({path:'/api/admin',method:'POST',body:{accessKey:key}});assert.equal(result.status,200);assert.equal((result.body as any).progress[0].status,'done');
 assert.deepEqual((result.body as any).visits,[]);
 assert.equal((await createAdminHandler(store,undefined)({})).status,503);
 assert.equal((await store.list('study_progress'))[0].updatedAt,'original');
});

test('visits are stored privately and omitted from public learning APIs',async()=>{
 const {store,visits}=memory(),handle=createHandler(store);
 assert.equal((await handle({path:'/api/visit',method:'GET'})).status,405);
 assert.equal((await handle({path:'/api/visit',method:'PUT',body:{}})).status,400);
 const saved=await handle({path:'/api/visit',method:'PUT',body:{path:'/plan/',title:'学习计划',href:'https://niko-kang.github.io/shiguang-study/plan/',referrer:'https://www.google.com/',language:'zh-CN',timezone:'Asia/Shanghai',device:'电脑 · macOS · Chrome',userAgent:'Mozilla/5.0',screen:'1440x900',viewport:'1200x800',sessionId:'session-1',visitorId:'visitor-1',ip:'203.0.113.8',networkRegion:'中国 · 上海 · 上海'}});
 assert.equal(saved.status,200);
 assert.equal(visits.length,1);
 assert.equal(visits[0].path,'/plan/');
 assert.equal(visits[0].ip,'203.0.113.8');
 const space=await handle({path:'/api/space',method:'GET'});
 assert.equal(space.status,200);
 assert.equal(JSON.stringify(space.body).includes('203.0.113.8'),false);
 const timer=await handle({path:'/api/timer',method:'GET'});
 assert.equal(JSON.stringify(timer.body).includes('visitor-1'),false);
 const {createAdminHandler}=await import('./admin');const {createHash}=await import('node:crypto');
 const key='test-key-that-is-long-enough';
 const admin=createAdminHandler(store,createHash('sha256').update(key).digest('hex'));
 const snapshot=await admin({path:'/api/admin',method:'POST',body:{accessKey:key}});
 assert.equal(snapshot.status,200);
 assert.equal((snapshot.body as any).visits[0].ip,'203.0.113.8');
 assert.equal((snapshot.body as any).visits[0].path,'/plan/');
});

test('admin visit deletion is authenticated, recoverable and leaves learning data intact',async()=>{
 const {store,visits,rows}=memory();
 const {createAdminHandler}=await import('./admin');
 const {createHash}=await import('node:crypto');
 const accessKey='test-admin-key-at-least-20-characters';
 const admin=createAdminHandler(store,createHash('sha256').update(accessKey).digest('hex'));
 visits.push({id:'visit-1',at:new Date().toISOString(),path:'/'});
 const call=(key:string,action:string)=>admin({path:'/api/admin',method:'POST',body:{accessKey:key,action,id:'visit-1'}});
 assert.equal((await call('wrong-key-long-enough','deleteVisit')).status,401);
 assert.equal(visits[0].deleted,undefined);
 assert.equal((await call(accessKey,'deleteVisit')).status,200);
 assert.equal(visits[0].deleted,true);
 assert.equal((await call(accessKey,'restoreVisit')).status,200);
 assert.equal(visits[0].deleted,false);
 assert.equal(rows.size,0);
});

test('bulk visit deletion affects only selected visits and supports restoration',async()=>{
 const {store,visits}=memory();const {createAdminHandler}=await import('./admin');const {createHash}=await import('node:crypto');
 const accessKey='test-bulk-key-at-least-20-characters';const admin=createAdminHandler(store,createHash('sha256').update(accessKey).digest('hex'));
 for(const id of ['a','b','c'])visits.push({id,at:new Date().toISOString(),path:'/'});
 const call=(action:string,ids:string[],key=accessKey)=>admin({path:'/api/admin',method:'POST',body:{accessKey:key,action,ids}});
 assert.equal((await call('deleteVisits',['a','b'],'incorrect-key-long-enough')).status,401);
 assert.equal(visits[0].deleted,undefined);
 assert.equal((await call('deleteVisits',['a','b','a'])).status,200);
 assert.deepEqual(visits.map(v=>v.deleted),[true,true,undefined]);
 assert.equal((await call('restoreVisits',['a','b'])).status,200);
 assert.deepEqual(visits.map(v=>v.deleted),[false,false,undefined]);
 assert.notEqual((await call('deleteVisits',[])).status,200);
});

import {withRequestIp} from './request-ip';
import {withBilibiliRegion} from './request-ip';
import {createBilibiliRegionLookup,parseBilibiliRegion,regionUnavailable} from './network-region';
test('Bilibili regions match the recorded IP, normalize IPv6 and ignore coordinates',async()=>{
 const ip='2001:db8::5';
 const payload={code:0,data:{addr:'2001:0db8:0000:0000:0000:0000:0000:0005',country:'中国',province:'江西',city:'南昌',latitude:123,longitude:456}};
 assert.equal(parseBilibiliRegion(payload,ip),'中国 · 江西 · 南昌');
 assert.throws(()=>parseBilibiliRegion(payload,'203.0.113.5'));
 assert.equal(parseBilibiliRegion({code:0,data:{addr:ip,country:'中国',province:'上海',city:'上海'}},ip),'中国 · 上海');
 let calls=0;
 const lookup=createBilibiliRegionLookup((async(url)=>{calls++;assert.equal(new URL(String(url)).searchParams.get('ip'),ip);return Response.json(payload);}) as typeof fetch);
 assert.deepEqual(await Promise.all([lookup(ip),lookup(ip)]),['中国 · 江西 · 南昌','中国 · 江西 · 南昌']);
 assert.equal(calls,1);
 const failed=createBilibiliRegionLookup((async()=>Response.json({code:-412})) as typeof fetch);
 assert.equal(await failed(ip),regionUnavailable);
 const blocked=createBilibiliRegionLookup((async()=>{throw new Error('Timeout or network failure')}) as typeof fetch);
 assert.equal(await blocked(ip),regionUnavailable);
});
test('server lookup preserves IP on failure, ignores spoofed client regions and skips existing records',async()=>{
 const {store,visits}=memory(),handle=createHandler(store);
 const event={path:'/api/visit',method:'PUT',body:{path:'/plan/',ip:'198.51.100.2',networkRegion:'untrusted region'}};
 await handle(await withBilibiliRegion(event,'203.0.113.5',async(ip)=>{assert.equal(ip,'203.0.113.5');return '中国 · 江西 · 南昌'}));
 assert.equal(visits[0].ip,'203.0.113.5');assert.equal(visits[0].networkRegion,'中国 · 江西 · 南昌');
 await handle(await withBilibiliRegion(event,'2001:db8::5',async()=>{throw new Error('offline')}));
 assert.equal(visits[1].ip,'2001:db8::5');assert.equal(visits[1].networkRegion,regionUnavailable);
 let calls=0;
 const lookup=async()=>{calls++;return '中国 · 江西'};
 for(const path of ['/api/visit-duration','/api/admin'])assert.deepEqual(await withBilibiliRegion({...event,path},'203.0.113.5',lookup),{...event,path});
 for(const action of ['save','edit','resume','stop','cancel']){
  const other={path:'/api/timer',method:'PUT',body:{action}};
  assert.deepEqual(await withBilibiliRegion(other,'203.0.113.5',lookup),other);
 }
 const missing=await withBilibiliRegion(event,undefined,lookup) as any;
 assert.equal(missing.body.ip,undefined);assert.notEqual(missing.body.networkRegion,'untrusted region');assert.equal(calls,0);
 assert.equal(visits[0].networkRegion,'中国 · 江西 · 南昌');
});
test('runtime IP survives failed geolocation and cannot be replaced by client IP',async()=>{
 const {store,visits}=memory();const handle=createHandler(store);
 const event={path:'/api/visit',method:'PUT',body:{path:'/plan/',networkRegion:'查询失败'}};
 await handle(withRequestIp(event,'203.0.113.5'));
 assert.equal(visits[0].ip,'203.0.113.5');
 await handle(withRequestIp({...event,body:{...event.body,ip:'198.51.100.2',networkRegion:'wrong city'}},'2001:db8::5'));
 assert.equal(visits[1].ip,'2001:db8::5');assert.notEqual(visits[1].networkRegion,'wrong city');
 assert.deepEqual(withRequestIp(event,undefined),event);
 assert.deepEqual(withRequestIp(event,'not-an-ip'),event);
});
test('request IP added only when a new visit or timer session starts',()=>{
 for(const action of ['save','edit','resume','stop']){
  const event={path:'/api/timer',method:'PUT',body:{action,version:1}};
  assert.deepEqual(withRequestIp(event,'203.0.113.5'),event);
 }
 const event={path:'/api/timer',method:'PUT',body:{action:'start',version:0}};
 assert.equal((withRequestIp(event,'203.0.113.5') as any).body.ip,'203.0.113.5');
});

import {durationUpdate} from './visit';
import {createVisibleClock} from '../../lib/visit-duration';
test('visit duration pauses while hidden and caps sleep gaps',()=>{
 const clock=createVisibleClock(0,true);
 assert.equal(clock.sample(10000,false),10000);
 assert.equal(clock.sample(70000,true),10000);
 assert.equal(clock.sample(75000),15000);
 assert.equal(clock.sample(175000),35000);
});
test('visit duration is monotonic, credential protected, preserves data and does not backfill old rows',()=>{
 const at='2026-10-15T00:00:00Z',now=Date.parse(at)+30000;
 const row={at,durationTokenHash:'secret',visibleMs:15000,initialVisibleMs:5000,ip:'203.0.113.1'};
 assert.equal(durationUpdate(row,'wrong',20000,now),null);
 assert.equal(durationUpdate({...row,deleted:true},'secret',20000,now),null);
 assert.equal(durationUpdate({at},'secret',20000,now),null);
 assert.equal(durationUpdate(row,'secret',999999,now),null);
 assert.equal(durationUpdate(row,'secret',10000,now)?.visibleMs,15000);
 const next=durationUpdate(row,'secret',25000,now)!;
 assert.equal(next.visibleMs,25000);assert.equal(next.ip,row.ip);
 assert.equal(row.visibleMs,15000);
});

import {createIpProbe} from '../../lib/ip-probe';
test('dual protocol probes run separately, validate family and use fallback without losing the other result',async()=>{
 const calls:string[]=[];
 const probe=createIpProbe((async(url,options)=>{
  const target=String(url);calls.push(target);
  assert.equal(options?.credentials,'omit');assert.equal(options?.referrerPolicy,'no-referrer');
  if(target==='https://api.ipify.org')return new Response('2001:db8::9'); // Wrong protocol must not be accepted.
  if(target==='https://api6.ipify.org')throw new Error('Unavailable');
  return new Response(target.includes('ipv4')?'203.0.113.7':'2001:db8::7');
 }) as typeof fetch);
 const result=await probe();
 assert.deepEqual(result,{ipProbeVersion:1,ipv4:'203.0.113.7',ipv6:'2001:db8::7'});
 assert.equal(calls.length,4);assert.deepEqual(await probe(),result);assert.equal(calls.length,4);
});
test('probe timeout and network failure remain bounded, cached briefly and never invent an address',async()=>{
 let calls=0,now=100;
 const probe=createIpProbe((async(url)=>{
  calls++;
  if(String(url).includes('api.ipify.org'))return new Response('203.0.113.7');
  if(String(url).includes('api6.ipify.org'))return new Promise(()=>{});
  throw new Error('No IPv6 network');
 }) as typeof fetch,10,()=>now);
 assert.deepEqual(await probe(),{ipProbeVersion:1,ipv4:'203.0.113.7'});
 assert.equal(calls,3);await probe();assert.equal(calls,3);
 now+=15001;await probe();assert.equal(calls,6);
 const offline=createIpProbe((async()=>{throw new Error('offline')}) as typeof fetch);
 assert.deepEqual(await offline(),{ipProbeVersion:1});
});
test('server keeps authoritative request IP, separately geolocates IPv4 and IPv6 and ignores supplied labels',async()=>{
 const {store,visits}=memory(),handle=createHandler(store);
 const calls:string[]=[];
 const event={path:'/api/visit',method:'PUT',body:{path:'/plan/',ip:'198.51.100.5',ipv4:'198.51.100.6',ipv6:'2001:db8::8',ipv4Region:'untrusted4',ipv6Region:'untrusted6',ipv6Source:'request',ipProbeVersion:1}};
 await handle(await withBilibiliRegion(event,'203.0.113.5',async(ip)=>{calls.push(ip);return ip.includes(':')?'中国 · 江西 · 南昌':'中国 · 上海';}));
 const v=visits[0];assert.equal(v.ip,'203.0.113.5');assert.equal(v.ipv4,v.ip);assert.equal(v.ipv6,'2001:db8::8');
 assert.equal(v.networkRegion,'中国 · 上海');assert.equal(v.ipv4Region,'中国 · 上海');assert.equal(v.ipv6Region,'中国 · 江西 · 南昌');
 assert.equal(v.ipv4Source,'request');assert.equal(v.ipv6Source,'probe');assert.equal(v.ipProbeVersion,1);
 assert.deepEqual(calls.sort(),['2001:db8::8','203.0.113.5'].sort());
 // An IPv6 request must win over a conflicting IPv6 probe too.
 const reverse=await withBilibiliRegion(event,'2001:db8::1',async()=>regionUnavailable) as any;
 assert.equal(reverse.body.ipv6,'2001:db8::1');assert.equal(reverse.body.ipv6Source,'request');assert.equal(reverse.body.ipv4,'198.51.100.6');assert.equal(reverse.body.ipv4Source,'probe');
 assert.equal(reverse.body.networkRegion,regionUnavailable);
});
test('failed region lookup does not discard either protocol, and invalid probes never enter storage',async()=>{
 const {store,visits}=memory(),handle=createHandler(store);
 const event={path:'/api/visit',method:'PUT',body:{path:'/plan/',ipv6:'2001:db8::8',ipProbeVersion:1}};
 await handle(await withBilibiliRegion(event,'203.0.113.5',async()=>{throw new Error('offline')}));
 assert.equal(visits[0].ipv4,'203.0.113.5');assert.equal(visits[0].ipv6,'2001:db8::8');
 assert.equal(visits[0].ipv4Region,regionUnavailable);assert.equal(visits[0].ipv6Region,regionUnavailable);
 const invalid={...event,body:{path:'/plan/',ipv4:'2001:db8::5',ipv6:'not-an-ip',ipv4Region:'fake',ipv6Region:'fake',ipProbeVersion:1}};
 await handle(await withBilibiliRegion(invalid,'203.0.113.5',async()=>'中国'));
 assert.equal(visits[1].ipv6,undefined);assert.equal(visits[1].ipv6Region,undefined);assert.equal(visits[1].ipv4,'203.0.113.5');
 const noRequest=await withBilibiliRegion(event,undefined,async()=>'中国') as any;
 assert.equal(noRequest.body.ip,undefined);assert.equal(noRequest.body.ipv6Source,'probe');
});
test('dual IP metadata survives timer save/edit/delete/restore, remains private and does not modify older records',async()=>{
 const {store}=memory();const {updateTimer,readTimer,publicTimer}=await import('./timer');const days=new Set(['2026-10-08']);
 const start=new Date('2026-10-09T10:00:00Z'),end=new Date('2026-10-09T10:30:00Z');
 const metadata={ip:'203.0.113.5',networkRegion:'中国 · 上海',ipv4:'203.0.113.5',ipv6:'2001:db8::8',ipv4Region:'中国 · 上海',ipv6Region:'中国 · 江西',ipv4Source:'request' as const,ipv6Source:'probe' as const,ipProbeVersion:1 as const};
 const old={id:'f1c60c21-ff88-44d7-9311-a7aa9b8bb0c8',date:'2026-10-08',startedAt:'2026-10-08T10:00:00Z',endedAt:'2026-10-08T10:30:00Z',durationMs:1800000,note:'原始记录',source:'timer',adjusted:false,ip:'2001:db8::2',networkRegion:'旧地区'};
 await store.save('study_entries','shared-study-timer',0,{id:'shared-study-timer',kind:'timer',version:1,updatedAt:'original',data:{version:1,active:null,sessions:[old]}});
 assert.equal((await updateTimer(store,{action:'start',date:'2026-10-08',version:1,...metadata},days,start)).status,200);
 const active=await readTimer(store);assert.equal(active.active?.ipv6,metadata.ipv6);
 const stripped=publicTimer(active).active!;
 for(const key of Object.keys(metadata))assert.equal((stripped as any)[key],undefined);
 await updateTimer(store,{action:'stop',version:2},days,end);
 await updateTimer(store,{action:'save',version:3},days,end);
 const saved=await readTimer(store),id=saved.sessions[1].id;
 assert.equal(saved.sessions[1].ipv6Region,metadata.ipv6Region);assert.deepEqual(saved.sessions[0],old);
 await updateTimer(store,{action:'edit',id,date:'2026-10-08',version:4,startedAt:start.toISOString(),endedAt:end.toISOString(),durationMs:60000,ipv6:'2001:db8::999',note:'调整'},days,end);
 await updateTimer(store,{action:'delete',id,version:5},days,end);
 await updateTimer(store,{action:'restore',id,version:6},days,end);
 const final=await readTimer(store);assert.equal(final.sessions[1].ipv6,metadata.ipv6);assert.deepEqual(final.sessions[0],old);
 for(const key of Object.keys(metadata))assert.equal((publicTimer(final).sessions[1] as any)[key],undefined);
});
