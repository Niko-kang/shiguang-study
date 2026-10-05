import * as space from './space';
import * as record from './record';
import * as learning from './learning';
import {json,validOrigin,type Env} from './shared';
export default {
 async fetch(request:Request,env:Env):Promise<Response>{
  const path=new URL(request.url).pathname;
  const methods:Record<string,string[]>={'/api/space':['GET'],'/api/record':['PUT'],'/api/learning':['GET','PUT'],'/health':['GET']};
  const allowed=methods[path];
  const origin=request.headers.get('Origin');
  const headers=new Headers({'Cache-Control':'no-store','Vary':'Origin','Referrer-Policy':'no-referrer'});
  if(origin===env.ALLOWED_ORIGIN)headers.set('Access-Control-Allow-Origin',origin);
  if(!allowed)return json({error:'接口不存在。'},404);
  if(!validOrigin(request,env))return json({error:'请求来源无效。'},403);
  if(request.method==='OPTIONS'){
   const method=request.headers.get('Access-Control-Request-Method')||'';
   const requested=(request.headers.get('Access-Control-Request-Headers')||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
   if(origin!==env.ALLOWED_ORIGIN||!allowed.includes(method)||requested.some(x=>x!=='content-type'))return json({error:'请求来源或方法无效。'},403);
   headers.set('Access-Control-Allow-Methods',allowed.join(', '));headers.set('Access-Control-Allow-Headers','Content-Type');headers.set('Access-Control-Max-Age','600');
   headers.set('Vary','Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
   return new Response(null,{status:204,headers});
  }
  let response:Response;
  if(!allowed.includes(request.method))response=json({error:'请求方法无效。'},405);
  else if(request.method==='PUT'&&env.READ_ONLY==='true')response=json({error:'学习记录已迁移，请刷新小翁自习室网页后再保存。'},503);
  else if(path==='/health'){
   try{await env.DB.prepare('SELECT COUNT(*) FROM public_progress').first();await env.DB.prepare('SELECT COUNT(*) FROM learning_entries').first();response=json({ok:true,storage:'owner-cloudflare-d1'})}catch{response=json({error:'数据库尚未初始化。'},503)}
  }else if(path==='/api/space')response=await space.GET(request,env);
  else if(path==='/api/record')response=await record.PUT(request,env);
  else response=await (request.method==='GET'?learning.GET:learning.PUT)(request,env);
  response.headers.forEach((value,key)=>headers.set(key,value));
  return new Response(response.body,{status:response.status,headers});
 }
};
