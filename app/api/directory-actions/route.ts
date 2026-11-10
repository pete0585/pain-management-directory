import { NextRequest, NextResponse } from 'next/server'
import { clientActions, publicListing, recordAction } from '@/lib/action-events'
import { DIRECTORY_ACTION_CONFIG as config } from '@/lib/directory-action-config'
const recent = new Map<string,{at:number,n:number}>()
let globalWindow={at:0,n:0}
const answer=(status:number)=>NextResponse.json({recorded:status===200},{status,headers:{'Cache-Control':'no-store'}})
export async function POST(req:NextRequest){
 try{
  if(req.headers.get('origin')!==req.nextUrl.origin || !['https:','http:'].includes(req.nextUrl.protocol))return answer(403)
  if(Number(req.headers.get('content-length')||0)>512)return answer(413)
  const reader=req.body?.getReader();if(!reader)return answer(400)
  let size=0;const parts:Uint8Array[]=[]
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>512){await reader.cancel();return answer(413)}parts.push(value)}
  let body
  try { body=JSON.parse(Buffer.concat(parts).toString('utf8')) } catch { return answer(400) }
  if(!body || Array.isArray(body)||Object.keys(body).some(k=>!['action','slug','synthetic'].includes(k)) || !clientActions.includes(body.action))return answer(400)
  if(body.synthetic!==undefined && typeof body.synthetic!=='boolean')return answer(400)
  const now=Date.now();if(now-globalWindow.at>=60000)globalWindow={at:now,n:0};if(++globalWindow.n>120)return answer(429)
  // Ephemeral abuse control only. IP is never persisted or placed in event data.
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown'
  if(recent.size>2000)recent.clear()
  const bucket=recent.get(ip);const next=bucket&&now-bucket.at<60000?{at:bucket.at,n:bucket.n+1}:{at:now,n:1};recent.set(ip,next);if(next.n>20)return answer(429)
  let id:string|null=null
  if(body.action!=='submission_start'){
   if(typeof body.slug!=='string'||body.slug.length>180||!/^[a-z0-9-]+$/.test(body.slug))return answer(400)
   id=await publicListing(body.slug);if(!id)return answer(404)
  }
  const synthetic=body.synthetic===true || process.env.VERCEL_ENV!=='production'
  return answer(await recordAction(body.action,id,synthetic)?200:503)
 }catch{return answer(503)}
}
