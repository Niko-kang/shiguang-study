import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {build,transform} from 'esbuild';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const out=process.argv[2]||'dist';
const html=await readFile(out+'/index.html','utf8');
for(const path of ['overview','plan','progress','mistakes','mock-exams','books','timeline','current-affairs']){await mkdir(out+'/'+path,{recursive:true});await writeFile(out+'/'+path+'/index.html',html)}
await writeFile(out+'/404.html',html);await writeFile(out+'/.nojekyll','');

// Ship the complete welcome screen in HTML: its image and working links should
// not have to wait for React, other routes or the database SDK to download.
const base=html.match(/src="([^" ]+)assets\/index-[^" ]+\.js"/)?.[1];
if(!base)throw new Error('Cannot determine the site base path for the cover');
await mkdir('cloud/tencent/.build',{recursive:true});
const renderFile=resolve('cloud/tencent/.build/cover-render.cjs');
await build({
 stdin:{contents:`import React from 'react';import {renderToString} from 'react-dom/server';import Home from './app/home/page';export const cover=renderToString(React.createElement(Home));`,resolveDir:process.cwd(),loader:'tsx'},
 bundle:true,platform:'node',format:'cjs',packages:'external',alias:{'@':process.cwd()},
 define:{'import.meta.env':JSON.stringify({BASE_URL:base})},loader:{'.css':'empty'},outfile:renderFile
});
const {cover}=createRequire(import.meta.url)(renderFile);
const reset='html,body{margin:0;padding:0}body{font-size:16px;line-height:1.65}svg{display:block;flex-shrink:0}';
const css=(await transform(reset+await readFile('app/home/cover.css','utf8'),{loader:'css',minify:true})).code;
const set=[768,1280,1536].map(width=>`${base}assets/clear-ocean-${width}.avif ${width}w`).join(', ');
const hint=`<link rel="preload" as="image" type="image/avif" href="${base}assets/clear-ocean-1536.avif" imagesrcset="${set}" imagesizes="(max-aspect-ratio: 3/2) 150vh, 100vw" fetchpriority="high">`;
let home=html.replace('<div id="root">','<div id="root" data-cover-prerendered="true">');
home=home.replace(/(<div id="root"[^>]*>)[\s\S]*?<\/div>/,(_,open)=>open+cover+'</div>');
// Reveal decoded images even while the application bundle is still downloading.
// Until then (or on an image error), the inline photo stays visible without a
// broken-image icon. The React onLoad handler covers client-only development.
home=home.replace(/(<img\b[^>]*class="cover-background"[^>]*?)(\/?>)/,'$1 onload="this.style.opacity=1"$2');
// The cover has all its styling inline; unrelated global CSS must not hold up
// its first paint. Other routes keep the normal Vite stylesheet links.
home=home.replace(/<link\b[^>]*\brel="(?:stylesheet|modulepreload)"[^>]*>/g,'');
home=home.replace('</head>',hint+`<style id="cover-critical">${css}</style></head>`);
home=home.replace(/<title>[^<]*<\/title>/,'<title>欢迎回来 · 小翁自习室</title>');
await writeFile(out+'/index.html',home);await mkdir(out+'/home',{recursive:true});await writeFile(out+'/home/index.html',home);
console.log('Welcome screen prerendered with inline photo preview and responsive image preload.');
