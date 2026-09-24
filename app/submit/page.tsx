import { Suspense } from 'react'
import SubmitForm from '@/components/SubmitForm'

export default function SubmitPage() { return <main className="max-w-3xl mx-auto px-6 py-12"><h1 className="text-3xl font-bold mb-4">Add your free listing</h1><p className="mb-8">List your practice at no charge. Public contact details and profile information are available to everyone. Submissions are reviewed for accuracy.</p><Suspense fallback={<p>Loading form…</p>}><SubmitForm /></Suspense></main> }
