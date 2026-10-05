import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, NotebookPen, Sprout} from 'lucide-react';
import {pageUrl} from '@/lib/urls';
import './cover.css';

export default function Home(){return <main className="cover-page">
 <img className="cover-background" src={pageUrl('/assets/study-corner-soft-breeze.webp')} fetchPriority="high" alt="浅色墙面围着朝海的窗，书桌前的白纱帘被微风轻轻拂动"/>
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
   <a href={pageUrl('/plan/')}><CalendarDays size={17} strokeWidth={1.5}/><span>计划</span></a>
   <a href={pageUrl('/mistakes/')}><NotebookPen size={17} strokeWidth={1.5}/><span>错题</span></a>
   <a href={pageUrl('/progress/')}><Sprout size={17} strokeWidth={1.5}/><span>记录</span></a>
  </nav>
 </footer>
 </main>}
