-- Pain Management Finder Schema
-- Drops bootstrap tables (0 rows) and creates correctly-named schema

DROP TABLE IF EXISTS public.pain_management_reviews CASCADE;
DROP TABLE IF EXISTS public.pain_management_payments CASCADE;
DROP TABLE IF EXISTS public.pain_management_claims CASCADE;
DROP TABLE IF EXISTS public.pain_management_listings CASCADE;

-- Pain Management Listings (NPI-based physician directory)
CREATE TABLE IF NOT EXISTS public.pm_listings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  npi_number VARCHAR(10) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  business_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  practice_address TEXT,
  city TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(10),
  phone VARCHAR(20),
  website_url TEXT,
  email TEXT,
  email_source VARCHAR(50),
  bio TEXT,
  photo_url TEXT,
  taxonomy_codes TEXT[] DEFAULT '{}'::text[],
  specialty_label TEXT,
  board_certified_abpm BOOLEAN NOT NULL DEFAULT false,
  procedures_offered TEXT[] DEFAULT '{}'::text[],
  conditions_treated TEXT[] DEFAULT '{}'::text[],
  insurance_accepted TEXT[] DEFAULT '{}'::text[],
  accepting_new_patients BOOLEAN DEFAULT true,
  va_community_care BOOLEAN NOT NULL DEFAULT false,
  listing_tier TEXT NOT NULL DEFAULT 'free',
  listing_tier_rank INTEGER NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_expires_at TIMESTAMPTZ,
  outreach_step INTEGER NOT NULL DEFAULT 0,
  outreach_sent_at TIMESTAMPTZ,
  outreach_last_sent_at TIMESTAMPTZ,
  upgrade_nudge_step INTEGER NOT NULL DEFAULT 0,
  upgrade_nudge_sent_at TIMESTAMPTZ,
  do_not_email BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'nppes',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims table (standard pattern)
CREATE TABLE IF NOT EXISTS public.pm_claims (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.pm_listings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  nudge_sent_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.pm_payments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.pm_listings(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.pm_leads (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.pm_listings(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_pm_listings_city ON public.pm_listings(city);
CREATE INDEX IF NOT EXISTS idx_pm_listings_state ON public.pm_listings(state);
CREATE INDEX IF NOT EXISTS idx_pm_listings_tier ON public.pm_listings(listing_tier);
CREATE INDEX IF NOT EXISTS idx_pm_listings_active ON public.pm_listings(is_active, is_approved);
CREATE INDEX IF NOT EXISTS idx_pm_listings_npi ON public.pm_listings(npi_number);
CREATE INDEX IF NOT EXISTS idx_pm_listings_va ON public.pm_listings(va_community_care);
CREATE INDEX IF NOT EXISTS idx_pm_listings_specialty ON public.pm_listings(specialty_label);
CREATE INDEX IF NOT EXISTS idx_pm_listings_search ON public.pm_listings USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_pm_listings_procedures ON public.pm_listings USING GIN(procedures_offered);
CREATE INDEX IF NOT EXISTS idx_pm_listings_conditions ON public.pm_listings USING GIN(conditions_treated);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION public.pm_listings_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.first_name, '') || ' ' ||
    COALESCE(NEW.last_name, '') || ' ' ||
    COALESCE(NEW.business_name, '') || ' ' ||
    COALESCE(NEW.specialty_label, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(ARRAY_TO_STRING(NEW.procedures_offered, ' '), '') || ' ' ||
    COALESCE(ARRAY_TO_STRING(NEW.conditions_treated, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER pm_listings_search_update
BEFORE INSERT OR UPDATE ON public.pm_listings
FOR EACH ROW EXECUTE FUNCTION public.pm_listings_search_trigger();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.pm_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER pm_listings_updated_at_trigger
BEFORE UPDATE ON public.pm_listings
FOR EACH ROW EXECUTE FUNCTION public.pm_listings_updated_at();

-- Row Level Security
ALTER TABLE public.pm_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pm_listings" ON public.pm_listings
  FOR SELECT USING (is_active = true AND is_approved = true);
CREATE POLICY "Service role full access pm_listings" ON public.pm_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access pm_claims" ON public.pm_claims
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access pm_payments" ON public.pm_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access pm_leads" ON public.pm_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.pm_listings TO anon, authenticated;
GRANT ALL ON public.pm_listings TO service_role;
GRANT ALL ON public.pm_claims TO service_role;
GRANT ALL ON public.pm_payments TO service_role;
GRANT ALL ON public.pm_leads TO service_role;
