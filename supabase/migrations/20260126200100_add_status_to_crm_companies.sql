-- ============================================
-- ADD STATUS COLUMN TO CRM_COMPANIES
-- ============================================
-- Fix: Could not find the 'status' column of 'crm_companies' in the schema cache

-- Add status column to crm_companies table
ALTER TABLE public.crm_companies 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'prospect';

-- Add check constraint for valid status values
ALTER TABLE public.crm_companies
ADD CONSTRAINT crm_companies_status_check 
CHECK (status IN ('prospect', 'client', 'inactive', 'lost'));

-- Update existing rows to have default status
UPDATE public.crm_companies 
SET status = 'prospect' 
WHERE status IS NULL;

-- Make status column NOT NULL
ALTER TABLE public.crm_companies 
ALTER COLUMN status SET NOT NULL;

-- Add comment
COMMENT ON COLUMN public.crm_companies.status IS 'Status of the CRM company: prospect, client, inactive, or lost';
