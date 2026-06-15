/**
 * Seed script for PainManagementFinder.com
 *
 * Primary source: NPPES bulk download (CMS.gov)
 *   - Filter by taxonomy codes: 208VP0000X, 208VP0014X, 207LP2900X, 2081P2900X, 261QP3300X
 *   - Download: https://download.cms.gov/nppes/NPI_Files.html
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/seed.ts
 *
 * Env vars needed:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Target metro areas for initial seed (by population)
const TARGET_STATES = ['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'AZ', 'GA', 'NC', 'OH', 'WA', 'CO']

const PAIN_TAXONOMY_CODES = new Set([
  '208VP0000X', // Pain Medicine
  '208VP0014X', // Interventional Pain Medicine
  '207LP2900X', // Anesthesiology: Pain Medicine
  '2081P2900X', // Physical Medicine & Rehabilitation: Pain Medicine
  '261QP3300X', // Pain Clinic/Center
])

const SPECIALTY_MAP: Record<string, string> = {
  '208VP0000X': 'Pain Medicine',
  '208VP0014X': 'Interventional Pain Medicine',
  '207LP2900X': 'Anesthesiology: Pain Medicine',
  '2081P2900X': 'Physical Medicine & Rehabilitation: Pain Medicine',
  '261QP3300X': 'Pain Clinic / Center',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface NppesRecord {
  npi: string
  firstName: string
  lastName: string
  businessName: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  taxonomyCodes: string[]
  specialtyLabel: string
}

async function insertBatch(records: NppesRecord[]) {
  const seenSlugs = new Set<string>()

  const rows = records.map((r) => {
    const baseName = r.firstName
      ? `${r.firstName} ${r.lastName} ${r.city} ${r.state}`
      : `${r.businessName} ${r.city} ${r.state}`
    let slug = slugify(baseName)
    let i = 0
    while (seenSlugs.has(slug)) {
      i++
      slug = `${slugify(baseName)}-${i}`
    }
    seenSlugs.add(slug)

    return {
      npi_number: r.npi,
      first_name: r.firstName || null,
      last_name: r.lastName || null,
      business_name: r.businessName || null,
      slug,
      practice_address: r.address || null,
      city: r.city,
      state: r.state,
      zip: r.zip || null,
      phone: r.phone || null,
      taxonomy_codes: r.taxonomyCodes,
      specialty_label: r.specialtyLabel,
      listing_tier: 'free',
      listing_tier_rank: 0,
      source: 'nppes',
      is_active: true,
      is_approved: true,
    }
  })

  const { error } = await supabase
    .from('pm_listings')
    .upsert(rows, { onConflict: 'npi_number', ignoreDuplicates: true })

  if (error) console.error('Insert error:', error.message)
  else console.log(`Inserted batch of ${rows.length}`)
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.log(`
Usage: npx ts-node scripts/seed.ts /path/to/npidata.csv

Download NPPES bulk file from:
  https://download.cms.gov/nppes/NPI_Files.html

Expected CSV columns (NPPES format):
  NPI, Entity Type Code, Provider Last Name (Legal Name), Provider First Name,
  Provider Organization Name (Legal Business Name), Provider Business Practice Location Address Line 1,
  Provider Business Practice Location Address City Name, Provider Business Practice Location Address State Name,
  Provider Business Practice Location Address Postal Code, Provider Business Practice Location Address Telephone Number,
  Healthcare Provider Taxonomy Code_1 ... Healthcare Provider Taxonomy Code_15
    `)
    process.exit(0)
  }

  console.log(`Seeding from NPPES file: ${csvPath}`)
  console.log(`Target states: ${TARGET_STATES.join(', ')}`)

  const rl = readline.createInterface({ input: fs.createReadStream(csvPath), crlfDelay: Infinity })
  let headers: string[] = []
  let batch: NppesRecord[] = []
  let total = 0
  let lineNum = 0

  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) {
      headers = line.split(',').map(h => h.replace(/"/g, '').trim())
      continue
    }

    const values = line.split(',').map(v => v.replace(/"/g, '').trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })

    const entityType = row['Entity Type Code']
    const state = row['Provider Business Practice Location Address State Name']
    if (!TARGET_STATES.includes(state)) continue

    // Collect all taxonomy codes
    const taxonomyCodes: string[] = []
    for (let i = 1; i <= 15; i++) {
      const code = row[`Healthcare Provider Taxonomy Code_${i}`]
      if (code && PAIN_TAXONOMY_CODES.has(code)) taxonomyCodes.push(code)
    }
    if (taxonomyCodes.length === 0) continue

    const specialtyLabel = SPECIALTY_MAP[taxonomyCodes[0]] ?? 'Pain Medicine'
    const npi = row['NPI']
    const firstName = entityType === '1' ? row['Provider First Name'] : ''
    const lastName = entityType === '1' ? row['Provider Last Name (Legal Name)'] : ''
    const businessName = row['Provider Organization Name (Legal Business Name)'] ?? ''
    const address = row['Provider Business Practice Location Address Line 1'] ?? ''
    const city = row['Provider Business Practice Location Address City Name'] ?? ''
    const zip = (row['Provider Business Practice Location Address Postal Code'] ?? '').slice(0, 5)
    const phone = row['Provider Business Practice Location Address Telephone Number'] ?? ''

    if (!npi || !city || !state) continue

    batch.push({ npi, firstName, lastName, businessName, address, city, state, zip, phone, taxonomyCodes, specialtyLabel })
    total++

    if (batch.length >= 100) {
      await insertBatch(batch)
      batch = []
    }
  }

  if (batch.length > 0) await insertBatch(batch)
  console.log(`\nDone. Processed ${total} pain management providers.`)
}

main().catch(console.error)
