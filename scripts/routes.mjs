import {mkdir,readFile,writeFile} from 'node:fs/promises';
const html=await readFile('dist/index.html','utf8');
for(const path of ['overview','plan','progress','mistakes','mock-exams','books','timeline']){await mkdir('dist/'+path,{recursive:true});await writeFile('dist/'+path+'/index.html',html)}
await writeFile('dist/404.html',html);await writeFile('dist/.nojekyll','');
