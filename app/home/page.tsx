import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, NotebookPen, Library, ClipboardCheck} from 'lucide-react';
import {pageUrl} from '@/lib/urls';
import './cover.css';

export default function Home(){return <main className="cover-page">
 <img className="cover-background" src={pageUrl('/assets/study-corner-clear-ocean.webp')} fetchPriority="high" alt="浅色墙面围着朝海的窗，书桌前的白纱帘被微风轻轻拂动"/>
 <div className="cover-shade" aria-hidden="true"/>
 <header className="cover-header">
  <a className="cover-brand" href={pageUrl('/')} aria-label="小翁自习室首页"><BookOpen size={22} strokeWidth={1.4}/><span>小翁自习室</span></a>
  <a className="cover-overview" href={pageUrl('/overview/')}>考试总览<ArrowUpRight size={14}/></a>
 </header>
 <section className="cover-hero" aria-labelledby="cover-title">
  <h1 id="cover-title">向海，<span>也向未来。</span></h1>
  <a className="cover-primary" href={pageUrl('/plan/')}>开始学习<ArrowRight size={17}/></a>
 </section>
 <footer className="cover-footer">
  <nav className="cover-dock" aria-label="学习入口">
   <a href={pageUrl('/plan/')}><span className="cover-dock-icon"><CalendarDays size={23} strokeWidth={1.4}/></span><span>学习计划</span></a>
   <a href={pageUrl('/books/')}><span className="cover-dock-icon"><Library size={23} strokeWidth={1.4}/></span><span>书单</span></a>
   <a href={pageUrl('/mistakes/')}><span className="cover-dock-icon"><NotebookPen size={23} strokeWidth={1.4}/></span><span>错题本</span></a>
   <a href={pageUrl('/mock-exams/')}><span className="cover-dock-icon"><ClipboardCheck size={23} strokeWidth={1.4}/></span><span>模拟考试</span></a>
  </nav>
 </footer>
 </main>}
