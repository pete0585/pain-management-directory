'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

interface Props {
  size?: 'default' | 'large'
  defaultCity?: string
  defaultState?: string
}

export default function SearchBar({ size = 'default', defaultCity = '', defaultState = '' }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultCity)
  const [state, setState] = useState(defaultState)

  const US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY','DC',
  ]

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('city', query.trim())
    if (state) params.set('state', state)
    router.push(`/listings?${params.toString()}`)
  }

  const isLarge = size === 'large'

  return (
    <form onSubmit={handleSearch} className={`flex w-full max-w-2xl ${isLarge ? 'flex-col sm:flex-row' : 'flex-row'} gap-2`}>
      <div className={`relative flex-1 ${isLarge ? '' : ''}`}>
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="City or doctor name..."
          className={`w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-slate placeholder:text-gray-400 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors ${isLarge ? 'py-4 text-base' : 'py-2.5 text-sm'}`}
        />
      </div>

      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className={`rounded-xl border border-gray-200 bg-white text-slate focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors ${isLarge ? 'py-4 px-4 text-base' : 'py-2.5 px-3 text-sm'}`}
      >
        <option value="">All States</option>
        {US_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button
        type="submit"
        className={`flex items-center justify-center gap-2 rounded-xl bg-navy text-white font-semibold hover:bg-navy-600 transition-colors ${isLarge ? 'px-8 py-4 text-base' : 'px-4 py-2.5 text-sm'}`}
      >
        <Search className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
        {isLarge && <span>Search</span>}
      </button>
    </form>
  )
}
