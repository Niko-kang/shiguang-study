import {createHash,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import type {Store} from './handler';
const request=z.object({path:z.literal('/api/admin'),method:z.literal('POST'),body:z.object({accessKey:z.string().min(1).max(160)})});
export function createAdminHandler(store:Store,expectedHash:string|undefined){return async(event:unknown)=>{
 if(!expectedHash||!/^[a-f0-9]{64}$/.test(expectedHash))return {status:503,body:{error:'后台暂未配置。'}};
 const parsed=request.safeParse(event);
 if(!parsed.success)return {status:401,body:{error:'请输入有效的后台访问密钥。'}};
 const hash=createHash('sha256').update(parsed.data.body.accessKey).digest();
 if(!timingSafeEqual(hash,Buffer.from(expectedHash,'hex')))return {status:401,body:{error:'访问密钥不正确。'}};
 try{const [progress,entries,visits]=await Promise.all([
  store.list('study_progress'),
  store.list('study_entries'),
  store.listVisits().catch(()=>[])
 ]);
 const timer=entries.find(r=>r.id==='shared-study-timer');
 return {status:200,body:{fetchedAt:new Date().toISOString(),progress,timer:timer?.data||{active:null,sessions:[]},entries:entries.filter(r=>r.kind==='mistake'||r.kind==='exam'),visits}};
 }catch{return {status:503,body:{error:'云端读取失败，请稍后重试。'}}}
}}
