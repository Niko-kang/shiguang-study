import type {Collection,Row,Store} from './handler';
import type cloudbase from '@cloudbase/node-sdk';
type Database=ReturnType<ReturnType<typeof cloudbase.init>['database']>;
type Transaction={collection(name:string):{doc(id:string):{get():Promise<{data:Row|null}>;set(data:Row):Promise<unknown>}}};
export function createStore(db:Database):Store{
 return {
  async list(collection:Collection){
   const rows:Row[]=[];let cursor='';
   for(let page=0;page<100;page++){
    const base=db.collection(collection);
    const query=cursor?base.where({_id:db.command.gt(cursor)}):base;
    const result=await query.orderBy('_id','asc').limit(100).get();
    if(!Array.isArray(result.data))throw new Error('Invalid database response');
    rows.push(...result.data as Row[]);
    if(result.data.length<100)return rows;
    cursor=String(result.data[result.data.length-1]._id);
   }
   throw new Error('Record limit reached; refusing a partial read');
  },
  async save(collection,id,expectedVersion,row){
   return db.runTransaction(async(tx:Transaction)=>{
    const doc=tx.collection(collection).doc(id);
    const {data}=await doc.get();
    // Transaction reads return a single document or null (not a query array).
    const current=data as Row|null;
    if((current?.version??0)!==expectedVersion||(expectedVersion===0&&current))return false;
    if(current&&collection==='study_entries'&&current.kind!==row.kind)return false;
    await doc.set(row);
    return true;
   });
  }
 };
}
