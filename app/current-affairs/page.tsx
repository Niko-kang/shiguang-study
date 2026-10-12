import {useEffect,useState} from 'react';
import {Newspaper,ArrowUpRight,Clock3,RefreshCw} from 'lucide-react';
import SiteHeader from '../site-header';
import SiteNav from '../site-nav';
import SiteFooter from '../site-footer';
import './style.css';
type Story={id:string;title:string;category:string;publishedAt:string;eventDate:string;summary:string;perspective:string;question:string;hints:string[];source:string;url:string};
type Edition={date:string;intro:string;stories:Story[]};
type Feed={updatedAt:string;editions:Edition[]};
export default function CurrentAffairs(){
 const [feed,setFeed]=useState<Feed|null>(null),[selected,setSelected]=useState(''),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const c=new AbortController();const timeout=setTimeout(()=>c.abort(),15000);setError('');fetch(`${import.meta.env.BASE_URL}data/current-affairs.json`,{cache:'no-store',signal:c.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then((f:Feed)=>{if(!Array.isArray(f.editions)||!f.editions.length)throw Error();setFeed(f);setSelected(f.editions[0].date)}).catch(()=>{if(!c.signal.aborted||!feed)setError('内容暂时未能加载，请稍后重试。')}).finally(()=>clearTimeout(timeout));return()=>{clearTimeout(timeout);c.abort()}},[attempt]);
 const edition=feed?.editions.find(e=>e.date===selected);const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 return <main className="shell affairs-shell"><SiteHeader/><SiteNav active="/current-affairs"/><div className="affairs-content"><section className="affairs-hero"><div><p className="affairs-eyebrow"><Newspaper size={16}/> 每日时政 · MPA 积累</p><h1>看见变化，理解治理。</h1><p>每天一点，读懂新闻背后的公共问题。</p></div><span className="affairs-reading"><Clock3 size={17}/>约 5 分钟</span></section>
 <div className="affairs-meta"><span>{feed?`最近更新 ${feed.updatedAt.replace('T',' ').slice(0,16)} · 北京时间`:'正在读取精选…'}</span>{feed&&<label>阅读日期 <select aria-label="阅读日期" value={selected} onChange={e=>setSelected(e.target.value)}>{feed.editions.map(e=><option key={e.date} value={e.date}>{e.date}</option>)}</select></label>}</div>
 {error&&<div className="affairs-empty" role="alert">{error}<button onClick={()=>setAttempt(a=>a+1)}><RefreshCw size={15}/>重新加载</button></div>}
 {edition&&<><div className="affairs-intro"><b>{edition.date===today?'本日精选':'精选归档'} · {edition.date}</b><p>{edition.intro}</p>{feed!.editions[0].date<today&&<p>今日内容尚未更新，可先阅读最近一期。</p>}</div><div className="affairs-list">{edition.stories.map((s,i)=><article className="affairs-card" key={s.id}><div className="affairs-card-top"><span className="affairs-number">{String(i+1).padStart(2,'0')}</span><span className="affairs-tag">{s.category}</span></div><h2>{s.title}</h2><p className="affairs-date">报道日期 {s.publishedAt} · 事件 / 政策时间：{s.eventDate}</p><p className="affairs-summary">{s.summary}</p><div className="affairs-angle"><b>公共管理视角 · 学习解读</b><p>{s.perspective}</p></div><details className="affairs-question"><summary><span>想一想：{s.question}</span><span aria-hidden="true">＋</span></summary><ul>{s.hints.map(h=><li key={h}>{h}</li>)}</ul></details><a className="affairs-source" href={s.url} target="_blank" rel="noreferrer">{s.source} · 阅读原文<ArrowUpRight size={16}/></a></article>)}</div></>}
 <aside className="affairs-note">初试前轻量积累，系统政治复习放在初试后。以上解读与思考题用于学习，不是官方考试范围或押题；2027 年复试以学校通知为准。历史内容按原发布日期保留。</aside></div><SiteFooter/></main>
}
