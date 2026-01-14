-- Add footer field to companies table for document footer text
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS footer text;