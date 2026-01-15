-- Table des paramètres de paie (CNSS, IRPP configurables)
CREATE TABLE IF NOT EXISTS public.parametres_paie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    code VARCHAR NOT NULL,
    libelle VARCHAR NOT NULL,
    valeur NUMERIC(10,4) NOT NULL,
    type VARCHAR NOT NULL DEFAULT 'pourcentage', -- 'pourcentage', 'montant', 'tranche'
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Table des tranches IRPP
CREATE TABLE IF NOT EXISTS public.tranches_irpp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tranche_min NUMERIC(15,2) NOT NULL DEFAULT 0,
    tranche_max NUMERIC(15,2), -- NULL = illimité
    taux NUMERIC(5,2) NOT NULL,
    ordre INTEGER NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des fiches de paie
CREATE TABLE IF NOT EXISTS public.fiches_paie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    numero VARCHAR,
    periode VARCHAR NOT NULL, -- Format YYYY-MM
    date_paiement DATE NOT NULL,
    
    -- Éléments de rémunération
    salaire_base NUMERIC(15,2) NOT NULL,
    primes NUMERIC(15,2) DEFAULT 0,
    indemnites NUMERIC(15,2) DEFAULT 0,
    heures_sup NUMERIC(15,2) DEFAULT 0,
    brut NUMERIC(15,2) NOT NULL,
    
    -- Cotisations sociales
    cnss_salarie NUMERIC(15,2) NOT NULL,
    cnss_employeur NUMERIC(15,2) NOT NULL,
    taux_cnss_salarie NUMERIC(5,4) NOT NULL,
    taux_cnss_employeur NUMERIC(5,4) NOT NULL,
    
    -- IRPP
    base_imposable NUMERIC(15,2) NOT NULL,
    irpp_annuel NUMERIC(15,2) NOT NULL,
    irpp_mensuel NUMERIC(15,2) NOT NULL,
    
    -- Net
    autres_retenues NUMERIC(15,2) DEFAULT 0,
    net_a_payer NUMERIC(15,2) NOT NULL,
    
    -- Métadonnées
    statut VARCHAR NOT NULL DEFAULT 'brouillon', -- brouillon, validee, payee
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_parametres_paie_company ON public.parametres_paie(company_id);
CREATE INDEX idx_tranches_irpp_company ON public.tranches_irpp(company_id, ordre);
CREATE INDEX idx_fiches_paie_company ON public.fiches_paie(company_id);
CREATE INDEX idx_fiches_paie_employe ON public.fiches_paie(employe_id);
CREATE INDEX idx_fiches_paie_periode ON public.fiches_paie(periode);

-- Triggers updated_at
CREATE TRIGGER update_parametres_paie_updated_at
    BEFORE UPDATE ON public.parametres_paie
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tranches_irpp_updated_at
    BEFORE UPDATE ON public.tranches_irpp
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fiches_paie_updated_at
    BEFORE UPDATE ON public.fiches_paie
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.parametres_paie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tranches_irpp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiches_paie ENABLE ROW LEVEL SECURITY;

-- Policies parametres_paie
CREATE POLICY "Users can view parametres_paie in their company"
    ON public.parametres_paie FOR SELECT
    USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert parametres_paie in their company"
    ON public.parametres_paie FOR INSERT
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update parametres_paie in their company"
    ON public.parametres_paie FOR UPDATE
    USING (company_id = get_user_company_id(auth.uid()))
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete parametres_paie in their company"
    ON public.parametres_paie FOR DELETE
    USING (company_id = get_user_company_id(auth.uid()));

-- Policies tranches_irpp
CREATE POLICY "Users can view tranches_irpp in their company"
    ON public.tranches_irpp FOR SELECT
    USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert tranches_irpp in their company"
    ON public.tranches_irpp FOR INSERT
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update tranches_irpp in their company"
    ON public.tranches_irpp FOR UPDATE
    USING (company_id = get_user_company_id(auth.uid()))
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete tranches_irpp in their company"
    ON public.tranches_irpp FOR DELETE
    USING (company_id = get_user_company_id(auth.uid()));

-- Policies fiches_paie
CREATE POLICY "Users can view fiches_paie in their company"
    ON public.fiches_paie FOR SELECT
    USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert fiches_paie in their company"
    ON public.fiches_paie FOR INSERT
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update fiches_paie in their company"
    ON public.fiches_paie FOR UPDATE
    USING (company_id = get_user_company_id(auth.uid()))
    WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete fiches_paie in their company"
    ON public.fiches_paie FOR DELETE
    USING (company_id = get_user_company_id(auth.uid()));

-- Fonction pour initialiser les paramètres de paie par défaut
CREATE OR REPLACE FUNCTION public.create_default_payroll_params(_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Taux CNSS salarié (9.18%)
    INSERT INTO public.parametres_paie (company_id, code, libelle, valeur, type)
    VALUES (_company_id, 'CNSS_SALARIE', 'Taux CNSS Salarié', 9.18, 'pourcentage')
    ON CONFLICT (company_id, code) DO NOTHING;
    
    -- Taux CNSS employeur (16.57%)
    INSERT INTO public.parametres_paie (company_id, code, libelle, valeur, type)
    VALUES (_company_id, 'CNSS_EMPLOYEUR', 'Taux CNSS Employeur', 16.57, 'pourcentage')
    ON CONFLICT (company_id, code) DO NOTHING;
    
    -- Tranches IRPP tunisien (barème annuel)
    INSERT INTO public.tranches_irpp (company_id, tranche_min, tranche_max, taux, ordre)
    VALUES 
        (_company_id, 0, 5000, 0, 1),
        (_company_id, 5000.01, 20000, 26, 2),
        (_company_id, 20000.01, 30000, 28, 3),
        (_company_id, 30000.01, 50000, 32, 4),
        (_company_id, 50000.01, NULL, 35, 5)
    ON CONFLICT DO NOTHING;
END;
$$;