"use client"
import {Suspense,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
function Content(){
 const params=useSearchParams(),token=params.get('token')??''
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false)
 async function act(){setBusy(true);try{const r=await fetch('/api/newsletter/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const d=await r.json();if(!r.ok)throw Error(d.error??'Request failed');setDone(true);setMessage('You are unsubscribed.')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 return <main className="mx-auto max-w-lg px-4 py-20 text-center"><h1 className="text-2xl font-bold mb-4">Unsubscribe from this newsletter</h1>{!token?<p>This link is missing its confirmation token.</p>:<>{message&&<p role="status" className="my-4">{message}</p>}{!done&&<button type="button" disabled={busy} onClick={act} className="rounded-lg bg-teal-700 px-6 py-3 text-white disabled:opacity-50">{busy?'Please wait…':'Unsubscribe'}</button>}</>}<p className="mt-6"><Link href="/">Return to directory</Link></p></main>
}
export default function Page(){return <Suspense fallback={<p>Loading…</p>}><Content/></Suspense>}
