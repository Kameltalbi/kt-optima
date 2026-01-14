-- ============================================
-- ADD PLAN COLUMN TO COMPANIES TABLE
-- ============================================

-- Create plan enum type (if not exists)
DO $$ BEGIN
    CREATE TYPE public.company_plan AS ENUM ('core', 'business', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add plan column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS plan public.company_plan NOT NULL DEFAULT 'core';

-- Add comment
COMMENT ON COLUMN public.companies.plan IS 'Plan ERP: core (CRM+Ventes+Trésorerie), business (+Achats+Produits+Stocks), enterprise (+Comptabilité+RH+Parc)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_plan ON public.companies(plan);
