import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,type Store,type Row} from './handler';
import {createStore} from './store';

function memory(){
 const rows=new Map<string,Row>();
 const store:Store={async list(c){return [...rows.entries()].filter(([id])=>id.startsWith(c+'/')).map(([,r])=>structuredClone(r))},async save(c,id,v,row){const key=c+'/'+id,old=rows.get(key);if((old?.version??0)!==v||(old&&old.kind!==row.kind))return false;rows.set(key,structuredClone(row));return true}};
 return {store,rows};
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
 const db={command:{gt:(x:string)=>x},collection(){let after='';return {where(q:any){after=q._id;return this},orderBy(){return this},limit(){return this},async get(){return {data:rows.filter(r=>r._id>after).slice(0,100)}}}},async runTransaction(fn:any){return fn({collection:()=>({doc:()=>({get:async()=>({data:persisted}),set:async(row:Row)=>{persisted=row;writes.push(row)}})})})}};
 const store=createStore(db as any);
 assert.equal((await store.list('study_entries')).length,101);
 assert.equal(await store.save('study_entries','id',0,{kind:'exam',version:1,updatedAt:'x'}),true);
 assert.equal(await store.save('study_entries','id',0,{kind:'exam',version:1,updatedAt:'x'}),false);
 assert.equal(await store.save('study_entries','id',1,{kind:'mistake',version:2,updatedAt:'x'}),false);
 assert.equal(writes.length,1);
});
