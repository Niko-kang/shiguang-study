import {spawnSync} from 'node:child_process';
import {mkdtemp,cp,readdir,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
function git(args,cwd=process.cwd(),capture=false){const r=spawnSync('git',args,{cwd,encoding:'utf8',stdio:capture?'pipe':'inherit'});if(r.status!==0)throw new Error(capture?r.stderr:`git ${args[0]} failed`);return r.stdout?.trim()||'';}
await access('dist/index.html');
if(git(['status','--porcelain'],undefined,true))throw new Error('请先提交源码，再发布对应的构建结果。');
const source=git(['rev-parse','HEAD'],undefined,true);
const remote=git(['remote','get-url','origin'],undefined,true);
if(!/^https:\/\/github\.com\/Niko-kang\/shiguang-study(?:\.git)?$/.test(remote))throw new Error('请检查 origin 仓库地址。');
const user=git(['config','user.name'],undefined,true),email=git(['config','user.email'],undefined,true);
const dir=await mkdtemp(join(tmpdir(),'shiguang-pages-'));
try {
 const branch=git(['ls-remote','--heads',remote,'gh-pages'],undefined,true);
 if(branch)git(['clone','--depth','1','--branch','gh-pages',remote,dir]);
 else {git(['init','-b','gh-pages'],dir);git(['remote','add','origin',remote],dir);}
 // Cached HTML can still reference earlier hashed bundles after a release.
 for(const name of await readdir(dir))if(name!=='.git'&&name!=='assets')await rm(join(dir,name),{recursive:true,force:true});
 await cp('dist',dir,{recursive:true});
 git(['config','user.name',user],dir);git(['config','user.email',email],dir);
 git(['add','--all'],dir);
 if(git(['status','--porcelain'],dir,true)){git(['commit','-m',`Publish site from ${source}`],dir);git(['push','origin','gh-pages'],dir);}
 console.log('已推送构建产物。请等待 GitHub Pages 部署成功：https://niko-kang.github.io/shiguang-study/');
}finally{await rm(dir,{recursive:true,force:true});}
