import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, NotebookPen, Sprout} from 'lucide-react';
import {pageUrl} from '@/lib/urls';
import './cover.css';

export default function Home(){return <main className="cover-page">
 <img className="cover-background" src={pageUrl('/assets/study-corner-oceanfront.webp')} fetchPriority="high" alt="书桌正对打开的落地窗，前方是开阔的大海与海平线，两侧白纱帘轻垂"/>
 <div className="cover-shade" aria-hidden="true"/>
 <header className="cover-header">
  <a className="cover-brand" href={pageUrl('/')} aria-label="小翁自习室首页"><BookOpen size={23} strokeWidth={1.5}/><span>小翁自习室</span></a>
  <nav className="cover-nav" aria-label="首页导航"><a href={pageUrl('/overview/')}>考试总览</a><a href={pageUrl('/timeline/')}>关键时间</a><a className="cover-nav-enter" href={pageUrl('/plan/')}>进入自习室<ArrowUpRight size={14}/></a></nav>
 </header>
 <section className="cover-hero" aria-labelledby="cover-title">
  <p className="cover-eyebrow">2027 备考计划</p>
  <h1 id="cover-title">慢慢来，<br/>你想要的未来<br/><span>正在靠近。</span></h1>
  <p className="cover-lead">忙碌之外，留一点时间给自己。<br/>读一页书，离心里的期待更近一点。</p>
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
