import {isIP} from 'node:net';
import {lookupBilibiliRegion,regionUnavailable} from './network-region';

// This argument is exclusively supplied by the cloud runtime, never the event body.
export function withRequestIp(event:unknown,sourceIp:unknown):unknown{
 if(typeof sourceIp!=='string'||!isIP(sourceIp.trim()))return event;
 if(!event||typeof event!=='object')return event;
 const e=event as Record<string,unknown>;
 if(e.method!=='PUT'||!e.body||typeof e.body!=='object'||Array.isArray(e.body))return event;
 const b=e.body as Record<string,unknown>;
 if(e.path!=='/api/visit'&&!(e.path==='/api/timer'&&['start','manual'].includes(String(b.action))))return event;
 const ip=sourceIp.trim();
 const sameClientIp=b.ip===ip;
 return {...e,body:{...b,ip,networkRegion:sameClientIp&&typeof b.networkRegion==='string'?b.networkRegion:'地区未查询（已记录请求来源 IP）'}};
}

export async function withBilibiliRegion(event:unknown,sourceIp:unknown,lookup=lookupBilibiliRegion):Promise<unknown>{
 if(!event||typeof event!=='object')return event;
 const e=event as Record<string,unknown>;
 if(e.method!=='PUT'||!e.body||typeof e.body!=='object'||Array.isArray(e.body))return event;
 const b=e.body as Record<string,unknown>;
 if(e.path!=='/api/visit'&&!(e.path==='/api/timer'&&['start','manual'].includes(String(b.action))))return event;
 if(typeof sourceIp!=='string'||!isIP(sourceIp.trim())){
  const {ip,networkRegion,...rest}=b;
  return {...e,body:{...rest,networkRegion:'未获取（请求来源 IP 不可用）'}};
 }
 const captured=withRequestIp(event,sourceIp) as Record<string,unknown>;
 const body=captured.body as Record<string,unknown>;
 let region=regionUnavailable;
 try{region=await lookup(String(body.ip));}catch{/* A failed region query never prevents saving the captured IP. */}
 return {...captured,body:{...body,networkRegion:region}};
}
