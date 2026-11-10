'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { DIRECTORY_ACTION_CONFIG as config } from '@/lib/directory-action-config'
export default function DirectoryActions(){
 const pathname=usePathname()
 useEffect(()=>{
  if(!pathname || navigator.doNotTrack==='1')return
  const parts=pathname.split('/').filter(Boolean)
  const slug=parts.length===2 && config.profilePrefixes.includes(parts[0])?parts[1]:null
  let internal=false
  try { internal=sessionStorage.getItem('directory-internal-qa')==='1' } catch { /* blocked storage must not break the page */ }
  const synthetic=navigator.webdriver===true || internal || location.hostname==='localhost'
  function emit(action:string){
   void fetch('/api/directory-actions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...(slug?{slug}:{}),synthetic}),keepalive:true}).catch(()=>{})
  }
  if(slug)emit('profile_view')
  const click=(e:MouseEvent)=>{
   if(!slug)return
   const a=e.target instanceof Element?e.target.closest('a'):null;if(!a)return
   const href=a.getAttribute('href')||''
   if(href.startsWith('tel:'))emit('phone_click')
   else if(a.dataset.directoryAction==='booking_click')emit('booking_click')
   else if(a.dataset.directoryAction==='website_click')emit('website_click')
  }
  let started=false
  const start=()=>{if(!started && pathname?.replace(/\/$/,'')==='/submit'){started=true;emit('submission_start')}}
  document.addEventListener('click',click);document.addEventListener('input',start,{once:true})
  return()=>{document.removeEventListener('click',click);document.removeEventListener('input',start)}
 },[pathname])
 return null
}
