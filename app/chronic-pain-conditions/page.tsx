import type { Metadata } from 'next'
import Link from 'next/link'
import { CONDITIONS } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Chronic Pain Conditions — Find a Specialist for Your Diagnosis',
  description: 'Browse pain management specialists by condition — lower back pain, CRPS, fibromyalgia, neuropathy, failed back surgery syndrome, and more.',
}

export default function ConditionsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate">Find a Specialist for Your Condition</h1>
        <p className="text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
          Chronic pain takes many forms. Find a board-certified pain management doctor who specializes in treating your specific diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONDITIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/chronic-pain-conditions/${c.slug}`}
            className="card p-6 flex items-center gap-4 group hover:border-navy-200"
          >
            <span className="text-3xl flex-shrink-0">{c.icon}</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate group-hover:text-navy transition-colors">{c.label}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{c.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-navy ml-auto flex-shrink-0 transition-colors" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}
