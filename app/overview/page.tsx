import {pageUrl} from '@/lib/urls';
import {BookOpen,ArrowRight,Clock3,Calculator,Network,PenLine,Languages,ScanText,FileText,CalendarDays,NotebookPen,Library,Info} from 'lucide-react';
import SiteNav from '../site-nav';
import SiteHeader from '../site-header';
import SiteFooter from '../site-footer';
export const metadata={title:'总览 · 拾光自习室'};
const subjects=[
 {code:'199',name:'管理类综合能力',short:'管综',score:200,tone:'management',parts:[
  {name:'数学基础',score:75,icon:Calculator,text:'算术、代数、几何、数据分析。',detail:'问题求解15题＋条件充分性判断10题，每题3分。'},
  {name:'逻辑推理',score:60,icon:Network,text:'理解信息、判断关系、分析推理与评价论证。',detail:'30道选择题，每题2分。'},
  {name:'写作',score:65,icon:PenLine,text:'论证有效性分析30分：找出论证中的问题。',detail:'论说文35分：围绕材料提出观点并展开论述。'}]},
 {code:'204',name:'英语（二）',short:'英语',score:100,tone:'english',parts:[
  {name:'英语知识运用',score:10,icon:Languages,text:'完形填空，考查词汇、语法和上下文理解。',detail:'20题，共10分。'},
  {name:'阅读理解',score:50,icon:BookOpen,text:'理解主旨、细节、推断与文章结构。',detail:'四篇阅读40分＋新题型10分。'},
  {name:'翻译',score:15,icon:ScanText,text:'将一段英文译为中文。',detail:'准确理解原意，并用通顺的中文表达。'},
  {name:'写作',score:25,icon:FileText,text:'小作文10分：书信、通知等应用文。',detail:'大作文15分：根据图表等材料写短文。'}]}
];
const entries=[{href:'/plan',title:'学习计划',text:'每周目标与每天的练习任务',icon:NotebookPen},{href:'/timeline',title:'关键时间节点',text:'报名、考试、复试与入学安排',icon:CalendarDays},{href:'/books',title:'书单资料',text:'推荐用书、版本与使用方法',icon:Library}];
export default function Overview(){return <main className="shell overview-shell">
<SiteHeader/>
<SiteNav active="/overview"/>
<section className="overview-canvas">
<div className="overview-intro"><div><p className="overview-kicker"><span/>初试总览</p><h1>考什么</h1><p className="overview-lead">管综与英语（二），两门科目的内容与分值一页看清。</p></div><div className="exam-summary"><div><strong>2</strong><span>门科目</span></div><div><strong>300</strong><span>初试总分</span></div><div><strong>3<small>小时</small></strong><span>每门考试时长</span></div></div></div>
<div className="exam-subject-grid">{subjects.map(s=><article key={s.code} className={'exam-subject '+s.tone} aria-labelledby={'subject-'+s.code}>
<header className="exam-subject-head"><div><p className="exam-code">{s.code}<span>科目代码</span></p><h2 id={'subject-'+s.code}>{s.name}</h2><p className="exam-duration"><Clock3 size={14}/>考试时长 3 小时</p></div><div className="exam-score"><strong>{s.score}</strong><span>分</span></div></header>
<div className="exam-distribution" aria-label={s.parts.map(p=>`${p.name}${p.score}分`).join('，')}>{s.parts.map((p,i)=><span key={p.name} className={'segment segment-'+i} style={{flex:p.score}} title={`${p.name} ${p.score}分`}/>)}</div>
<div className="exam-parts">{s.parts.map(p=><section className="exam-part" key={p.name}><span className="exam-part-icon"><p.icon size={19} strokeWidth={1.7}/></span><div><div className="exam-part-title"><h3>{p.name}</h3><span>{p.score}<small>分</small></span></div><p>{p.text}</p><p className="part-detail">{p.detail}</p></div></section>)}</div>
</article>)}</div>
<aside className="exam-reminder"><span className="reminder-icon"><Info size={20}/></span><div><h2>初试先准备这两门</h2><p>思想政治理论放在复试考核。复试还需准备公共管理相关知识、英语听说与综合面试，具体科目及形式以学校当年复试通知为准。</p></div><span className="reminder-tag">复试另作安排</span></aside>
<p className="overview-footnote">以上为现行初试科目与题型结构，具体要求以当年考试大纲及学校招生目录为准。</p>
<div className="overview-destinations">{entries.map(e=><a href={pageUrl(e.href)} key={e.href}><span className="destination-icon"><e.icon size={22} strokeWidth={1.6}/></span><div><h2>{e.title}</h2><p>{e.text}</p></div><ArrowRight size={18} className="destination-arrow"/></a>)}</div>
</section><SiteFooter/></main>}
