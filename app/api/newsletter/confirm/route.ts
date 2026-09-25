import {NextResponse} from 'next/server'
export const runtime='nodejs'
export async function POST(req:Request){
 try{
  const url=new URL(req.url),form=(req.headers.get('content-type')??'').includes('application/x-www-form-urlencoded')
  const raw=await req.text();if(Buffer.byteLength(raw)>8192)return NextResponse.json({error:'Request too large'},{status:413})
  const body=form?Object.fromEntries(new URLSearchParams(raw)):JSON.parse(raw)
  if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'Invalid request'},{status:400})
  const token=process.env.NEWSLETTER_SUBMIT_TOKEN
  if(form && (body['List-Unsubscribe']!=='One-Click' || !url.pathname.endsWith('/unsubscribe')))return NextResponse.json({error:'Invalid request'},{status:400})
  const input={token:body.token??url.searchParams.get("token"),niche:"pain-management"}
  const response=await fetch('https://aidam.studiozerohq.com/api/newsletter/confirm',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'X-Newsletter-Client':(req.headers.get('x-forwarded-for')??'unknown').split(',')[0].trim()},body:JSON.stringify(input),cache:'no-store',signal:AbortSignal.timeout(30000)})
  return NextResponse.json(await response.json(),{status:response.status,headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Newsletter request failed; please try again later'},{status:503})}
}
