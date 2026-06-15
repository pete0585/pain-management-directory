import type { Metadata } from 'next'
import SubmitForm from '@/components/SubmitForm'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'List Your Pain Management Practice — Free',
  description: 'Add your pain management practice to PainManagementFinder.com. Free basic listing. Upgrade to Verified ($149/yr) or Featured ($299/yr) for priority placement.',
}

const BENEFITS = [
  'Free basic listing — no credit card required',
  'Appear in city-based and specialty-based searches',
  'Verified listing ($149/yr): photo, bio, procedures listed, priority placement',
  'Featured listing ($299/yr): top placement in your city + VA Community Care badge',
  '1 new patient covers your listing cost in the first visit',
]

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        {/* Left: pitch */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-slate mb-4">List Your Practice on PainManagementFinder</h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            Pain management patients are among the highest-intent searchers in healthcare.
            They&apos;ve often been dealing with chronic pain for years — when they find a specialist,
            they call immediately. A listing here costs less than one epidural copay.
          </p>

          <ul className="flex flex-col gap-3 mb-8">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>

          <div id="pricing" className="rounded-2xl bg-navy-50 border border-navy-100 p-5">
            <h3 className="text-sm font-semibold text-slate mb-3">Listing Tiers</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <span className="badge-free mt-0.5">Free</span>
                <p className="text-xs text-gray-500">Basic profile from public NPI data. Appears in search. No photo or bio.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="badge-verified mt-0.5">$149/yr</span>
                <p className="text-xs text-gray-500">Photo, bio, procedures listed, insurance, accepting patients status, priority placement above free listings.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="badge-featured mt-0.5">$299/yr</span>
                <p className="text-xs text-gray-500">Everything in Verified + top-of-results in your city, highlighted badge, VA Community Care filter visibility.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate mb-6">Submit Your Free Listing</h2>
            <SubmitForm />
          </div>
        </div>
      </div>
    </div>
  )
}
