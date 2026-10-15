import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {Store,Visit} from './handler';

const text=(max:number)=>z.string().max(max).optional();
const input=z.object({
 trackDuration:z.boolean().optional(),
 initialVisibleMs:z.number().int().min(0).max(60000).optional(),
 clientAt:text(40),
 path:z.string().min(1).max(200),
 title:text(160),
 href:text(500),
 referrer:text(500),
 language:text(80),
 timezone:text(80),
 device:text(160),
 userAgent:text(400),
 platform:text(80),
 screen:text(40),
 viewport:text(40),
 pixelRatio:z.number().min(0).max(16).optional(),
 sessionId:text(80),
 visitorId:text(80),
 ip:text(80),
 networkRegion:text(160),
 connection:text(40),
 visibility:text(20)
});
const clip=(value:string|undefined)=>value?.trim()||'';

export async function recordVisit(store:Store,body:unknown){
 const parsed=input.safeParse(body);
 if(!parsed.success)return {status:400,body:{error:'访问记录格式无效。'}};
 const b=parsed.data;
 const at=new Date().toISOString();
 const token=b.trackDuration?randomUUID():undefined;
 const visit:Visit={
  ...(token?{durationTokenHash:createHash("sha256").update(token).digest("hex"),visibleMs:b.initialVisibleMs||0,initialVisibleMs:b.initialVisibleMs||0,lastSeenAt:at}:{}),
  id:`${at}_${randomUUID()}`,
  at,
  clientAt:clip(b.clientAt),
  path:b.path.trim(),
  title:clip(b.title),
  href:clip(b.href),
  referrer:clip(b.referrer),
  language:clip(b.language),
  timezone:clip(b.timezone),
  device:clip(b.device),
  userAgent:clip(b.userAgent),
  platform:clip(b.platform),
  screen:clip(b.screen),
  viewport:clip(b.viewport),
  ...(b.pixelRatio===undefined?{}:{pixelRatio:b.pixelRatio}),
  sessionId:clip(b.sessionId),
  visitorId:clip(b.visitorId),
  ip:clip(b.ip),
  networkRegion:clip(b.networkRegion),
  connection:clip(b.connection),
  visibility:clip(b.visibility)
 };
 await store.addVisit(visit);
 return {status:200,body:{ok:true,...(token?{id:visit.id,token}:{})}};
}

const durationInput=z.object({id:z.string().min(1).max(100),token:z.string().uuid(),visibleMs:z.number().int().min(0).max(604800000)});
export async function recordDuration(store:Store,body:unknown){
 const parsed=durationInput.safeParse(body);
 if(!parsed.success)return {status:400,body:{error:'访问时长格式无效。'}};
 if(!store.updateVisitDuration)return {status:503,body:{error:'时长记录暂不可用。'}};
 const {id,token,visibleMs}=parsed.data;
 const ok=await store.updateVisitDuration(id,createHash('sha256').update(token).digest('hex'),visibleMs);
 return {status:ok?200:403,body:ok?{ok:true}:{error:'访问记录凭据无效。'}};
}
export function durationUpdate(current:Record<string,unknown>|null,tokenHash:string,visibleMs:number,now:number):Record<string,unknown>|null{
 if(!current||current.deleted||current.durationTokenHash!==tokenHash)return null;
 const limit=Math.max(0,now-Date.parse(String(current.at))+(Number(current.initialVisibleMs)||0));
 if(!Number.isFinite(limit)||visibleMs>limit+1000)return null;
 return {...current,visibleMs:Math.max(Number(current.visibleMs)||0,Math.min(visibleMs,limit)),lastSeenAt:new Date(now).toISOString()};
}
