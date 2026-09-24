'use client'

import { Suspense, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ClaimForm() {
  const { id } = useParams<{ id: string }>()
  const token = useSearchParams().get('token')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [verified, setVerified] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(path: string, body: object, success: string) {
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'The request was not completed.')
      if (path.endsWith('/verify')) {
        setVerified(true)
        window.history.replaceState(null, '', `/claim/${id}`)
      }
      setMessage(success)
    } catch (e) { setError(e instanceof Error ? e.message : 'The request failed. Please retry.') }
    finally { setBusy(false) }
  }
  return <main className="mx-auto max-w-lg px-6 py-16">
    <h1 className="text-3xl font-bold mb-4">{verified ? 'Manage your listing' : 'Claim your listing'}</h1>
    <p className="mb-6">Verify the contact email already recorded for your listing. If that email is missing or outdated, contact directory support for an ownership review.</p>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 text-red-900 p-4 mb-4">{error}</p>}
    {message && <p role="status" className="rounded border border-green-300 bg-green-50 text-green-900 p-4 mb-4">{message}</p>}
    {verified ? <form className="space-y-4" onSubmit={e => { e.preventDefault(); void submit('/api/claim/phone', { listingId: id, phone }, 'Phone number saved and verified.') }}>
      <label className="block">Public phone number<input className="block w-full border rounded p-3 mt-2" type="tel" required maxLength={40} value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <button disabled={busy} className="rounded bg-slate-900 text-white px-5 py-3 disabled:opacity-50">{busy ? 'Saving…' : 'Save phone number'}</button>
    </form> : token ? <button disabled={busy} className="rounded bg-slate-900 text-white px-5 py-3 disabled:opacity-50" onClick={() => void submit('/api/claim/verify', { listingId: id, token }, 'Ownership verified. You can now update your phone number.')}>{busy ? 'Verifying…' : 'Confirm ownership'}</button> : <form className="space-y-4" onSubmit={e => { e.preventDefault(); void submit('/api/claim', { listingId: id, email }, 'Verification email accepted. Check your inbox for the confirmation link.') }}>
      <label className="block">Listing contact email<input className="block w-full border rounded p-3 mt-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <button disabled={busy} className="rounded bg-slate-900 text-white px-5 py-3 disabled:opacity-50">{busy ? 'Requesting…' : 'Send verification email'}</button>
    </form>}
    <Link className="block mt-8 underline" href="/">Return to directory</Link>
  </main>
}

export default function ClaimPage() { return <Suspense fallback={<p className="p-8">Loading claim…</p>}><ClaimForm /></Suspense> }
