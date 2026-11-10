import { z } from 'zod'
import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { recordAction } from './action-events'
import { DIRECTORY_ACTION_CONFIG as cfg } from './directory-action-config'
export const text=(max:number)=>z.string().trim().max(max).regex(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/)
export const optional=(max:number)=>text(max).nullish().transform(v=>v||null)
export const email=text(254).pipe(z.string().email()).transform(v=>v.toLowerCase())
export const state=z.string().transform(v=>v.toUpperCase()).refine(v=>'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ').includes(v))
export const website=optional(500).refine(v=>{if(!v)return true;try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}})
export const phone=optional(40).refine(v=>!v||(/^[+\d().\s\-xX#]{7,40}$/.test(v)&&v.replace(/\D/g,'').length>=7))
export const list=z.array(text(160)).max(30).default([])
export function stableSlug(name:string,email:string,city:string,state:string){const parts=[name,email,city,state].map(v=>v.trim().toLowerCase().replace(/\s+/g,' '));return (name+'-'+city+'-'+state).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,140)+'-'+createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0,20)}
export type Row=Record<string,unknown>&{slug:string}
export async function persist(store:{insert:(r:Row)=>Promise<{error:any}>,read:(s:string)=>Promise<{data:Record<string,unknown>|null,error:any}>},row:Row){
 const inserted=await store.insert(row)
 if(inserted.error&&inserted.error.code!=='23505')return {status:503,body:{error:'We could not confirm your submission. Keep your entries and retry the same submission.'}}
 const saved=await store.read(row.slug)
 if(saved.error||!saved.data)return {status:inserted.error?.code==='23505'&&!saved.error?409:503,body:{error:'We could not confirm your submission. Keep your entries and retry the same submission.'}}
 if(typeof saved.data.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(saved.data.id))return {status:503,body:{error:'Saved listing identity was not confirmed.'}}
 if(!Object.entries(row).every(([k,v])=>JSON.stringify(saved.data![k])===JSON.stringify(v)))return {status:inserted.error?409:503,body:{error:'An existing submission differs from these details. No existing record was changed. Contact support for a correction.'}}
 return {status:200,body:{success:true,status:'pending_review',duplicate:Boolean(inserted.error)},listingId:String(saved.data.id)}
}
const hits=new Map<string,{n:number,until:number}>()
export function submissionRoute<S extends z.ZodTypeAny>(schema:S,builder:(data:z.infer<S>)=>Row,marker:{field:string,value:string}){
 return async(req:NextRequest)=>{
  const reply=(body:object,status:number)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
  const synthetic=process.env.VERCEL_ENV!=='production'||req.headers.get('x-directory-qa')==='1'
  try{
   if(req.headers.get('origin')!==req.nextUrl.origin)return reply({error:'Submit this form from our website.'},403)
   const now=Date.now();hits.forEach((v,k)=>{if(v.until<=now)hits.delete(k)})
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';const h=hits.get(ip)||{n:0,until:now+3600000};if(hits.size>=5000&&!hits.has(ip))return reply({error:'Submissions are busy. Keep your entries and try later.'},429);h.n++;hits.set(ip,h);if(h.n>5)return reply({error:'Too many attempts. Keep your entries and try later.'},429)
   const reader=req.body?.getReader();if(!reader)return reply({error:'Missing submission.'},400)
   let n=0;const parts:Uint8Array[]=[];while(true){const{done,value}=await reader.read();if(done)break;n+=value.length;if(n>20000){await reader.cancel();return reply({error:'Submission too large.'},413)}parts.push(value)}
   let raw;try{raw=JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{return reply({error:'Invalid submission.'},400)}
   const parsed=schema.safeParse(raw);if(!parsed.success)return reply({error:'Check your contact details, location and selected options. Your entries have been kept.'},400)
   const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SERVICE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
   const recent=await db.from(cfg.table).select('id',{head:true,count:'exact'}).eq(marker.field,marker.value).gte('created_at',new Date(now-3600000).toISOString());if(recent.error)return reply({error:'Submissions are temporarily unavailable. Keep your entries and try later.'},503);if((recent.count??0)>=60)return reply({error:'Submissions are busy. Keep your entries and try later.'},429)
   const row=builder(parsed.data);const result=await persist({insert:async r=>{const{error}=await db.from(cfg.table).insert(r);return{error}},read:async slug=>{const{data,error}=await db.from(cfg.table).select(['id',...Object.keys(row)].join(',')).eq('slug',slug).maybeSingle();return{data:data as Record<string,unknown>|null,error}}},row)
   try{await recordAction(result.status===200?'submission_saved':'submission_failure',result.listingId||null,synthetic,result.status===200?row.slug:undefined)}catch{/* Analytics failure must not replay a saved listing. */}
   return reply(result.body,result.status)
  }catch{return reply({error:'We could not confirm your submission. Keep your entries and retry the same submission.'},503)}
 }
}
