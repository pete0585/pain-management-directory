import Link from 'next/link'
import { Stethoscope } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-navy-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-white mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-base">PainManagementFinder</span>
            </Link>
            <p className="text-sm text-navy-200 leading-relaxed">
              The neutral, patient-facing directory for board-certified pain management specialists. Free to search. No device company bias.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Find Specialists</h3>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link href="/listings" className="hover:text-white transition-colors">Browse All</Link></li>
              <li><Link href="/listings?specialty=interventional-pain" className="hover:text-white transition-colors">Interventional Pain</Link></li>
              <li><Link href="/listings?va=true" className="hover:text-white transition-colors">VA Community Care</Link></li>
              <li><Link href="/listings?accepting=true" className="hover:text-white transition-colors">Accepting New Patients</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Conditions</h3>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link href="/chronic-pain-conditions/lower-back-pain" className="hover:text-white transition-colors">Lower Back Pain</Link></li>
              <li><Link href="/chronic-pain-conditions/crps" className="hover:text-white transition-colors">CRPS / RSD</Link></li>
              <li><Link href="/chronic-pain-conditions/fibromyalgia" className="hover:text-white transition-colors">Fibromyalgia</Link></li>
              <li><Link href="/chronic-pain-conditions/neuropathy" className="hover:text-white transition-colors">Neuropathy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Treatments</h3>
            <ul className="space-y-2 text-sm text-navy-200">
              <li><Link href="/pain-treatments/spinal-cord-stimulation" className="hover:text-white transition-colors">Spinal Cord Stimulation</Link></li>
              <li><Link href="/pain-treatments/radiofrequency-ablation" className="hover:text-white transition-colors">Radiofrequency Ablation</Link></li>
              <li><Link href="/pain-treatments/epidural-injection" className="hover:text-white transition-colors">Epidural Injection</Link></li>
              <li><Link href="/pain-treatments/ketamine-infusion" className="hover:text-white transition-colors">Ketamine Infusion</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-600 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-300">
          <p>&copy; {new Date().getFullYear()} PainManagementFinder.com. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/submit" className="hover:text-white transition-colors">List Your Practice</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
