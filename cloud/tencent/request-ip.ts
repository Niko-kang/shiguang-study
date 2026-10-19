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
 // Never accept client-supplied regions or acquisition-source labels.
 const {ip:ignoredIp,networkRegion:ignoredRegion,ipv4:probe4,ipv6:probe6,ipv4Region:ignored4Region,ipv6Region:ignored6Region,ipv4Source:ignored4Source,ipv6Source:ignored6Source,ipProbeVersion,...rest}=b;
 const ip=typeof sourceIp==='string'&&isIP(sourceIp.trim())?sourceIp.trim():undefined;
 const version=ip?isIP(ip):0;
 const ipv4=version===4?ip:typeof probe4==='string'&&isIP(probe4.trim())===4?probe4.trim():undefined;
 const ipv6=version===6?ip:typeof probe6==='string'&&isIP(probe6.trim())===6?probe6.trim():undefined;
 const region=async(address:string|undefined)=>{
  if(!address)return undefined;
  try{return await lookup(address);}catch{return regionUnavailable;}
 };
 const [ipv4Region,ipv6Region]=await Promise.all([region(ipv4),region(ipv6)]);
 return {...e,body:{...rest,...(ip?{ip}:{}),
  networkRegion:version===4?ipv4Region:version===6?ipv6Region:'未获取（请求来源 IP 不可用）',
  ...(ipProbeVersion===1?{ipProbeVersion:1}:{}),
  ...(ipv4?{ipv4,ipv4Region,ipv4Source:version===4?'request':'probe'}:{}),
  ...(ipv6?{ipv6,ipv6Region,ipv6Source:version===6?'request':'probe'}:{})
 }};
}
