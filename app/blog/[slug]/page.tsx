import {notFound} from 'next/navigation'
import Link from 'next/link'
import type {Metadata} from 'next'
import {article,articles,ArticleBody} from '@/lib/editorial-blog'
const site="https://findpainmanagement.com"
export const dynamicParams=false
export function generateStaticParams(){return articles().map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=article(slug);return p?{title:p.title,description:p.excerpt,alternates:{canonical:site+'/blog/'+p.slug},openGraph:{title:p.title,description:p.excerpt,type:'article',publishedTime:p.date,url:site+'/blog/'+p.slug}}:{}}
export default async function BlogArticle({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=article(slug);if(!p)notFound();const data={'@context':'https://schema.org','@type':'Article',headline:p.title,description:p.excerpt,datePublished:p.date,author:{'@type':'Organization',name:p.author},url:site+'/blog/'+p.slug};return <section className="mx-auto max-w-3xl px-6 py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/><Link className="underline text-sm" href="/blog">← All articles</Link><h1 className="font-serif text-4xl font-semibold leading-tight my-6">{p.title}</h1><p className="text-sm opacity-70 mb-6">{p.date} · {p.author}</p><p className="text-lg mb-10">{p.excerpt}</p><article data-aidam-source-sha256={p.aidam_source_sha256}><ArticleBody body={p.body}/></article><div className="border-t mt-12 pt-6"><Link className="underline" href="/listings">Explore providers in the directory →</Link></div></section>}
