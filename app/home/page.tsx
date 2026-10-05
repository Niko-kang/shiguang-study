import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, NotebookPen, Sprout} from 'lucide-react';
import {pageUrl} from '@/lib/urls';
import './cover.css';

export default function Home(){return <main className="cover-page">
 <img className="cover-background" src={pageUrl('/assets/study-corner-v2.webp')} fetchPriority="high" alt="阳光落在窗边的书桌上，一本摊开的书、一盏绿台灯和一杯茶"/>
 <div className="cover-shade" aria-hidden="true"/>
 <header className="cover-header">
  <a className="cover-brand" href={pageUrl('/')} aria-label="小翁自习室首页"><BookOpen size={23} strokeWidth={1.5}/><span>小翁自习室</span></a>
  <nav className="cover-nav" aria-label="首页导航"><a href={pageUrl('/overview/')}>考试总览</a><a href={pageUrl('/timeline/')}>关键时间</a><a className="cover-nav-enter" href={pageUrl('/plan/')}>进入自习室<ArrowUpRight size={14}/></a></nav>
 </header>
 <section className="cover-hero" aria-labelledby="cover-title">
  <p className="cover-eyebrow">2027 备考计划</p>
  <h1 id="cover-title">每一小步，<br/>都通向<span>更好的你。</span></h1>
  <p className="cover-lead">把喧嚣留在窗外，把这一刻留给自己。<br/>不必急于抵达，今天也在向前。</p>
  <div className="cover-actions"><a className="cover-primary" href={pageUrl('/plan/')}>开始今天的学习<ArrowRight size={18}/></a><a className="cover-secondary" href={pageUrl('/overview/')}>了解考试<ArrowUpRight size={16}/></a></div>
 </section>
 <footer className="cover-footer">
  <p className="cover-note">按自己的节奏，慢慢发光。<span>小翁自习室 · 为未来留一段专注的时光</span></p>
  <nav className="cover-dock" aria-label="学习入口">
   <a href={pageUrl('/plan/')}><CalendarDays size={18} strokeWidth={1.5}/><span>学习计划</span><ArrowUpRight size={14}/></a>
   <a href={pageUrl('/mistakes/')}><NotebookPen size={18} strokeWidth={1.5}/><span>错题本</span><ArrowUpRight size={14}/></a>
   <a href={pageUrl('/progress/')}><Sprout size={18} strokeWidth={1.5}/><span>学习记录</span><ArrowUpRight size={14}/></a>
  </nav>
 </footer>
 </main>}
