import { permanentRedirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params
  permanentRedirect(`/listings/${slug}`)
}
