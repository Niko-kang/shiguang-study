import {z} from 'zod';

const endpoints={
 ipv4:['https://api.ipify.org','https://api-ipv4.ip.sb/ip'],
 ipv6:['https://api6.ipify.org','https://api-ipv6.ip.sb/ip']
};
type ProbeResult={ipProbeVersion:1;ipv4?:string;ipv6?:string};

// Only protocol-specific endpoints can establish whether both routes work.
// Results are client-reported; the server still retains its own observed IP.
export function createIpProbe(fetcher:typeof fetch=fetch,timeoutMs=1800,now=Date.now){
 let cached:Promise<ProbeResult>|undefined,expires=0;
 async function family(key:'ipv4'|'ipv6'){
  const schema=z.string().ip({version:key==='ipv4'?'v4':'v6'});
  for(const url of endpoints[key]){
   const controller=new AbortController();
   let timer:ReturnType<typeof setTimeout>|undefined;
   try{
    const text=await Promise.race([
     (async()=>{const response=await fetcher(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error'});if(!response.ok)throw new Error('IP probe unavailable');return response.text();})(),
     new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('IP probe timeout'));},timeoutMs);})
    ]);
    const parsed=schema.safeParse(text.trim());
    if(parsed.success)return parsed.data;
   }catch{/* Try the independent fallback without blocking the study interface. */}
   finally{clearTimeout(timer);controller.abort();}
  }
 }
 return ()=>{
  if(cached&&expires>now())return cached;
  expires=now()+60000;
  cached=Promise.all([family('ipv4'),family('ipv6')]).then(([ipv4,ipv6])=>{
   if(!ipv4||!ipv6)expires=now()+15000;
   return {ipProbeVersion:1 as const,...(ipv4?{ipv4}:{}),...(ipv6?{ipv6}:{})};
  });
  return cached;
 };
}
export const probeIpAddresses=createIpProbe();
