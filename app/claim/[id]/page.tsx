'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ClaimPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listingId, setListingId] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'sent' | 'verifying' | 'verified' | 'error'>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [listingSlug, setListingSlug] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneSaved, setPhoneSaved] = useState(false)

  useEffect(() => {
    params.then(({ id }) => {
      setListingId(id)
      const token = searchParams.get('token')
      const verified = searchParams.get('verified')

      if (token) {
        setStep('verifying')
        fetch('/api/claim/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: id, token }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.slug) setListingSlug(data.slug)
            if (data.success) {
              setStep('verified')
            } else {
              setErrorMsg(data.error ?? 'Verification failed')
              setStep('error')
            }
          })
          .catch(() => {
            setErrorMsg('Network error. Please try again.')
            setStep('error')
          })
      } else if (verified === 'true') {
        setStep('verified')
      }
    })
  }, [params, searchParams])

  async function handleSendVerification(e: React.FormEvent) {
    e.preventDefault()
    if (!listingId) return
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send verification')
      setStep('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function savePhone(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return
    setLoading(true)
    try {
      await fetch('/api/claim/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, phone }),
      })
      setPhoneSaved(true)
    } catch {
      setPhoneSaved(true)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verifying') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 text-teal animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="text-slate font-medium">Verifying your listing...</p>
      </div>
    )
  }

  if (step === 'verified') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="h-14 w-14 text-teal mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate mb-2">Listing Verified!</h1>
        <p className="text-gray-500 mb-8">
          Your listing is now claimed. Your contact details are now visible to everyone who finds you.
        </p>
        {/* Studio Zero upsell */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-blue-900 mb-1">
            Want to attract more patients?
          </h2>
          <p className="text-sm text-blue-700 mb-3">
            Studio Zero helps healthcare providers grow their practice with AI-powered marketing — content, SEO, and visibility that compounds over time.
          </p>
          <a
            href="https://studiozerohq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-blue-700 underline hover:opacity-80"
          >
            Learn more at Studio Zero →
          </a>
        </div>

        <div className="flex flex-col gap-4">
          {listingSlug && (
            <Link href={`/doctor/${listingSlug}`} className="text-sm text-gray-400 hover:text-navy">
              View my listing →
            </Link>
          )}
        </div>
      </div>
    )
  }


  if (step === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-slate mb-2">Verification Failed</h1>
        <p className="text-gray-500 mb-6">{errorMsg || 'This link may have expired or already been used.'}</p>
        <button onClick={() => setStep('form')} className="btn-secondary">Try Again</button>
      </div>
    )
  }

  if (step === 'sent') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-slate mb-2">Check Your Email</h1>
        <p className="text-gray-500">
          We sent a verification link to <strong>{email}</strong>. Click it to claim your listing. The link expires in 72 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate mb-2">Claim This Listing</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Enter the email address associated with this practice. We&apos;ll send a verification link.
        </p>

        <form onSubmit={handleSendVerification} className="flex flex-col gap-4">
          <div>
            <label className="label">Practice Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="office@yourpractice.com"
              required
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500 rounded-lg bg-red-50 px-4 py-3">{errorMsg}</p>}

          <button type="submit" disabled={loading || !email} className="btn-primary py-3.5 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Verification Email'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Free to claim. No credit card required.
        </p>
      </div>
    </div>
  )
}
