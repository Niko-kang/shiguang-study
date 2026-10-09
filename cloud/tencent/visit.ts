import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {Store,Visit} from './handler';

const text=(max:number)=>z.string().max(max).optional();
const input=z.object({
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
 const visit:Visit={
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
 return {status:200,body:{ok:true}};
}
