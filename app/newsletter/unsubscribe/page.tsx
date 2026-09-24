'use client'
import Link from 'next/link'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const niche = searchParams.get('niche') ?? 'pain-management'
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [decoded, setDecoded] = useState('')

  useEffect(() => {
    try { setDecoded(decodeURIComponent(email)) } catch { setDecoded(email) }
  }, [email])

  async function handleUnsubscribe() {
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decoded, niche }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Unsubscribed</h1>
        <p className="text-gray-500 mb-6">You&apos;ve been removed from <strong>The Pain Care Compass Letter</strong>. No more emails from us.</p>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">Return to directory</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">Unsubscribe</h1>
      <p className="text-gray-600 mb-2">
        Unsubscribe <strong>{decoded || 'your email'}</strong> from <strong>The Pain Care Compass Letter</strong>?
      </p>
      <p className="text-sm text-gray-400 mb-8">You won&apos;t receive any further emails from this newsletter.</p>
      {status === 'error' && <p className="text-red-500 text-sm mb-4">Something went wrong. Please try again.</p>}
      <button
        onClick={handleUnsubscribe}
        disabled={status === 'loading'}
        className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Processing...' : 'Yes, unsubscribe me'}
      </button>
      <div className="mt-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">Cancel</Link>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center"><p className="text-gray-500">Loading...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  )
}
