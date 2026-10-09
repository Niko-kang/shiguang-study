// Requested only when starting or manually adding a check-in, never on page load.
export async function lookupNetworkRegion(){
 try{
  const response=await fetch('https://ipwho.is/?fields=success,message,ip,country,region,city',{signal:AbortSignal.timeout(5000),credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error('lookup failed');
  const data=await response.json();
  if(data.success!==true||typeof data.ip!=='string')throw new Error('lookup failed');
  const parts=[data.country,data.region,data.city].filter((v,i,a)=>typeof v==='string'&&v.length>0&&a.indexOf(v)===i);
  return {ip:data.ip,networkRegion:parts.join(' · ')||'地区未知'};
 }catch{return {networkRegion:'未获取（网络或查询服务不可用）'}}
}
