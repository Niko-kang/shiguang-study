import {isIP} from 'node:net';

const endpoint='https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr';
export const regionUnavailable='未获取（哔哩哔哩地区查询暂不可用，IP已记录）';
const regionUnknown='地区未知（哔哩哔哩未提供有效地区）';
function canonicalIp(ip:string){
 return isIP(ip)===6?new URL(`http://[${ip}]/`).hostname:ip;
}
export function parseBilibiliRegion(payload:unknown,ip:string):string{
 if(!payload||typeof payload!=='object')throw new Error('Invalid response');
 const result=payload as {code?:unknown;data?:Record<string,unknown>};
 const data=result.data;
 if(result.code!==0||!data||typeof data.addr!=='string'||!isIP(data.addr)||canonicalIp(data.addr)!==canonicalIp(ip))throw new Error('IP mismatch or lookup failed');
 const parts=[data.country,data.province,data.city]
  .filter((v):v is string=>typeof v==='string')
  .map(v=>v.trim())
  .filter(v=>v.length>0&&v.length<=60&&!/[<>\r\n]/.test(v)&&!v.includes('.')&&!['未知','未知地区','局域网','保留地址'].includes(v));
 return [...new Set(parts)].join(' · ').slice(0,150)||regionUnknown;
}

// Query the runtime-observed address, never the function server's own address.
export function createBilibiliRegionLookup(fetcher:typeof fetch=fetch){
 const cache=new Map<string,{value:Promise<string>;expires:number}>();
 return async(ip:string):Promise<string>=>{
  if(!isIP(ip))return regionUnavailable;
  const hit=cache.get(ip);
  if(hit&&hit.expires>Date.now())return hit.value;
  if(cache.size>=256)cache.delete(cache.keys().next().value!);
  const entry={value:Promise.resolve(regionUnavailable),expires:Date.now()+300000};
  entry.value=(async()=>{
   try{
    const response=await fetcher(`${endpoint}?ip=${encodeURIComponent(ip)}`,{signal:AbortSignal.timeout(2500),redirect:'error',credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error('Lookup failed');
    return parseBilibiliRegion(await response.json(),ip);
   }catch{
    entry.expires=Date.now()+15000;
    return regionUnavailable;
   }
  })();
  cache.set(ip,entry);
  return entry.value;
 };
}
export const lookupBilibiliRegion=createBilibiliRegionLookup();
