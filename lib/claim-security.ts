import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'node:crypto'
import { CLAIM_CONFIG } from '@/lib/claim-config'

const COOKIE = '__Host-directory_claim'
const normalize = (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : ''
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)
const failure = (error: string, status: number, code?: string) => NextResponse.json({ error, ...(code ? { code } : {}) }, { status, headers: { 'Cache-Control': 'no-store' } })
const denied = () => failure('Verified ownership is required. Use the listing contact email to verify, or contact support for manual review.', 403)
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  return !origin || origin === req.nextUrl.origin
}
async function bodyOf(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) return Object.fromEntries(await req.formData())
    const value = await req.json()
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null
  } catch { return null }
}
async function authorizedClaim(req: NextRequest, body: Record<string, unknown>, verified: boolean) {
  if (!sameOrigin(req)) return { error: denied() }
  const listingId = body.listingId ?? body.listing_id ?? body.id
  const token = body.token ?? req.cookies.get(COOKIE)?.value
  if (!uuid(listingId) || typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) return { error: denied() }
  const db = await createServiceClient()
  const result = await db.from(CLAIM_CONFIG.claims).select('id,listing_id,email,token,verified,expires_at').eq('token', token).eq('listing_id', listingId).maybeSingle()
  if (result.error) return { error: failure('Ownership verification is temporarily unavailable.', 503, result.error.code) }
  const claim = result.data
  const expiry = Date.parse(claim?.expires_at ?? '')
  if (!claim || !Number.isFinite(expiry) || expiry <= Date.now() || (verified && claim.verified !== true)) return { error: denied() }
  const listing = await db.from(CLAIM_CONFIG.listings).select('id,email').eq('id', listingId).maybeSingle()
  if (listing.error) return { error: failure('Listing verification is temporarily unavailable.', 503, listing.error.code) }
  if (!listing.data || !normalize(listing.data.email) || normalize(listing.data.email) !== normalize(claim.email)) return { error: denied() }
  return { db, claim, listingId, token, expiry }
}

export async function updatePhone(req: NextRequest) {
  try {
    const body = await bodyOf(req)
    if (!body) return failure('Invalid request body.', 400)
    const auth = await authorizedClaim(req, body, true)
    if (auth.error) return auth.error
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    if (!/^[+\d().\s\-xextEXT#]{7,40}$/.test(phone) || phone.replace(/\D/g, '').length < 7) return failure('Enter a valid phone number.', 400)
    const result = await auth.db!.from(CLAIM_CONFIG.listings).update({ phone }).eq('id', auth.listingId!).eq('email', auth.claim!.email).select('id,phone').maybeSingle()
    if (result.error) return failure('Phone update failed.', 503, result.error.code)
    if (!result.data || result.data.phone !== phone) return failure('Phone update was not confirmed. Please verify ownership again.', 409)
    return NextResponse.json({ success: true, listingId: result.data.id, phone: result.data.phone }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return failure('Phone service is temporarily unavailable.', 503) }
}

export async function verifyClaim(req: NextRequest) {
  try {
    const body = await bodyOf(req)
    if (!body) return failure('Invalid request body.', 400)
    const auth = await authorizedClaim(req, body, false)
    if (auth.error) return auth.error
    if (!auth.claim!.verified) {
      const now = new Date().toISOString()
      const patch: Record<string, unknown> = {}
      for (const key of CLAIM_CONFIG.claimedFields) patch[key] = ['claimed', 'is_claimed'].includes(key) ? true : now
      const listing = await auth.db!.from(CLAIM_CONFIG.listings).update(patch).eq('id', auth.listingId!).select('id').maybeSingle()
      if (listing.error) return failure('Listing verification failed.', 503, listing.error.code)
      if (!listing.data) return failure('Listing no longer exists.', 404)
      const saved = await auth.db!.from(CLAIM_CONFIG.claims).update({ verified: true, verified_at: now }).eq('id', auth.claim!.id).eq('token', auth.token!).gt('expires_at', now).select('id').maybeSingle()
      if (saved.error) return failure('Claim verification failed.', 503, saved.error.code)
      if (!saved.data) return denied()
    }
    const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
    response.cookies.set(COOKIE, auth.token!, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: Math.min(1800, Math.floor((auth.expiry! - Date.now()) / 1000)) })
    return response
  } catch { return failure('Claim service is temporarily unavailable.', 503) }
}

// Email link GET is deliberately read-only: mail scanners must not approve claims.
export async function claimLanding(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return denied()
  try {
    const db = await createServiceClient()
    const result = await db.from(CLAIM_CONFIG.claims).select('listing_id,expires_at').eq('token', token).maybeSingle()
    if (result.error) return failure('Claim lookup failed.', 503, result.error.code)
    if (!result.data || !Number.isFinite(Date.parse(result.data.expires_at)) || Date.parse(result.data.expires_at) <= Date.now()) return denied()
    const url = new URL(`/claim/${result.data.listing_id}`, req.url)
    url.searchParams.set('token', token)
    const response = NextResponse.redirect(url)
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('Referrer-Policy', 'no-referrer')
    return response
  } catch { return failure('Claim service is temporarily unavailable.', 503) }
}

export async function requestClaim(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return denied()
    const body = await bodyOf(req)
    if (!body) return failure('Invalid request body.', 400)
    const listingId = body.listingId ?? body.listing_id
    const email = normalize(body.email)
    if (!uuid(listingId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return failure('Valid listing ID and contact email are required.', 400)
    const db = await createServiceClient()
    const listing = await db.from(CLAIM_CONFIG.listings).select('id,email').eq('id', listingId).maybeSingle()
    if (listing.error) return failure('Listing lookup failed.', 503, listing.error.code)
    if (!listing.data || !normalize(listing.data.email) || normalize(listing.data.email) !== email) return denied()
    const recent = await db.from(CLAIM_CONFIG.claims).select('id', { count: 'exact', head: true }).eq('listing_id', listingId).gte('created_at', new Date(Date.now() - 86400000).toISOString())
    if (recent.error) return failure('Claim request check failed.', 503, recent.error.code)
    if ((recent.count ?? 0) >= 5) return failure('Too many requests. Please try again tomorrow.', 429)
    if (!process.env.RESEND_API_KEY) return failure('Verification email service is not configured.', 503)
    const token = randomBytes(32).toString('hex')
    const saved = await db.from(CLAIM_CONFIG.claims).insert({ listing_id: listingId, email: listing.data.email, token, verified: false, expires_at: new Date(Date.now() + 72 * 3600000).toISOString() }).select('id').single()
    if (saved.error) return failure('Claim request could not be saved.', 503, saved.error.code)
    const link = new URL('/api/claim/verify', CLAIM_CONFIG.siteUrl)
    link.searchParams.set('token', token)
    const sent = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `claim/${saved.data.id}` }, body: JSON.stringify({ from: CLAIM_CONFIG.from, to: listing.data.email, subject: 'Verify your directory listing', html: `<p>Confirm ownership of your directory listing to manage its contact information.</p><p><a href="${link.toString()}">Review and verify your listing</a></p><p>This link expires in 72 hours. If you did not request this, ignore this email.</p>` }), signal: AbortSignal.timeout(15000) })
    if (!sent.ok) return failure('Verification email was not accepted by the email provider. Please contact support.', 502)
    const receipt = await sent.json()
    if (!receipt.id) return failure('Verification email delivery was not confirmed.', 502)
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return failure('Claim request is temporarily unavailable.', 503) }
}
