import {deviceLabel} from './device';
import {lookupNetworkRegion} from './network-region';
import {apiFetch} from './urls';

function token(key:Storage,name:string){
 const existing=key.getItem(name);
 if(existing)return existing;
 const created=crypto.randomUUID();
 key.setItem(name,created);
 return created;
}

function connection(){
 const net=(navigator as Navigator & {connection?:{effectiveType?:string;type?:string}}).connection;
 return net?.effectiveType||net?.type||'';
}

export function recordVisit(){
 if(import.meta.env.VITE_DATA_PROVIDER!=='cloudbase')return;
 void (async()=>{
  const network=await lookupNetworkRegion();
  await apiFetch('/api/visit',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   clientAt:new Date().toISOString(),
   path:location.pathname+location.search+location.hash,
   title:document.title,
   href:location.href,
   referrer:document.referrer,
   language:navigator.language,
   timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
   device:deviceLabel(),
   userAgent:navigator.userAgent,
   platform:navigator.platform,
   screen:`${screen.width}x${screen.height}`,
   viewport:`${window.innerWidth}x${window.innerHeight}`,
   pixelRatio:window.devicePixelRatio,
   sessionId:token(sessionStorage,'shiguang-visit-session'),
   visitorId:token(localStorage,'shiguang-visit-visitor'),
   ip:network.ip,
   networkRegion:network.networkRegion,
   connection:connection(),
   visibility:document.visibilityState
  })});
 })().catch(()=>{});
}
