-- ============================================
-- COMPLÉTION DU MODULE PAIE
-- Ajout des champs manquants et tables pour avances/retenues
-- ============================================

-- Ajouter les champs manquants à la table employes
ALTER TABLE public.employes
ADD COLUMN IF NOT EXISTS type_contrat VARCHAR(20) DEFAULT 'CDI' 
CHECK (type_contrat IN ('CDI', 'CDD', 'Journalier'));

ALTER TABLE public.employes
ADD COLUMN IF NOT EXISTS banque VARCHAR(255);

ALTER TABLE public.employes
ADD COLUMN IF NOT EXISTS rib VARCHAR(100);

COMMENT ON COLUMN public.employes.type_contrat IS 'Type de contrat: CDI, CDD, Journalier';
COMMENT ON COLUMN public.employes.banque IS 'Nom de la banque';
COMMENT ON COLUMN public.employes.rib IS 'Relevé d''Identité Bancaire (RIB)';

-- Index pour type_contrat
CREATE INDEX IF NOT EXISTS idx_employes_type_contrat ON public.employes(type_contrat);

-- ============================================
-- TABLE: PAYROLL_ADVANCES (Avances sur salaire)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payroll_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    date_advance DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reimbursed', 'cancelled')),
    reimbursement_date DATE,
    payslip_id UUID REFERENCES public.payslips(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payroll_advances IS 'Avances sur salaire des employés';
COMMENT ON COLUMN public.payroll_advances.status IS 'pending = en attente, reimbursed = remboursée, cancelled = annulée';
COMMENT ON COLUMN public.payroll_advances.payslip_id IS 'ID de la fiche de paie où l''avance a été déduite';

-- Enable RLS
ALTER TABLE public.payroll_advances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view payroll advances in their company" ON public.payroll_advances;
CREATE POLICY "Users can view payroll advances in their company"
ON public.payroll_advances FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage payroll advances in their company" ON public.payroll_advances;
CREATE POLICY "Users can manage payroll advances in their company"
ON public.payroll_advances FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_payroll_advances_updated_at
BEFORE UPDATE ON public.payroll_advances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_advances_company_id ON public.payroll_advances(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_advances_employe_id ON public.payroll_advances(employe_id);
CREATE INDEX IF NOT EXISTS idx_payroll_advances_status ON public.payroll_advances(status);
CREATE INDEX IF NOT EXISTS idx_payroll_advances_date ON public.payroll_advances(date_advance);

-- ============================================
-- TABLE: PAYROLL_DEDUCTIONS (Retenues)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payroll_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    date_deduction DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('disciplinary', 'loan', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
    payslip_id UUID REFERENCES public.payslips(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payroll_deductions IS 'Retenues sur salaire (disciplinaires, prêts internes, autres)';
COMMENT ON COLUMN public.payroll_deductions.type IS 'disciplinary = disciplinaire, loan = prêt interne, other = autre';
COMMENT ON COLUMN public.payroll_deductions.status IS 'pending = en attente, applied = appliquée, cancelled = annulée';

-- Enable RLS
ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view payroll deductions in their company" ON public.payroll_deductions;
CREATE POLICY "Users can view payroll deductions in their company"
ON public.payroll_deductions FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage payroll deductions in their company" ON public.payroll_deductions;
CREATE POLICY "Users can manage payroll deductions in their company"
ON public.payroll_deductions FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_payroll_deductions_updated_at
BEFORE UPDATE ON public.payroll_deductions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_deductions_company_id ON public.payroll_deductions(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_deductions_employe_id ON public.payroll_deductions(employe_id);
CREATE INDEX IF NOT EXISTS idx_payroll_deductions_status ON public.payroll_deductions(status);
CREATE INDEX IF NOT EXISTS idx_payroll_deductions_type ON public.payroll_deductions(type);
CREATE INDEX IF NOT EXISTS idx_payroll_deductions_date ON public.payroll_deductions(date_deduction);

-- ============================================
-- TABLE: PAYROLL_BONUSES (Primes & Indemnités)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payroll_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    date_bonus DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('transport', 'phone', 'performance', 'other')),
    description TEXT,
    taxable BOOLEAN DEFAULT true,
    subject_cnss BOOLEAN DEFAULT true,
    payslip_id UUID REFERENCES public.payslips(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payroll_bonuses IS 'Primes et indemnités des employés';
COMMENT ON COLUMN public.payroll_bonuses.type IS 'transport = transport, phone = téléphone, performance = rendement, other = autre';
COMMENT ON COLUMN public.payroll_bonuses.taxable IS 'La prime est-elle imposable';
COMMENT ON COLUMN public.payroll_bonuses.subject_cnss IS 'La prime est-elle soumise à CNSS';

-- Enable RLS
ALTER TABLE public.payroll_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view payroll bonuses in their company" ON public.payroll_bonuses;
CREATE POLICY "Users can view payroll bonuses in their company"
ON public.payroll_bonuses FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage payroll bonuses in their company" ON public.payroll_bonuses;
CREATE POLICY "Users can manage payroll bonuses in their company"
ON public.payroll_bonuses FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_payroll_bonuses_updated_at
BEFORE UPDATE ON public.payroll_bonuses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_bonuses_company_id ON public.payroll_bonuses(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_bonuses_employe_id ON public.payroll_bonuses(employe_id);
CREATE INDEX IF NOT EXISTS idx_payroll_bonuses_type ON public.payroll_bonuses(type);
CREATE INDEX IF NOT EXISTS idx_payroll_bonuses_date ON public.payroll_bonuses(date_bonus);
