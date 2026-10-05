import {z} from 'zod';
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'日期无效');
const short=z.string().trim().max(160);
const note=z.string().trim().max(6000);
export const subjects=['数学','逻辑','管综写作','英语'] as const;
export const mistakeSchema=z.object({date:day,subject:z.enum(subjects),source:short.min(1),question:note.min(1),myAnswer:note,answer:note,reason:z.enum(['知识点不熟','审题失误','计算失误','推理错误','词句不懂','时间不足','其他']),correction:note,status:z.enum(['待订正','待复习','已掌握']),nextReview:z.union([day,z.literal('')])});
export const sections={管综:[['数学',75],['逻辑',60],['论证有效性分析',30],['论说文',35]],英语:[['完形',10],['阅读',40],['新题型',10],['翻译',15],['小作文',10],['大作文',15]]} as const;
export const examSchema=z.object({date:day,title:short.min(1),subject:z.enum(['管综','英语']),minutes:z.number().min(0).max(600).nullable(),scores:z.array(z.number().min(0).nullable()),review:note,nextStep:note}).superRefine((v,ctx)=>{const parts=sections[v.subject];if(v.scores.length!==parts.length||v.scores.some((s,i)=>s!==null&&(!parts[i]||s>parts[i][1])))ctx.addIssue({code:z.ZodIssueCode.custom,message:'分项成绩超出范围'});});
export type Mistake=z.infer<typeof mistakeSchema>;
export type Exam=z.infer<typeof examSchema>;
export type Entry<T>={id:string;data:T;version:number;archived:boolean;updatedAt:string};
export function totalScore(e:Exam){return e.scores.some(s=>s===null)?null:e.scores.reduce<number>((a,s)=>a+(s??0),0)}
export function localDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
