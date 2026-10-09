import {z} from 'zod';
import {readTimer,updateTimer,publicTimer} from './timer';
import {recordVisit} from './visit';
import plan from '../../app/plan.json';
import {mistakeSchema,examSchema} from '../../app/learning-model';

export type Collection='study_progress'|'study_entries';
export type Row={version:number;updatedAt:string;[key:string]:unknown};
export type Visit={id:string;at:string;path:string;[key:string]:unknown};
export interface Store {
 saveCheckin(id:string,expectedVersion:number,row:Row,date:string):Promise<boolean>;
 list(collection:Collection):Promise<Row[]>;
 listVisits():Promise<Visit[]>;
 addVisit(visit:Visit):Promise<void>;
 save(collection:Collection,id:string,expectedVersion:number,row:Row):Promise<boolean>;
}
const days=new Set(plan.flatMap(w=>w.days.filter(d=>d.kind==='study').map(d=>d.date)));
const destinations=new Set(plan.flatMap(w=>w.days.filter(d=>d.kind==='study'||d.kind==='buffer').map(d=>d.date)));
const envelope=z.object({path:z.enum(['/health','/api/space','/api/record','/api/learning','/api/timer','/api/visit']),method:z.enum(['GET','PUT']),kind:z.enum(['mistake','exam']).optional(),body:z.unknown().optional()});
const progressInput=z.object({date:z.string().refine(d=>days.has(d)),status:z.enum(['todo','doing','done','deferred']),deferredTo:z.string().optional(),version:z.number().int().min(0)}).superRefine((r,ctx)=>{
 if(r.status==='deferred'&&(!r.deferredTo||!destinations.has(r.deferredTo)||r.deferredTo<=r.date))ctx.addIssue({code:'custom',message:'顺延日期无效'});
});
const entryInput=z.object({id:z.string().uuid(),kind:z.enum(['mistake','exam']),version:z.number().int().min(0),archived:z.boolean(),data:z.unknown()});
const reply=(status:number,body:unknown)=>({status,body});
const progressView=(r:Row)=>({date:r.date,status:r.status,deferredTo:r.deferredTo,version:r.version,updatedAt:r.updatedAt});
const entryView=(r:Row)=>({id:r.id,data:r.data,version:r.version,archived:r.archived,updatedAt:r.updatedAt});

// The SDK gateway checks the configured website domain and anonymous session.
// All visitors intentionally share one dataset. Database client access is denied.
export function createHandler(store:Store,{readOnly=false}:{readOnly?:boolean}={}){
 return async(event:unknown)=>{
  try{
   const raw=JSON.stringify(event);
   if(!raw)return reply(400,{error:'请求格式无效。'});
   if(raw.length>45000)return reply(400,{error:'内容过长，请精简后保存。'});
   const parsed=envelope.safeParse(event);
   if(!parsed.success)return reply(400,{error:'请求格式无效。'});
   const {path,method,body,kind}=parsed.data;
   if((path==='/api/record'&&method!=='PUT')||((path==='/health'||path==='/api/space')&&method!=='GET')||(path==='/api/visit'&&method!=='PUT'))return reply(405,{error:'请求方法无效。'});
   if(path==='/api/visit')return recordVisit(store,body);
   if(method==='PUT'&&readOnly)return reply(503,{error:'学习记录正在迁移，请稍后重试。'});
   if(path==='/api/timer')return method==='GET'?reply(200,publicTimer(await readTimer(store))):await updateTimer(store,body,days);
   if(path==='/health'){
    await Promise.all([store.list('study_progress'),store.list('study_entries')]);
    return reply(200,{ok:true,storage:'owner-tencent-cloudbase',readOnly});
   }
   if(path==='/api/space')return reply(200,{records:(await store.list('study_progress')).map(progressView).sort((a,b)=>String(a.date).localeCompare(String(b.date)))});
   if(path==='/api/record'){
    const valid=progressInput.safeParse(body);
    if(!valid.success)return reply(400,{error:'请检查日期、完成状态与顺延日期。'});
    const b=valid.data;
    const record={date:b.date,status:b.status,deferredTo:b.status==='deferred'?b.deferredTo!:'',version:b.version+1,updatedAt:new Date().toISOString()};
    if(!await store.save('study_progress',b.date,b.version,record))return reply(409,{error:'这一天的进度刚被更新。请关闭后重新打开，确认最新状态再保存。'});
    return reply(200,{record});
   }
   if(method==='GET'){
    if(!kind)return reply(400,{error:'页面类型无效。'});
    const entries=(await store.list('study_entries')).filter(r=>r.kind===kind).map(entryView).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||String(b.id).localeCompare(String(a.id)));
    return reply(200,{entries});
   }
   const input=entryInput.safeParse(body);
   if(!input.success)return reply(400,{error:'记录格式无效。'});
   const b=input.data,valid=(b.kind==='mistake'?mistakeSchema:examSchema).safeParse(b.data);
   if(!valid.success)return reply(400,{error:'请检查必填内容、日期和成绩范围。'});
   const row={id:b.id,kind:b.kind,data:valid.data,version:b.version+1,archived:b.archived,updatedAt:new Date().toISOString()};
   if(!await store.save('study_entries',b.id,b.version,row))return reply(409,{error:'记录已在其他设备更新。请保留当前文字，关闭后重新打开最新记录再修改。'});
   return reply(200,{entry:entryView(row)});
  }catch{
   return reply(503,{error:'学习记录暂时无法同步，填写内容仍保留，请稍后重试。'});
  }
 };
}
