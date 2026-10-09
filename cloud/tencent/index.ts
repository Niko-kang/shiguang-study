import cloudbase from '@cloudbase/node-sdk';
import {createHandler} from './handler';
import {createAdminHandler} from './admin';
import {createStore} from './store';
const app=cloudbase.init({env:cloudbase.SYMBOL_CURRENT_ENV,region:process.env.TCB_REGION||'ap-shanghai'});
const handler=createHandler(createStore(app.database()),{readOnly:process.env.STUDY_READ_ONLY==='true'});
const admin=createAdminHandler(createStore(app.database()),process.env.STUDY_ADMIN_HASH);
export const main=(event:unknown)=>event&&typeof event==='object'&&'path' in event&&event.path==='/api/admin'?admin(event):handler(event);
