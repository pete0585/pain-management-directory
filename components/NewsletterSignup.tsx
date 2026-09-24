'use client'

import { useState } from 'react'

interface Props {
  compact?: boolean
}

export default function NewsletterSignup({ compact = false }: Props) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), first_name: firstName.trim() || undefined }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setStatus('duplicate')
      } else if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Unable to subscribe. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success' || status === 'duplicate') {
    return (
      <div className={compact ? 'py-2' : 'py-4 text-center'}>
        <p className={compact ? 'text-sm text-green-700' : 'text-green-700 font-medium'}>
          {status === 'duplicate'
            ? 'Already subscribed! Check your inbox.'
            : 'Check your inbox to confirm your subscription.'}
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">The Pain Care Compass Letter</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className="flex-1 rounded-md px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="rounded-md px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-8 max-w-xl mx-auto text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-1">The Pain Care Compass Letter</h2>
      <p className="text-sm text-gray-500 mb-6">Weekly chronic pain management insights, delivered Thursday</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name (optional)"
            disabled={status === 'loading'}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === 'loading'}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="w-full rounded-lg bg-teal-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe — it\'s free'}
        </button>
      </form>
      <p className="mt-3 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
    </div>
  )
}
