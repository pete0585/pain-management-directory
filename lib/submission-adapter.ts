import { z } from 'zod'
import { text, optional, email, state, website, phone, list, stableSlug, submissionRoute } from './submission-core'

export const schema=z.object({first_name:text(100).min(1),last_name:text(100).min(1),business_name:optional(200),npi_number:optional(10).refine(v=>!v||/^\d{10}$/.test(v)),specialty_label:text(160).min(1),practice_address:text(300).min(1),city:text(100).min(1),state,zip:optional(10),phone:text(20).min(7).refine(v=>/^[+\d().\s\-xX#]+$/.test(v)&&v.replace(/\D/g,'').length>=7),email,website_url:website,bio:optional(2000),va_community_care:z.boolean().default(false),accepting_new_patients:z.boolean().default(true)}).strict()
export function buildRow(d:z.infer<typeof schema>){return {...d,slug:stableSlug(d.first_name+' '+d.last_name,d.email,d.city,d.state),listing_tier:'free',listing_tier_rank:0,source:'self',is_active:true,is_approved:false,do_not_email:true}}
export const POST=submissionRoute(schema,buildRow,{field:'source',value:'self'})
