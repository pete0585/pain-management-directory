import { createClient } from '@supabase/supabase-js'
import { randomUUID, createHash } from 'node:crypto'
import { DIRECTORY_ACTION_CONFIG as config } from './directory-action-config'
export const clientActions = ['profile_view','website_click','phone_click','booking_click','submission_start','claim_start'] as const
export type Action = typeof clientActions[number] | 'submission_failure' | 'submission_saved' | 'claim_completed' | 'checkout_completed' | 'entitlement_confirmed'
export const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v)
function db() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!, {auth:{persistSession:false,autoRefreshToken:false}}) }
export async function recordAction(action: Action, listingId: string | null, synthetic: boolean, outcomeKey?: string) {
  const day = new Date().toISOString().slice(0,10)
  const raw = outcomeKey ? createHash('sha256').update([config.tenant,action,listingId,synthetic,outcomeKey].join('|')).digest('hex') : null
  const eventId = raw ? `${raw.slice(0,8)}-${raw.slice(8,12)}-4${raw.slice(13,16)}-a${raw.slice(17,20)}-${raw.slice(20,32)}` : randomUUID()
  const result = await db().from('directory_action_events').insert({event_id:eventId,directory_id:config.tenant,listing_id:listingId,action,event_day:day,synthetic})
  if (result.error && result.error.code !== '23505') return false
  const saved = await db().from('directory_action_events').select('event_id,action,directory_id,listing_id,synthetic').eq('event_id',eventId).maybeSingle()
  return !saved.error && saved.data?.action===action && saved.data?.directory_id===config.tenant && saved.data?.listing_id===listingId && saved.data?.synthetic===synthetic
}
export async function publicListing(slug: string) {
  let query=db().from(config.table).select('id').eq('slug',slug)
  if(config.statusColumn) query=query.eq('status','active')
  else query=query.eq('is_active',true).eq('is_approved',true)
  const row=await query.maybeSingle();if(row.error)throw new Error('listing_read_unavailable');return row.data?.id ?? null
}
