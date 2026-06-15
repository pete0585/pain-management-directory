'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  business_name: z.string().optional(),
  npi_number: z.string().length(10, 'NPI must be 10 digits').regex(/^\d+$/, 'NPI must be numeric').optional().or(z.literal('')),
  specialty_label: z.string().min(1, 'Specialty required'),
  practice_address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().length(2, 'State required'),
  zip: z.string().optional(),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email('Valid email required'),
  website_url: z.string().url('Valid URL required').optional().or(z.literal('')),
  bio: z.string().optional(),
  va_community_care: z.boolean().default(false),
  accepting_new_patients: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

const SPECIALTIES = [
  'Interventional Pain Medicine',
  'Pain Medicine',
  'Anesthesiology: Pain Medicine',
  'Physical Medicine & Rehabilitation: Pain Medicine',
  'Pain Clinic / Center',
]

export default function SubmitForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { va_community_care: false, accepting_new_patients: true },
  })

  async function onSubmit(data: FormValues) {
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-teal-50 border border-teal-100 p-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <h2 className="text-xl font-bold text-slate mb-2">Listing Submitted!</h2>
        <p className="text-gray-500">
          Your practice listing is under review. You&apos;ll receive a confirmation email within 24 hours once approved.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">First Name *</label>
          <input {...register('first_name')} className="input" placeholder="John" />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input {...register('last_name')} className="input" placeholder="Smith" />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Practice / Clinic Name</label>
        <input {...register('business_name')} className="input" placeholder="Advanced Pain Center of Texas" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">NPI Number</label>
          <input {...register('npi_number')} className="input" placeholder="1234567890" />
          {errors.npi_number && <p className="text-xs text-red-500 mt-1">{errors.npi_number.message}</p>}
        </div>
        <div>
          <label className="label">Specialty *</label>
          <select {...register('specialty_label')} className="input">
            <option value="">Select specialty</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.specialty_label && <p className="text-xs text-red-500 mt-1">{errors.specialty_label.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Practice Address *</label>
        <input {...register('practice_address')} className="input" placeholder="123 Medical Drive, Suite 100" />
        {errors.practice_address && <p className="text-xs text-red-500 mt-1">{errors.practice_address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">City *</label>
          <input {...register('city')} className="input" placeholder="Houston" />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="label">State *</label>
          <input {...register('state')} className="input" placeholder="TX" maxLength={2} />
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <label className="label">ZIP</label>
          <input {...register('zip')} className="input" placeholder="77001" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Phone *</label>
          <input {...register('phone')} className="input" type="tel" placeholder="(713) 555-0100" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input {...register('email')} className="input" type="email" placeholder="office@yourpractice.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Website URL</label>
        <input {...register('website_url')} className="input" placeholder="https://www.yourpractice.com" />
        {errors.website_url && <p className="text-xs text-red-500 mt-1">{errors.website_url.message}</p>}
      </div>

      <div>
        <label className="label">Bio / About</label>
        <textarea {...register('bio')} className="input min-h-[100px] resize-y" placeholder="Brief description of your practice, training, and approach to pain management..." />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input {...register('va_community_care')} type="checkbox" className="accent-navy rounded" />
          <span className="text-sm text-slate">I accept VA Community Care patients</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input {...register('accepting_new_patients')} type="checkbox" className="accent-teal rounded" />
          <span className="text-sm text-slate">Currently accepting new patients</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-500 rounded-lg bg-red-50 px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-base disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Free Listing'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Free listings are reviewed within 24 hours. Upgrade to Verified ($149/yr) or Featured ($299/yr) after approval.
      </p>
    </form>
  )
}
