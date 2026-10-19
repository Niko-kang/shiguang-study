import {deviceLabel} from './device';
import {apiFetch} from './urls';
import {createVisibleClock} from './visit-duration';

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
 const clock=createVisibleClock(performance.now(),document.visibilityState==='visible');
 let credentials:{id:string;token:string}|undefined,busy=false,lastSent=-1;
 const sample=()=>clock.sample(performance.now(),document.visibilityState==='visible');
 const flush=async()=>{
  const visibleMs=sample();
  if(!credentials||busy||visibleMs===lastSent)return;
  busy=true;
  try{const response=await apiFetch('/api/visit-duration',{method:'PUT',body:JSON.stringify({...credentials,visibleMs})});if(response.ok)lastSent=visibleMs;}catch{}finally{busy=false;}
 };
 setInterval(()=>{void flush();},5000);
 document.addEventListener('visibilitychange',()=>{void flush();});
 window.addEventListener('pagehide',()=>{void flush();});
 window.addEventListener('pageshow',()=>{sample();});
 void (async()=>{
  const response=await apiFetch('/api/visit',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   trackDuration:true,
   initialVisibleMs:sample(),
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
   connection:connection(),
   visibility:document.visibilityState
  })});
  if(response.ok){const result=await response.json();if(result.id&&result.token){credentials={id:result.id,token:result.token};void flush();}}
 })().catch(()=>{});
}
