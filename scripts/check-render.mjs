import {build} from 'esbuild';
import {createRequire} from 'node:module';
// Rendering all dashboard tabs catches shortened-week indexing failures that
// TypeScript and the production bundle alone do not detect.
await build({
 stdin:{contents:`import React from 'react'; import {renderToString} from 'react-dom/server'; import Dashboard from './app/dashboard';
 for(const tab of ['plan','overview','books','timeline']){
  const html=renderToString(React.createElement(Dashboard,{initialTab:tab}));
  if(!html.length)throw new Error('Empty render: '+tab);
  console.log(tab+' render passed');
 }`,resolveDir:process.cwd(),loader:'tsx'},
 bundle:true,platform:'node',format:'cjs',packages:'external',
 define:{'import.meta.env':JSON.stringify({BASE_URL:'/shiguang-study/'})},
 outfile:'cloud/tencent/.build/render-check.cjs'
});
createRequire(import.meta.url)('../cloud/tencent/.build/render-check.cjs');
