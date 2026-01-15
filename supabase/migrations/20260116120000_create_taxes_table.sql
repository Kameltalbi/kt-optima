-- ============================================
-- TAXES TABLE
-- ============================================
-- Table pour gérer les taxes (TVA, timbre fiscal, etc.) par entreprise

CREATE TABLE IF NOT EXISTS public.taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(15, 2) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT taxes_company_name_unique UNIQUE (company_id, name)
);

COMMENT ON TABLE public.taxes IS 'Taxes configurables par entreprise (TVA, timbre fiscal, etc.)';
COMMENT ON COLUMN public.taxes.type IS 'Type de taxe: percentage (pourcentage) ou fixed (montant fixe)';
COMMENT ON COLUMN public.taxes.value IS 'Valeur de la taxe: pourcentage (ex: 19) ou montant fixe (ex: 0.5)';
COMMENT ON COLUMN public.taxes.enabled IS 'Indique si la taxe est activée';
COMMENT ON COLUMN public.taxes.is_default IS 'Indique si c''est une taxe par défaut (ne peut pas être supprimée)';

-- Enable RLS
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_taxes_company_id ON public.taxes(company_id);
CREATE INDEX idx_taxes_enabled ON public.taxes(enabled);
CREATE INDEX idx_taxes_type ON public.taxes(type);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users can view taxes in their company
CREATE POLICY "Users can view taxes in their company"
ON public.taxes FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Users can insert taxes in their company
CREATE POLICY "Users can insert taxes in their company"
ON public.taxes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Users can update taxes in their company
CREATE POLICY "Users can update taxes in their company"
ON public.taxes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Users can delete taxes in their company (except default ones)
CREATE POLICY "Users can delete taxes in their company"
ON public.taxes FOR DELETE
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid())
    AND is_default = false
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for updated_at
CREATE TRIGGER update_taxes_updated_at
BEFORE UPDATE ON public.taxes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DEFAULT TAXES FUNCTION
-- ============================================
-- Function to create default taxes for a new company
CREATE OR REPLACE FUNCTION public.create_default_taxes(_company_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert default TVA (19%)
    INSERT INTO public.taxes (company_id, name, type, value, enabled, is_default, description)
    VALUES (
        _company_id,
        'TVA',
        'percentage',
        19.00,
        true,
        true,
        'Taxe sur la valeur ajoutée par défaut'
    )
    ON CONFLICT (company_id, name) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.create_default_taxes IS 'Crée les taxes par défaut pour une nouvelle entreprise';
