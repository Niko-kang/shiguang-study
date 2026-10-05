import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
const out='cloud/tencent/.build/shiguang-study-api';
await mkdir(out,{recursive:true});
await build({entryPoints:['cloud/tencent/index.ts'],outfile:out+'/index.js',bundle:true,platform:'node',target:'node18',format:'cjs',external:['@cloudbase/node-sdk']});
await writeFile(out+'/package.json',JSON.stringify({name:'xiaoweng-study-api',version:'1.0.0',private:true,main:'index.js',dependencies:{'@cloudbase/node-sdk':'3.18.3'}},null,2)+'\n');
console.log('CloudBase function prepared at '+out);
