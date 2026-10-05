import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('cloud/tencent/.build',{recursive:true});
await build({entryPoints:['cloud/tencent/handler.test.ts'],outfile:'cloud/tencent/.build/handler.test.cjs',bundle:true,platform:'node',target:'node18',format:'cjs'});
const result=spawnSync(process.execPath,['--test','cloud/tencent/.build/handler.test.cjs'],{stdio:'inherit'});
process.exitCode=result.status??1;
