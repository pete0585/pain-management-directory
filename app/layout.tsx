import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'PainManagementFinder.com — Find a Board-Certified Pain Specialist Near You',
    template: '%s | PainManagementFinder.com',
  },
  description:
    'Find board-certified pain management doctors and clinics near you. Filter by specialty, condition, procedure, and VA Community Care acceptance. Free to search — 15,000+ physicians nationwide.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.painmanagementfinder.com'),
  openGraph: {
    siteName: 'PainManagementFinder.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-offwhite">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
