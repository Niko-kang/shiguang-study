import {ArrowUpRight, ArrowRight, BookOpen, CalendarDays, NotebookPen, Sprout} from 'lucide-react';
import {pageUrl} from '@/lib/urls';
import './cover.css';

function StudyIllustration(){return <svg className="cover-illustration" viewBox="0 0 640 650" fill="none" role="img" aria-label="窗边的一张书桌，摊开的书、温热的茶和一盏亮着的台灯">
 <defs>
  <linearGradient id="room" x1="60" y1="0" x2="590" y2="650" gradientUnits="userSpaceOnUse"><stop stopColor="#e9e3ce"/><stop offset="1" stopColor="#d9ddc4"/></linearGradient>
  <linearGradient id="sky" x1="170" y1="80" x2="430" y2="380" gradientUnits="userSpaceOnUse"><stop stopColor="#f6e8bd"/><stop offset="1" stopColor="#e6ead5"/></linearGradient>
  <linearGradient id="desk" x1="70" y1="430" x2="510" y2="595" gradientUnits="userSpaceOnUse"><stop stopColor="#bf8f66"/><stop offset="1" stopColor="#9b7357"/></linearGradient>
  <linearGradient id="paper" x1="230" y1="440" x2="410" y2="530" gradientUnits="userSpaceOnUse"><stop stopColor="#fffdf0"/><stop offset="1" stopColor="#e8ddbf"/></linearGradient>
  <radialGradient id="glow"><stop stopColor="#fff6d0" stopOpacity=".8"/><stop offset="1" stopColor="#fff6d0" stopOpacity="0"/></radialGradient>
  <clipPath id="window"><path d="M149 337V183a134 134 0 0 1 268 0v154Z"/></clipPath>
 </defs>
 <rect x="26" y="16" width="588" height="602" rx="290" fill="url(#room)"/>
 <path d="M26 411h588v-80L408 240Z" fill="#fbf7dd" opacity=".36"/>
 <path d="M139 343V183a144 144 0 0 1 288 0v160Z" fill="#778b76"/>
 <path d="M149 337V183a134 134 0 0 1 268 0v154Z" fill="url(#sky)"/>
 <g clipPath="url(#window)">
  <circle cx="340" cy="152" r="39" fill="#fff9de"/>
  <path d="M120 287c71-85 144-59 205-3s88-20 142-38v128H120Z" fill="#b4c3a4"/>
  <path d="M111 324c108-82 181-62 262-9s107-13 126-24v99H111Z" fill="#819e82"/>
  <path d="M126 357c112-28 189-16 310-43v65H126Z" fill="#6c8b74"/>
  <path d="m202 157 8-4 8 4m28-29 7-4 7 4" stroke="#8e9c85" strokeWidth="2" strokeLinecap="round"/>
 </g>
 <path d="M283 50v288M149 214h268" stroke="#e8e8cf" strokeWidth="7"/>
 <path d="M283 50v288M149 214h268" stroke="#758c78" strokeWidth="1.5" opacity=".4"/>
 <path d="M135 341h297v12H135Z" fill="#f8f1d8"/><path d="M141 353h286v7H141Z" fill="#a4af90"/>
 <path d="m151 360-36 118h283l25-118Z" fill="#fcf2cf" opacity=".25"/>
 <ellipse cx="331" cy="558" rx="251" ry="37" fill="#557665" opacity=".12"/>
 <path d="M76 453h468l-20 121H101Z" fill="#a77e5e"/>
 <path d="M75 451 477 408l105 101-459 35Z" fill="url(#desk)"/>
 <path d="m123 544 459-35v13l-459 35-48-94v-12Z" fill="#906b50"/>
 <path d="m130 557 10 62m378-92-7 59" stroke="#7f644e" strokeWidth="13"/>
 <path d="m143 478 317-27m-291 56 339-26" stroke="#d8b28b" strokeWidth="1.5" opacity=".35"/>
 <ellipse cx="424" cy="441" rx="50" ry="13" fill="#795e49" opacity=".18"/>
 <ellipse cx="437" cy="425" rx="43" ry="11" fill="#3e6354"/>
 <ellipse cx="437" cy="421" rx="43" ry="10" fill="#587b63"/>
 <path d="M437 419V303l-64-62" stroke="#365b4d" strokeWidth="9" strokeLinejoin="round"/>
 <circle cx="437" cy="302" r="9" fill="#c4b086"/><circle cx="373" cy="241" r="7" fill="#c4b086"/>
 <ellipse cx="360" cy="335" rx="98" ry="88" fill="url(#glow)"/>
 <path d="M338 229c-17 5-31 23-36 47l81 19c7-24 2-46-12-58Z" fill="#3f6653"/>
 <path d="M333 236c-10 9-17 23-19 36" stroke="#78937a" strokeWidth="3" strokeLinecap="round"/>
 <ellipse cx="343" cy="286" rx="43" ry="9" transform="rotate(13 343 286)" fill="#d8cbaa"/>
 <ellipse cx="343" cy="286" rx="32" ry="5" transform="rotate(13 343 286)" fill="#fff3bd"/>
 <ellipse cx="183" cy="443" rx="44" ry="10" fill="#6e5642" opacity=".18"/>
 <path d="m144 424 69-8 15 16-70 9Z" fill="#e9dfc1"/><path d="m158 441 70-9v9l-70 9-14-17v-9Z" fill="#47664f"/>
 <path d="m143 410 63-8 16 14-65 8Z" fill="#caac81"/><path d="m157 424 65-8v8l-65 8-14-14v-8Z" fill="#b58b60"/>
 <path d="m147 404 56-7 8 7-57 8Z" fill="#f5eccf"/><path d="m154 412 57-8v5l-57 8-7-8v-5Z" fill="#6e8267"/>
 <ellipse cx="339" cy="505" rx="98" ry="13" fill="#6d5843" opacity=".19"/>
 <path d="m223 473 70-25 31 10 68-8 56 45-107 36Z" fill="#476452"/>
 <path d="m229 469 62-24c11-1 23 2 34 8 24-9 43-9 63-6l51 45-105 32Z" fill="url(#paper)"/>
 <path d="m230 469 97 48 7 7-101-46Z" fill="#d3c7a6"/>
 <path d="m325 453 9 71m-84-55 41-14m-33 22 43-14m-30 20 42-14m-28 21 36-12m16-17 39-5m-32 12 44-6m-33 14 43-7m-32 14 45-8" stroke="#aaa78b" strokeWidth="1.5" opacity=".55"/>
 <path d="m338 502 17 13 1 22-10-6-7 5Z" fill="#b56e4e"/>
 <path d="m247 502-36 18" stroke="#3b5949" strokeWidth="5" strokeLinecap="round"/><path d="m211 520-8 5 4-8Z" fill="#e6c896"/>
 <ellipse cx="484" cy="472" rx="28" ry="9" fill="#826248" opacity=".2"/>
 <ellipse cx="483" cy="466" rx="31" ry="9" fill="#f2e8ce"/>
 <path d="M495 436c27-7 24 23 1 17" stroke="#eae0c7" strokeWidth="7"/>
 <path d="M461 435h40l-3 26c-3 10-29 10-33 0Z" fill="#f9efd6"/>
 <ellipse cx="481" cy="435" rx="20" ry="7" fill="#d8c7a0"/><ellipse cx="481" cy="436" rx="16" ry="4" fill="#a17f54"/>
 <path d="M476 419c-11-13 10-18 0-31m13 27c-8-9 7-15 1-24" stroke="#fffaf0" strokeWidth="2.5" strokeLinecap="round" opacity=".8"/>
 <path d="M542 398c-3-40 1-80 16-119m-15 89-28-49m34 18 26-24" stroke="#667d57" strokeWidth="3"/>
 <path d="M550 310c-12-33 4-49 27-53 0 24-5 43-27 53Zm-14 40c-30-4-41-21-40-44 28 6 42 19 40 44Zm12-10c6-26 22-33 45-27-11 22-26 32-45 27Zm-9 37c-24-1-36-11-40-29 22-2 40 12 40 29Z" fill="#81936a"/>
 <path d="M522 394h43l-6 41c-7 8-23 8-30 0Z" fill="#b98462"/><ellipse cx="543" cy="394" rx="22" ry="6" fill="#d09b73"/>
 <path d="M94 290c13-1 22-10 23-23 1 13 10 22 23 23-13 1-22 10-23 23-1-13-10-22-23-23Z" fill="#f7f3d9"/>
 <circle cx="491" cy="181" r="3" fill="#b49b71"/><circle cx="108" cy="375" r="2" fill="#9ba47f"/>
 </svg>}

