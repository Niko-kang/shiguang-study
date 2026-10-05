// Converts a verified export to admin-only CloudBase insert commands.
// Does not contact either backend or overwrite existing records.
import {readFile,writeFile} from 'node:fs/promises';
import {z} from 'zod';
import {mistakeSchema,examSchema} from '../../app/learning-model.ts';
const file=process.argv[2];
if(!file)throw new Error('Pass the records.json backup path');
const plan=JSON.parse(await readFile(new URL('../../app/plan.json',import.meta.url),'utf8'));
const dates=new Set(plan.flatMap(w=>w.days.filter(d=>d.kind==='study').map(d=>d.date)));
const destinations=new Set(plan.flatMap(w=>w.days.filter(d=>['study','buffer'].includes(d.kind)).map(d=>d.date)));
const meta={version:z.number().int().positive(),updatedAt:z.string().datetime()};
const progress=z.object({...meta,date:z.string().refine(d=>dates.has(d)),status:z.enum(['todo','doing','done','deferred']),deferredTo:z.string()}).refine(r=>r.status!=='deferred'||(destinations.has(r.deferredTo)&&r.deferredTo>r.date));
const entry=z.object({...meta,id:z.string().uuid(),archived:z.boolean(),data:z.unknown()});
const snapshot=z.object({records:z.array(progress),mistakes:z.array(entry.extend({data:mistakeSchema})),exams:z.array(entry.extend({data:examSchema}))}).parse(JSON.parse(await readFile(file,'utf8')));
const records=snapshot.records.map(r=>({_id:r.date,...r}));
const entries=[...snapshot.mistakes.map(r=>({_id:r.id,...r,kind:'mistake'})),...snapshot.exams.map(r=>({_id:r.id,...r,kind:'exam'}))];
if(new Set(records.map(r=>r._id)).size!==records.length||new Set(entries.map(r=>r._id)).size!==entries.length)throw new Error('Duplicate record IDs');
const commands=[['study_progress',records],['study_entries',entries]].filter(([,rows])=>rows.length).map(([table,documents])=>({TableName:table,CommandType:'INSERT',Command:JSON.stringify({insert:table,documents,ordered:true})}));
await writeFile(file.replace(/\.json$/,'.cloudbase-import.json'),JSON.stringify(commands,null,2),{mode:0o600,flag:'wx'});
console.log(JSON.stringify({progress:records.length,entries:entries.length}));
