'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SPECIALTIES, CONDITIONS, PROCEDURES } from '@/lib/types'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
  }

  function clearAll() {
    router.push('/listings')
  }

  const state = searchParams.get('state') ?? ''
  const specialty = searchParams.get('specialty') ?? ''
  const condition = searchParams.get('condition') ?? ''
  const procedure = searchParams.get('procedure') ?? ''
  const va = searchParams.get('va') ?? ''
  const accepting = searchParams.get('accepting') ?? ''
  const tier = searchParams.get('tier') ?? ''

  const hasFilters = !!(state || specialty || condition || procedure || va || accepting || tier)

  const filterContent = (
    <div className="flex flex-col gap-5">
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium self-start"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      )}

      {/* State */}
      <div>
        <label className="label text-xs uppercase tracking-wide text-gray-400">State</label>
        <select
          value={state}
          onChange={(e) => update('state', e.target.value || null)}
          className="input text-sm py-2"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Specialty */}
      <div>
        <label className="label text-xs uppercase tracking-wide text-gray-400">Specialty</label>
        <div className="flex flex-col gap-1.5">
          {SPECIALTIES.slice(0, 5).map((s) => (
            <label key={s.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="specialty"
                value={s.slug}
                checked={specialty === s.slug}
                onChange={() => update('specialty', specialty === s.slug ? null : s.slug)}
                className="accent-teal"
              />
              <span className="text-sm text-gray-600 group-hover:text-navy transition-colors">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Special filters */}
      <div>
        <label className="label text-xs uppercase tracking-wide text-gray-400">Special Filters</label>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={va === 'true'}
              onChange={(e) => update('va', e.target.checked ? 'true' : null)}
              className="accent-navy rounded"
            />
            <span className="text-sm text-gray-600 group-hover:text-navy">🎖️ VA Community Care</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepting === 'true'}
              onChange={(e) => update('accepting', e.target.checked ? 'true' : null)}
              className="accent-teal rounded"
            />
            <span className="text-sm text-gray-600 group-hover:text-navy">✅ Accepting New Patients</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={tier === 'featured'}
              onChange={(e) => update('tier', e.target.checked ? 'featured' : null)}
              className="accent-amber rounded"
            />
            <span className="text-sm text-gray-600 group-hover:text-navy">⭐ Featured Listings Only</span>
          </label>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="label text-xs uppercase tracking-wide text-gray-400">Condition</label>
        <select
          value={condition}
          onChange={(e) => update('condition', e.target.value || null)}
          className="input text-sm py-2"
        >
          <option value="">Any Condition</option>
          {CONDITIONS.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </div>

      {/* Procedure */}
      <div>
        <label className="label text-xs uppercase tracking-wide text-gray-400">Treatment / Procedure</label>
        <select
          value={procedure}
          onChange={(e) => update('procedure', e.target.value || null)}
          className="input text-sm py-2"
        >
          <option value="">Any Treatment</option>
          {PROCEDURES.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
        </select>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-navy shadow-soft"
        >
          <Filter className="h-4 w-4" />
          Filters {hasFilters && <span className="ml-1 rounded-full bg-teal text-white text-xs px-1.5 py-0.5">Active</span>}
        </button>
        {mobileOpen && (
          <div className="mt-3 rounded-2xl bg-white border border-gray-100 p-5 shadow-card">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-24">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-slate mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-teal" /> Filter Specialists
          </h3>
          {filterContent}
        </div>
      </div>
    </>
  )
}
