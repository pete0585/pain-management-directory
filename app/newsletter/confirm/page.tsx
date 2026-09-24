import Link from 'next/link'
import { Suspense } from 'react'

interface Props {
  searchParams: Promise<{ token?: string }>
}

async function ConfirmContent({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid link</h1>
        <p className="text-gray-500">This confirmation link is missing a token. Please check your email for the correct link.</p>
      </div>
    )
  }

  const serviceToken = process.env.NEWSLETTER_SUBMIT_TOKEN
  let success = false
  let alreadyConfirmed = false
  let errorMsg = ''
  let newsletterName = 'The Pain Care Compass Letter'

  try {
    const res = await fetch('https://aidam.thestrategicveteran.com/api/newsletter/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceToken}` },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })
    const data = await res.json()
    if (res.ok) {
      success = true
      alreadyConfirmed = !!data.already_confirmed
      newsletterName = data.newsletter_name ?? newsletterName
    } else {
      errorMsg = data.error ?? 'Confirmation failed.'
    }
  } catch {
    errorMsg = 'Unable to confirm subscription. Please try again.'
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-3">{alreadyConfirmed ? 'Already confirmed!' : 'Subscription confirmed!'}</h1>
        <p className="text-gray-600 mb-6">
          You&apos;re now subscribed to <strong>{newsletterName}</strong>. Your first issue arrives next Thursday.
        </p>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">Return to directory</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="text-4xl mb-4">✗</div>
      <h1 className="text-2xl font-bold mb-3">Confirmation failed</h1>
      <p className="text-gray-500 mb-6">{errorMsg}</p>
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">Return to directory</Link>
    </div>
  )
}

export default function ConfirmPage(props: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center"><p className="text-gray-500">Confirming your subscription...</p></div>}>
      <ConfirmContent {...props} />
    </Suspense>
  )
}
