import {emptyTimer,elapsed,timerCommand,type TimerState,type Session} from '../../app/study-timer-model';
import type {Store,Row} from './handler';
const id='shared-study-timer';
export async function readTimer(store:Store):Promise<TimerState>{const row=(await store.list('study_entries')).find(r=>r.id===id);return row?{...(row.data as TimerState),version:row.version}:structuredClone(emptyTimer)}
export async function updateTimer(store:Store,input:unknown,days:Set<string>,now=new Date()){
 const parsed=timerCommand.safeParse(input);
 if(!parsed.success)return {status:400,body:{error:'请检查时间与学习内容。'}};
 const b=parsed.data,s=await readTimer(store),a=s.active,stamp=now.toISOString(),ms=now.getTime();
 const fail=(error:string,status=400)=>({status,body:{error}});
 if(b.version!==s.version)return fail('其他设备刚更新了打卡，请同步最新记录后再操作。',409);
 if(b.action==='start'){
  if(a)return fail('已有一次学习正在计时，请先结束或取消。',409);
  if(!b.date||!days.has(b.date))return fail('请选择要学习的任务。');
  s.active={id:crypto.randomUUID(),date:b.date,startedAt:stamp,runningSince:stamp,elapsedMs:0,endedAt:null,phase:'running',device:b.device||'未知设备',networkRegion:b.networkRegion||'未获取',...(b.ip?{ip:b.ip}:{})};
 }else if(['pause','resume','stop','cancel','save'].includes(b.action)){
  if(!a||b.id&&a.id!==b.id)return fail('这次计时已结束，请同步最新记录。',409);
  if(b.action==='cancel')s.active=null;
  if(b.action==='pause'){
   if(a.phase!=='running')return fail('当前未在计时。');
   a.elapsedMs=elapsed(a,ms);a.runningSince=null;a.phase='paused';
  }
  if(b.action==='resume'){
   if(a.phase==='running')return fail('当前已经在计时。');
   a.runningSince=stamp;a.endedAt=null;a.phase='running';
  }
  if(b.action==='stop'){
   if(a.phase==='review')return fail('请确认本次打卡。');
   a.elapsedMs=elapsed(a,ms);a.runningSince=null;a.endedAt=stamp;a.phase='review';
  }
  if(b.action==='save'){
   if(a.phase!=='review')return fail('请先结束计时，再确认保存。');
   const start=b.startedAt||a.startedAt,end=b.endedAt||a.endedAt!,duration=b.durationMs??a.elapsedMs;
   if(!validTimes(start,end,duration,ms))return fail('有效学习时长需大于零，且不能超过起止时间范围；结束时间不能在未来。');
   if(duration>4*3600000&&b.durationMs===undefined)return fail('本次超过4小时，请核对并填写实际学习时长。');
   s.sessions.push({id:a.id,date:a.date,startedAt:start,endedAt:end,durationMs:duration,note:b.note||'',source:'timer',device:a.device,networkRegion:a.networkRegion,...(a.ip?{ip:a.ip}:{}),adjusted:start!==a.startedAt||end!==a.endedAt||Math.abs(duration-a.elapsedMs)>1000});s.active=null;
  }
 }else if(b.action==='manual'||b.action==='edit'){
  const old=s.sessions.find(r=>r.id===b.id);
  if(b.action==='edit'&&(!old||old.deleted))return fail('这条记录已不存在。',409);
  if(!b.date||!days.has(b.date)||!b.startedAt||!b.endedAt||!b.durationMs||!validTimes(b.startedAt,b.endedAt,b.durationMs,ms))return fail('请检查任务、起止时间和有效学习时长，结束时间不能在未来。');
  const row:Session={id:old?.id||crypto.randomUUID(),date:b.date,startedAt:b.startedAt,endedAt:b.endedAt,durationMs:b.durationMs,note:b.note||'',source:old?.source||'manual',device:old?.device||b.device||'未知设备',networkRegion:old?.networkRegion||b.networkRegion||'未获取',...((old?.ip||b.ip)?{ip:old?.ip||b.ip}:{}),adjusted:b.action==='edit'};
  if(old)s.sessions=s.sessions.map(r=>r.id===old.id?row:r);else s.sessions.push(row);
 }else{
  const row=s.sessions.find(r=>r.id===b.id);if(!row)return fail('记录不存在。');row.deleted=b.action==='delete';
 }
 s.version++;
 const row:Row={id,kind:'timer',data:s,version:s.version,updatedAt:stamp};
 const completeDate=b.action==='save'?a!.date:b.action==='manual'?b.date:null;
 const saved=completeDate?await store.saveCheckin(id,b.version,row,completeDate):await store.save('study_entries',id,b.version,row);
 if(!saved)return fail('其他设备刚更新了打卡，请同步最新记录后再操作。',409);
 return {status:200,body:publicTimer(s)};
}
function validTimes(start:string,end:string,duration:number,now:number){const lo=Date.parse(start),hi=Date.parse(end);return Number.isFinite(lo)&&Number.isFinite(hi)&&hi<=now+5000&&lo<=hi&&duration>=1000&&duration<=hi-lo&&duration<=86400000}

// Metadata stays in owner storage and is never returned by the public API.
export function publicTimer(state:TimerState):TimerState{
 const strip=<T extends {ip?:string;device?:string;networkRegion?:string}>(row:T)=>{const {ip,device,networkRegion,...visible}=row;return visible};
 return {...state,active:state.active?strip(state.active):null,sessions:state.sessions.map(strip)};
}
