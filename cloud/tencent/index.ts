import cloudbase from '@cloudbase/node-sdk';
import {createHandler} from './handler';
import {createStore} from './store';
const app=cloudbase.init({env:cloudbase.SYMBOL_CURRENT_ENV,region:process.env.TCB_REGION||'ap-shanghai'});
const handler=createHandler(createStore(app.database()),{readOnly:process.env.STUDY_READ_ONLY==='true'});
export const main=(event:unknown)=>handler(event);
