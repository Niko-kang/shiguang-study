import {createRoot,hydrateRoot} from 'react-dom/client';
import type {ComponentType} from 'react';
import {pageUrl} from './lib/urls';
import {recordVisit} from './lib/visit-log';
import './app/globals.css';
import './app/unified.css';
import './app/apple.css';
import './app/coastal.css';
const pages:Record<string,[()=>Promise<{default:ComponentType}>,string]>={
 home:[()=>import('./app/home/page'),'欢迎回来'],
 overview:[()=>import('./app/overview/page'),'总览'],
 plan:[()=>import('./app/plan/page'),'学习计划'],
 progress:[()=>import('./app/progress/page'),'学习进度'],
 mistakes:[()=>import('./app/mistakes/page'),'错题本'],
 'mock-exams':[()=>import('./app/mock-exams/page'),'模拟考试'],
 books:[()=>import('./app/books/page'),'书单资料'],
 timeline:[()=>import('./app/timeline/page'),'关键时间节点'],
 'current-affairs':[()=>import('./app/current-affairs/page'),'每日时政']
};
const route=location.pathname.replace(import.meta.env.BASE_URL,'').replace(/^\/+|\/+$/g,'') || 'home';
const item=pages[route];
document.title=(item?.[1]||'页面未找到')+' · 小翁自习室';
async function openPage(){
 const root=document.getElementById('root')!;
 if(item){
  const {default:Page}=await item[0]();
  if(route==='home'&&root.dataset.coverPrerendered==='true')hydrateRoot(root,<Page/>);
  else createRoot(root).render(<Page/>);
 }else createRoot(root).render(<main className="shell"><h1>页面未找到</h1><a href={pageUrl('/overview/')}>返回总览</a></main>);
 recordVisit();
}
void openPage().catch(()=>{
 const message=document.getElementById('loading-message');
 if(message)message.textContent='页面暂未加载成功，请点击下方重新打开。学习记录仍保存在云端。';
});
