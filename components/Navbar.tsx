'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search, Stethoscope } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-navy hover:opacity-90 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg leading-tight">
              Pain<span className="text-teal">Management</span>Finder
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/listings" className="hover:text-navy transition-colors">Find a Specialist</Link>
            <Link href="/chronic-pain-conditions" className="hover:text-navy transition-colors">Conditions</Link>
            <Link href="/pain-treatments" className="hover:text-navy transition-colors">Treatments</Link>
            <Link href="/submit" className="btn-teal text-xs px-4 py-2">List Your Practice</Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link href="/listings" className="py-2.5 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-navy" onClick={() => setOpen(false)}>Find a Specialist</Link>
            <Link href="/chronic-pain-conditions" className="py-2.5 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-navy" onClick={() => setOpen(false)}>Conditions</Link>
            <Link href="/pain-treatments" className="py-2.5 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-navy" onClick={() => setOpen(false)}>Treatments</Link>
            <Link href="/submit" className="mt-2 btn-teal w-full text-center" onClick={() => setOpen(false)}>List Your Practice</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
