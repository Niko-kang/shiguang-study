import cloudbase from '@cloudbase/node-sdk';
import {createHandler} from './handler';
import {createAdminHandler} from './admin';
import {createStore} from './store';
import {withRequestIp} from './request-ip';
const app=cloudbase.init({env:cloudbase.SYMBOL_CURRENT_ENV,region:process.env.TCB_REGION||'ap-shanghai'});
const handler=createHandler(createStore(app.database()),{readOnly:process.env.STUDY_READ_ONLY==='true'});
const admin=createAdminHandler(createStore(app.database()),process.env.STUDY_ADMIN_HASH);
export const main=(event:unknown,context:Parameters<typeof cloudbase.parseContext>[0])=>{
 if(event&&typeof event==='object'&&'path' in event&&event.path==='/api/admin')return admin(event);
 let ip:unknown;
 try{
  const parsed=cloudbase.parseContext(context);
  const environment=(parsed.environment??parsed.environ) as Record<string,unknown>|undefined;
  ip=environment?.TCB_SOURCE_IP;
 }catch{/* Never reuse process environment values from an earlier invocation. */}
 return handler(withRequestIp(event,ip));
};