export default function Home(){return <main className="cover-page">
 <header className="cover-header"><a className="cover-brand" href={pageUrl('/')} aria-label="小翁自习室首页"><span className="cover-brand-symbol"><BookOpen size={23} strokeWidth={1.5}/></span><span>小翁自习室<small>留一点时间，给未来的自己</small></span></a><a className="cover-header-link" href={pageUrl('/overview/')}>考试总览<ArrowUpRight size={16}/></a></header>
 <section className="cover-hero" aria-labelledby="cover-title"><div className="cover-copy"><p className="cover-eyebrow"><span/>2027 · 给自己一个新的可能</p><h1 id="cover-title">慢慢来，<br/>也在<span className="cover-emphasis">向前走。</span></h1><p className="cover-lead">忙完一天，也别忘了为自己留一盏灯。<br/>不必每天满分，今天多学一点，就很好。</p><div className="cover-actions"><a className="cover-primary" href={pageUrl('/plan/')}>开始今天的学习<ArrowRight size={19}/></a><a className="cover-secondary" href={pageUrl('/timeline/')}>看看备考安排<ArrowUpRight size={16}/></a></div><div className="cover-note"><Sprout size={19} strokeWidth={1.4}/><p>累了就歇一歇，调整好了再出发。<br/><span>你的每一小步，都算数。</span></p></div></div>
 <div className="cover-art"><div className="cover-art-label">为自己，留一盏灯</div><StudyIllustration/><div className="cover-art-caption"><span className="cover-caption-line"/><p>一页书，一盏灯。<br/><b>日子会慢慢有回响。</b></p><span className="cover-art-year">2027</span></div></div></section>
 <section className="cover-paths" aria-label="从这里开始"><a href={pageUrl('/plan/')}><span className="cover-path-number">01</span><div><h2>把今天安排好</h2><p>每周有方向，每天走一小步</p></div><CalendarDays size={23} strokeWidth={1.25}/><ArrowUpRight className="cover-path-arrow" size={19}/></a><a href={pageUrl('/mistakes/')}><span className="cover-path-number">02</span><div><h2>让不会的慢慢变少</h2><p>记下错题，也记下新的理解</p></div><NotebookPen size={23} strokeWidth={1.25}/><ArrowUpRight className="cover-path-arrow" size={19}/></a><a href={pageUrl('/progress/')}><span className="cover-path-number">03</span><div><h2>看见自己的积累</h2><p>每一份认真，都值得被记住</p></div><Sprout size={23} strokeWidth={1.25}/><ArrowUpRight className="cover-path-arrow" size={19}/></a></section>
 <footer className="cover-footer"><span>小翁自习室 · 2027 备考计划</span><p>你只管认真，时间会替你作答。</p><span className="cover-footer-flower" aria-hidden="true">✳</span></footer>
 </main>}
