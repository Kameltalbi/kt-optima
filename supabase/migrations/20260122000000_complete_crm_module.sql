-- ============================================
-- COMPLÉTION DU MODULE CRM
-- Ajout du statut Prospect/Client et table Prospects
-- ============================================

-- Ajouter le statut aux sociétés CRM
ALTER TABLE public.crm_companies
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'prospect' 
CHECK (status IN ('prospect', 'client'));

COMMENT ON COLUMN public.crm_companies.status IS 'Statut de la société: prospect ou client';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_crm_companies_status ON public.crm_companies(status);

-- ============================================
-- TABLE CRM PROSPECTS (LEADS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.crm_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100),
    sector VARCHAR(100),
    source VARCHAR(100), -- Site web, LinkedIn, Recommandation, Salon, Appel entrant, etc.
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
    notes TEXT,
    converted_to_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_prospects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view prospects in their company"
ON public.crm_prospects FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage prospects in their company"
ON public.crm_prospects FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- Trigger pour updated_at
CREATE TRIGGER update_crm_prospects_updated_at
BEFORE UPDATE ON public.crm_prospects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_prospects_status ON public.crm_prospects(status);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_source ON public.crm_prospects(source);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_company_id ON public.crm_prospects(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_converted_to_company_id ON public.crm_prospects(converted_to_company_id);

-- ============================================
-- AJOUTER LIEN AVEC FACTURES DANS SOCIÉTÉS
-- ============================================
-- Ajouter une colonne pour lier les factures aux sociétés CRM
-- (via le client_id dans factures_ventes qui peut pointer vers clients, 
--  et clients peut être lié à crm_companies via un champ ou une table de liaison)

-- Note: Pour l'instant, on peut utiliser le nom ou le tax_number pour faire le lien
-- Une table de liaison sera créée si nécessaire plus tard

COMMENT ON TABLE public.crm_prospects IS 'Table des prospects/leads avant conversion en société';
COMMENT ON COLUMN public.crm_prospects.converted_to_company_id IS 'ID de la société CRM créée lors de la conversion du prospect';
COMMENT ON COLUMN public.crm_prospects.converted_at IS 'Date de conversion du prospect en société';
