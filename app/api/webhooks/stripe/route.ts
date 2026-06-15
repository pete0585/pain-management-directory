import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const listingId = session.metadata?.listing_id
    const tier = session.metadata?.tier

    if (listingId && tier) {
      const tierRank = tier === 'featured' ? 2 : 1
      const planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

      await Promise.all([
        supabase
          .from('pm_listings')
          .update({
            listing_tier: tier,
            listing_tier_rank: tierRank,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan_expires_at: planExpiresAt,
          })
          .eq('id', listingId),
        supabase.from('pm_payments').insert({
          listing_id: listingId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          tier,
          status: 'paid',
        }),
      ])
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const listingId = sub.metadata?.listing_id

    if (listingId) {
      await supabase
        .from('pm_listings')
        .update({ listing_tier: 'free', listing_tier_rank: 0, plan_expires_at: null })
        .eq('id', listingId)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    if (customerId) {
      const { data: listings } = await supabase
        .from('pm_listings')
        .select('id')
        .eq('stripe_customer_id', customerId)

      if (listings?.length) {
        await supabase.from('pm_payments').insert(
          listings.map((l) => ({
            listing_id: l.id,
            stripe_session_id: null,
            stripe_customer_id: customerId,
            amount: 0,
            tier: 'unknown',
            status: 'payment_failed',
          }))
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
