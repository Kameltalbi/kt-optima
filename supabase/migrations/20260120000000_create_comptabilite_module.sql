-- ============================================
-- MODULE COMPTABILITÉ - MVP ERP TUNISIE
-- ============================================
-- Migration: Création des tables comptables
-- Date: 2026-01-20
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE IF NOT EXISTS public.compte_type AS ENUM ('actif', 'passif', 'charge', 'produit', 'tresorerie');
CREATE TYPE IF NOT EXISTS public.source_module AS ENUM ('ventes', 'paie', 'tresorerie', 'achats', 'stock');

-- ============================================
-- TABLE: COMPTES COMPTABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.comptes_comptables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    code_compte VARCHAR(20) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    type compte_type NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES public.comptes_comptables(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, code_compte)
);

-- Enable RLS
ALTER TABLE public.comptes_comptables ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comptes_company_id ON public.comptes_comptables(company_id);
CREATE INDEX IF NOT EXISTS idx_comptes_code ON public.comptes_comptables(code_compte);
CREATE INDEX IF NOT EXISTS idx_comptes_type ON public.comptes_comptables(type);

-- RLS Policies
CREATE POLICY "Users can view comptes in their company"
ON public.comptes_comptables FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage comptes in their company"
ON public.comptes_comptables FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- TABLE: JOURNAUX COMPTABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.journaux (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    code_journal VARCHAR(10) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, code_journal)
);

-- Enable RLS
ALTER TABLE public.journaux ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journaux_company_id ON public.journaux(company_id);
CREATE INDEX IF NOT EXISTS idx_journaux_code ON public.journaux(code_journal);

-- RLS Policies
CREATE POLICY "Users can view journaux in their company"
ON public.journaux FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage journaux in their company"
ON public.journaux FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- TABLE: EXERCICES COMPTABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.exercices_comptables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    annee INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    is_cloture BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, annee)
);

-- Enable RLS
ALTER TABLE public.exercices_comptables ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercices_company_id ON public.exercices_comptables(company_id);
CREATE INDEX IF NOT EXISTS idx_exercices_annee ON public.exercices_comptables(annee);
CREATE INDEX IF NOT EXISTS idx_exercices_active ON public.exercices_comptables(is_active);

-- RLS Policies
CREATE POLICY "Users can view exercices in their company"
ON public.exercices_comptables FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage exercices in their company"
ON public.exercices_comptables FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- TABLE: ÉCRITURES COMPTABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.ecritures_comptables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    exercice_id UUID REFERENCES public.exercices_comptables(id) ON DELETE RESTRICT NOT NULL,
    journal_id UUID REFERENCES public.journaux(id) ON DELETE RESTRICT NOT NULL,
    compte_id UUID REFERENCES public.comptes_comptables(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    libelle TEXT,
    reference VARCHAR(255),
    source_module source_module NOT NULL,
    source_id UUID NOT NULL,
    is_validated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ecritures_comptables ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ecritures_company_id ON public.ecritures_comptables(company_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_exercice_id ON public.ecritures_comptables(exercice_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_journal_id ON public.ecritures_comptables(journal_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_compte_id ON public.ecritures_comptables(compte_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_date ON public.ecritures_comptables(date);
CREATE INDEX IF NOT EXISTS idx_ecritures_source ON public.ecritures_comptables(source_module, source_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_reference ON public.ecritures_comptables(reference);

-- RLS Policies
CREATE POLICY "Users can view ecritures in their company"
ON public.ecritures_comptables FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage ecritures in their company"
ON public.ecritures_comptables FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- FUNCTION: Vérifier équilibre des écritures
-- ============================================

CREATE OR REPLACE FUNCTION public.verifier_equilibre_ecriture(
    p_reference VARCHAR(255),
    p_company_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_debit DECIMAL(15, 2);
    v_total_credit DECIMAL(15, 2);
BEGIN
    SELECT 
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO v_total_debit, v_total_credit
    FROM public.ecritures_comptables
    WHERE reference = p_reference
    AND company_id = p_company_id;
    
    RETURN v_total_debit = v_total_credit;
END;
$$;

-- ============================================
-- FUNCTION: Créer exercice comptable par défaut
-- ============================================

CREATE OR REPLACE FUNCTION public.create_default_exercice(
    p_company_id UUID,
    p_annee INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exercice_id UUID;
BEGIN
    -- Désactiver les autres exercices
    UPDATE public.exercices_comptables
    SET is_active = FALSE
    WHERE company_id = p_company_id;
    
    -- Créer le nouvel exercice
    INSERT INTO public.exercices_comptables (
        company_id,
        annee,
        date_debut,
        date_fin,
        is_active
    ) VALUES (
        p_company_id,
        p_annee,
        DATE(p_annee || '-01-01'),
        DATE(p_annee || '-12-31'),
        TRUE
    )
    RETURNING id INTO v_exercice_id;
    
    RETURN v_exercice_id;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_comptes_updated_at
BEFORE UPDATE ON public.comptes_comptables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journaux_updated_at
BEFORE UPDATE ON public.journaux
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercices_updated_at
BEFORE UPDATE ON public.exercices_comptables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecritures_updated_at
BEFORE UPDATE ON public.ecritures_comptables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CONSTRAINT: Vérifier qu'une écriture a soit débit soit crédit
-- ============================================

ALTER TABLE public.ecritures_comptables
ADD CONSTRAINT check_debit_credit CHECK (
    (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
);

-- ============================================
-- CONSTRAINT: Empêcher modification d'écritures validées dans exercice clôturé
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_modify_closed_exercice()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.exercices_comptables
        WHERE id = NEW.exercice_id
        AND is_cloture = TRUE
    ) THEN
        RAISE EXCEPTION 'Impossible de modifier une écriture dans un exercice clôturé';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER check_exercice_cloture_update
BEFORE UPDATE ON public.ecritures_comptables
FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_closed_exercice();

CREATE TRIGGER check_exercice_cloture_delete
BEFORE DELETE ON public.ecritures_comptables
FOR EACH ROW EXECUTE FUNCTION public.prevent_modify_closed_exercice();
