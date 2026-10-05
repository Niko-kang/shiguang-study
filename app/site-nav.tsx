import {pageUrl} from '@/lib/urls';
'use client';
import {useEffect,useRef} from 'react';
import {LayoutGrid,CalendarDays,ChartNoAxesCombined,NotebookPen,ClipboardCheck,Library,Milestone} from 'lucide-react';
const links=[{href:'/overview',label:'总览',icon:LayoutGrid},{href:'/plan',label:'学习计划',icon:CalendarDays},{href:'/progress',label:'学习进度',icon:ChartNoAxesCombined},{href:'/mistakes',label:'错题本',icon:NotebookPen},{href:'/mock-exams',label:'模拟考试',icon:ClipboardCheck},{href:'/books',label:'书单资料',icon:Library},{href:'/timeline',label:'关键时间节点',icon:Milestone}];
export default function SiteNav({active}:{active:string}){const ref=useRef<HTMLElement>(null);useEffect(()=>{const nav=ref.current,item=nav?.querySelector<HTMLElement>('[aria-current=page]');if(nav&&item&&nav.scrollWidth>nav.clientWidth)nav.scrollLeft=Math.max(0,item.offsetLeft-nav.offsetLeft-(nav.clientWidth-item.offsetWidth)/2)},[active]);return <nav ref={ref} className="page-nav unified-nav" aria-label="主要页面">{links.map(({href,label,icon:Icon})=><a href={pageUrl(href)} key={href} aria-current={active===href?'page':undefined}><Icon size={17} strokeWidth={1.7}/><span>{label}</span></a>)}</nav>}
