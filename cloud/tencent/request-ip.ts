import {isIP} from 'node:net';

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
