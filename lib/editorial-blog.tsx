import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import type {ReactNode} from 'react'
export interface Article {title:string;slug:string;date:string;excerpt:string;author:string;keyword:string;status:string;aidam_source_sha256:string;body:string}
const root=path.join(process.cwd(),'content','blog')
export function article(slug:string):Article|null{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return null
 const file=path.join(root,slug+'.mdx');if(!fs.existsSync(file))return null
 const raw=fs.readFileSync(file,'utf8');const end=raw.indexOf('\n---\n',4)
 if(!raw.startsWith('---\n')||end<0)return null
 try{const m=JSON.parse(raw.slice(4,end));if(m.status!=='published'||m.slug!==slug||!m.title||!m.excerpt||!/^[a-f0-9]{64}$/.test(m.aidam_source_sha256))return null;return {...m,body:raw.slice(end+5)}}catch{return null}
}
export function articles():Article[]{return fs.existsSync(root)?fs.readdirSync(root).filter(x=>x.endsWith('.mdx')).map(x=>article(x.slice(0,-4))).filter((x):x is Article=>x!==null).sort((a,b)=>b.date.localeCompare(a.date)):[]}
// Deliberately render a Markdown subset as React text, never evaluate MDX or HTML.
function inline(text:string):ReactNode[]{return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^\s)]+\))/g).filter(Boolean).map((t,i)=>{
 if(t.startsWith('**')&&t.endsWith('**'))return <strong key={i}>{t.slice(2,-2)}</strong>
 const m=t.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
 if(m&&(/^(https?:\/\/|\/[^/])/.test(m[2])))return <a key={i} href={m[2]} className="underline underline-offset-4">{m[1]}</a>
 return t
})}
export function ArticleBody({body}:{body:string}){return <div className="space-y-5 leading-8">{body.trim().split(/\n\s*\n/).map((b,i)=>{
 if(/^#{1,4} /.test(b)){const text=b.replace(/^#{1,4} /,'');return <h2 key={i} className="font-serif text-2xl font-semibold pt-5">{inline(text)}</h2>}
 if(b.split('\n').every(x=>/^\s*[-*] /.test(x)))return <ul key={i} className="list-disc pl-6 space-y-2">{b.split('\n').map((x,j)=><li key={j}>{inline(x.replace(/^\s*[-*] /,''))}</li>)}</ul>
 if(b.split('\n').every(x=>/^\s*\d+\. /.test(x)))return <ol key={i} className="list-decimal pl-6 space-y-2">{b.split('\n').map((x,j)=><li key={j}>{inline(x.replace(/^\s*\d+\. /,''))}</li>)}</ol>
 return <p key={i}>{inline(b.replace(/\n/g,' '))}</p>
})}</div>}
