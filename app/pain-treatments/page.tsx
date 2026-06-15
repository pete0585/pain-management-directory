import type { Metadata } from 'next'
import Link from 'next/link'
import { PROCEDURES } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pain Treatments & Procedures — Find a Specialist',
  description: 'Find pain management doctors who perform specific procedures — spinal cord stimulation, radiofrequency ablation, epidural injections, ketamine infusion, and more.',
}

export default function TreatmentsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate">Pain Treatments & Procedures</h1>
        <p className="text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
          Know what treatment you need? Find a board-certified pain management doctor who specifically performs it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PROCEDURES.map((p) => (
          <Link
            key={p.slug}
            href={`/pain-treatments/${p.slug}`}
            className="card p-6 flex items-center gap-4 group hover:border-teal-200"
          >
            <span className="text-3xl flex-shrink-0">{p.icon}</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate group-hover:text-teal transition-colors">{p.label}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{p.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-teal ml-auto flex-shrink-0 transition-colors" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}
