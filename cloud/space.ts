import {json,type Env} from './shared';

export async function GET(request:Request,env:Env){try{const data=await env.DB.prepare('SELECT task_date AS date, status, deferred_to AS deferredTo, version, updated_at AS updatedAt FROM public_progress ORDER BY task_date').all();return json({records:data.results})}catch(e){console.error('progress read unavailable',e);return json({error:'学习进度暂时无法加载，请稍后重试。'},503)}}
