export type ListingTier = 'free' | 'verified' | 'featured'

export interface PMListing {
  id: string
  npi_number: string | null
  first_name: string | null
  last_name: string | null
  business_name: string | null
  slug: string
  practice_address: string | null
  city: string
  state: string
  zip: string | null
  phone: string | null
  website_url: string | null
  email: string | null
  bio: string | null
  photo_url: string | null
  taxonomy_codes: string[]
  specialty_label: string | null
  board_certified_abpm: boolean
  procedures_offered: string[]
  conditions_treated: string[]
  insurance_accepted: string[]
  accepting_new_patients: boolean | null
  va_community_care: boolean
  listing_tier: ListingTier
  listing_tier_rank: number
  claimed: boolean
  claimed_at: string | null
  created_at: string
  updated_at: string
}

export interface Specialty {
  slug: string
  label: string
  icon: string
  description: string
  taxonomyCodes: string[]
}

export interface Condition {
  slug: string
  label: string
  icon: string
  description: string
}

export interface Procedure {
  slug: string
  label: string
  icon: string
  description: string
}

export const SPECIALTIES: Specialty[] = [
  {
    slug: 'interventional-pain',
    label: 'Interventional Pain Medicine',
    icon: '💉',
    description: 'Minimally invasive procedures for targeted pain relief',
    taxonomyCodes: ['208VP0014X'],
  },
  {
    slug: 'pain-medicine',
    label: 'Pain Medicine',
    icon: '🩺',
    description: 'Board-certified pain medicine specialists',
    taxonomyCodes: ['208VP0000X'],
  },
  {
    slug: 'anesthesiology-pain',
    label: 'Anesthesiology: Pain Medicine',
    icon: '🏥',
    description: 'Anesthesiologists specializing in chronic pain',
    taxonomyCodes: ['207LP2900X'],
  },
  {
    slug: 'pm-r-pain',
    label: 'Physical Medicine & Rehabilitation',
    icon: '🦾',
    description: 'Physiatrists specializing in pain and rehabilitation',
    taxonomyCodes: ['2081P2900X'],
  },
  {
    slug: 'pain-clinic',
    label: 'Pain Clinic / Center',
    icon: '🏛️',
    description: 'Multidisciplinary pain treatment centers',
    taxonomyCodes: ['261QP3300X'],
  },
  {
    slug: 'va-community-care',
    label: 'VA Community Care',
    icon: '🎖️',
    description: 'Accepts VA Community Care for veteran patients',
    taxonomyCodes: [],
  },
]

export const CONDITIONS: Condition[] = [
  { slug: 'lower-back-pain', label: 'Lower Back Pain', icon: '🔙', description: 'Chronic lumbar pain, disc disease, sciatica' },
  { slug: 'crps', label: 'CRPS / RSD', icon: '🔥', description: 'Complex Regional Pain Syndrome' },
  { slug: 'fibromyalgia', label: 'Fibromyalgia', icon: '💫', description: 'Widespread musculoskeletal pain and fatigue' },
  { slug: 'neuropathy', label: 'Neuropathy', icon: '⚡', description: 'Peripheral nerve pain and damage' },
  { slug: 'failed-back-surgery', label: 'Failed Back Surgery', icon: '🔄', description: 'Pain persisting after spinal surgery' },
  { slug: 'cancer-pain', label: 'Cancer Pain', icon: '🩻', description: 'Oncology-related pain management' },
  { slug: 'headache-migraine', label: 'Headache & Migraine', icon: '🧠', description: 'Chronic headache and migraine disorders' },
  { slug: 'neck-pain', label: 'Neck Pain', icon: '🦴', description: 'Cervical pain, whiplash, disc disease' },
]

export const PROCEDURES: Procedure[] = [
  { slug: 'spinal-cord-stimulation', label: 'Spinal Cord Stimulation', icon: '⚡', description: 'Neuromodulation for chronic pain' },
  { slug: 'radiofrequency-ablation', label: 'Radiofrequency Ablation', icon: '🔥', description: 'RFA for facet joint and nerve pain' },
  { slug: 'epidural-injection', label: 'Epidural Steroid Injection', icon: '💉', description: 'Corticosteroid delivery for spine pain' },
  { slug: 'ketamine-infusion', label: 'Ketamine Infusion', icon: '💊', description: 'IV ketamine for refractory pain' },
  { slug: 'nerve-block', label: 'Nerve Block', icon: '🎯', description: 'Targeted nerve pain relief' },
  { slug: 'trigger-point-injection', label: 'Trigger Point Injection', icon: '📍', description: 'Myofascial pain treatment' },
  { slug: 'prp-therapy', label: 'PRP Therapy', icon: '🩸', description: 'Platelet-rich plasma regenerative treatment' },
  { slug: 'intrathecal-pump', label: 'Intrathecal Drug Pump', icon: '🔧', description: 'Implantable pain medication delivery' },
]
