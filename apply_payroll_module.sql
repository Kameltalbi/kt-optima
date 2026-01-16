-- ============================================
-- MODULE PAIE - PAYROLL MODULE
-- Script à exécuter directement dans Supabase SQL Editor
-- ============================================

-- Table: payroll_settings
-- Description: Paramètres de paie configurables par l'entreprise
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    -- General settings
    pay_frequency VARCHAR(20) DEFAULT 'monthly',
    default_payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    currency VARCHAR(10) DEFAULT 'TND',
    -- CNSS settings
    cnss_rate_employee DECIMAL(5, 2) NOT NULL DEFAULT 9.18,
    cnss_ceiling DECIMAL(15, 2),
    cnss_active BOOLEAN DEFAULT true,
    -- IRPP settings
    irpp_professional_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    irpp_professional_cap DECIMAL(15, 2) NOT NULL DEFAULT 2000.00,
    family_deduction DECIMAL(15, 2) NOT NULL DEFAULT 300.00,
    child_deduction DECIMAL(15, 2) NOT NULL DEFAULT 200.00,
    -- CSS settings
    css_rate DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    css_exemption_threshold DECIMAL(15, 2) DEFAULT 5000.00,
    -- Overtime settings
    overtime_rate_1 DECIMAL(5, 2) DEFAULT 125.00,
    overtime_rate_2 DECIMAL(5, 2) DEFAULT 150.00,
    overtime_threshold INTEGER DEFAULT 48,
    -- Bonus settings
    bonus_taxable BOOLEAN DEFAULT true,
    bonus_subject_cnss BOOLEAN DEFAULT true,
    -- Employee default settings
    default_contract_type VARCHAR(50),
    default_fiscal_status VARCHAR(50),
    default_children_count INTEGER DEFAULT 0,
    default_head_family BOOLEAN DEFAULT false,
    default_cnss_active BOOLEAN DEFAULT true,
    -- Payslip format settings
    payslip_language VARCHAR(10) DEFAULT 'fr',
    show_stamp BOOLEAN DEFAULT true,
    show_signature BOOLEAN DEFAULT true,
    confidential_label BOOLEAN DEFAULT true,
    -- Storage settings
    archive_path TEXT,
    retention_period INTEGER DEFAULT 5,
    secure_access BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payroll_settings_company_unique UNIQUE (company_id)
);

COMMENT ON TABLE public.payroll_settings IS 'Paramètres de paie configurables par entreprise';

-- Enable RLS
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view payroll settings in their company" ON public.payroll_settings;
CREATE POLICY "Users can view payroll settings in their company"
ON public.payroll_settings FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage payroll settings in their company" ON public.payroll_settings;
CREATE POLICY "Users can manage payroll settings in their company"
ON public.payroll_settings FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Table: irpp_brackets
-- Description: Tranches d'imposition IRPP (Impôt sur le Revenu des Personnes Physiques)
CREATE TABLE IF NOT EXISTS public.irpp_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2), -- NULL = pas de maximum (tranche supérieure)
    rate DECIMAL(5, 2) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.irpp_brackets IS 'Tranches d''imposition IRPP progressives';

-- Enable RLS
ALTER TABLE public.irpp_brackets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view irpp brackets in their company" ON public.irpp_brackets;
CREATE POLICY "Users can view irpp brackets in their company"
ON public.irpp_brackets FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can manage irpp brackets in their company" ON public.irpp_brackets;
CREATE POLICY "Users can manage irpp brackets in their company"
ON public.irpp_brackets FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_irpp_brackets_company_id ON public.irpp_brackets(company_id);
CREATE INDEX IF NOT EXISTS idx_irpp_brackets_order ON public.irpp_brackets(company_id, order_index);

-- Table: payslips
-- Description: Bulletins de paie générés
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    gross_salary DECIMAL(15, 2) NOT NULL,
    bonuses DECIMAL(15, 2) DEFAULT 0,
    overtime DECIMAL(15, 2) DEFAULT 0,
    family_situation VARCHAR(50), -- 'single', 'married', etc.
    number_of_children INTEGER DEFAULT 0,
    -- Calculs
    cnss DECIMAL(15, 2) NOT NULL,
    irpp DECIMAL(15, 2) NOT NULL,
    css DECIMAL(15, 2) NOT NULL,
    net_salary DECIMAL(15, 2) NOT NULL,
    -- PDF
    pdf_file_path TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payslips_employee_month_year_unique UNIQUE (employee_id, month, year, company_id)
);

COMMENT ON TABLE public.payslips IS 'Bulletins de paie générés';

-- Enable RLS
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view payslips in their company" ON public.payslips;
CREATE POLICY "Users can view payslips in their company"
ON public.payslips FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create payslips in their company" ON public.payslips;
CREATE POLICY "Users can create payslips in their company"
ON public.payslips FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update payslips in their company" ON public.payslips;
CREATE POLICY "Users can update payslips in their company"
ON public.payslips FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete payslips in their company" ON public.payslips;
CREATE POLICY "Users can delete payslips in their company"
ON public.payslips FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_payslips_company_id ON public.payslips(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_period ON public.payslips(company_id, year, month);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_payroll_settings_updated_at ON public.payroll_settings;
CREATE TRIGGER update_payroll_settings_updated_at
BEFORE UPDATE ON public.payroll_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_irpp_brackets_updated_at ON public.irpp_brackets;
CREATE TRIGGER update_irpp_brackets_updated_at
BEFORE UPDATE ON public.irpp_brackets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payslips_updated_at ON public.payslips;
CREATE TRIGGER update_payslips_updated_at
BEFORE UPDATE ON public.payslips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour initialiser les paramètres par défaut
CREATE OR REPLACE FUNCTION public.init_default_payroll_settings(_company_id UUID)
RETURNS void AS $$
BEGIN
    -- Créer les paramètres par défaut si n'existent pas
    INSERT INTO public.payroll_settings (
        company_id,
        pay_frequency,
        default_payment_method,
        currency,
        cnss_rate_employee,
        cnss_active,
        irpp_professional_rate,
        irpp_professional_cap,
        family_deduction,
        child_deduction,
        css_rate,
        css_exemption_threshold,
        overtime_rate_1,
        overtime_rate_2,
        overtime_threshold,
        bonus_taxable,
        bonus_subject_cnss,
        default_children_count,
        default_cnss_active,
        payslip_language,
        show_stamp,
        show_signature,
        confidential_label,
        retention_period,
        secure_access
    )
    VALUES (
        _company_id,
        'monthly',
        'bank_transfer',
        'TND',
        9.18,
        true,
        10.00,
        2000.00,
        300.00,
        200.00,
        1.00,
        5000.00,
        125.00,
        150.00,
        48,
        true,
        true,
        0,
        true,
        'fr',
        true,
        true,
        true,
        5,
        true
    )
    ON CONFLICT (company_id) DO NOTHING;

    -- Créer les tranches IRPP par défaut (barème tunisien 2024)
    INSERT INTO public.irpp_brackets (company_id, min_amount, max_amount, rate, order_index)
    VALUES
        (_company_id, 0, 5000, 0, 1),
        (_company_id, 5000, 20000, 15, 2),
        (_company_id, 20000, 30000, 20, 3),
        (_company_id, 30000, 50000, 25, 4),
        (_company_id, 50000, NULL, 35, 5)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.init_default_payroll_settings IS 'Initialise les paramètres de paie par défaut pour une entreprise';

-- ============================================
-- Table: fiches_paie (Ancien système de paie)
-- Description: Fiches de paie générées (système legacy)
-- ============================================
CREATE TABLE IF NOT EXISTS public.fiches_paie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    numero VARCHAR(50),
    periode VARCHAR(20) NOT NULL,
    date_paiement DATE NOT NULL,
    salaire_base DECIMAL(15, 2) NOT NULL DEFAULT 0,
    primes DECIMAL(15, 2) NOT NULL DEFAULT 0,
    indemnites DECIMAL(15, 2) NOT NULL DEFAULT 0,
    heures_sup DECIMAL(15, 2) NOT NULL DEFAULT 0,
    brut DECIMAL(15, 2) NOT NULL,
    cnss_salarie DECIMAL(15, 2) NOT NULL DEFAULT 0,
    cnss_employeur DECIMAL(15, 2) NOT NULL DEFAULT 0,
    taux_cnss_salarie DECIMAL(5, 2) NOT NULL DEFAULT 9.18,
    taux_cnss_employeur DECIMAL(5, 2) NOT NULL DEFAULT 16.57,
    base_imposable DECIMAL(15, 2) NOT NULL,
    irpp_annuel DECIMAL(15, 2) NOT NULL DEFAULT 0,
    irpp_mensuel DECIMAL(15, 2) NOT NULL DEFAULT 0,
    autres_retenues DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_a_payer DECIMAL(15, 2) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'brouillon',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.fiches_paie IS 'Fiches de paie générées (système legacy)';

-- Enable RLS
ALTER TABLE public.fiches_paie ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view fiches_paie in their company" ON public.fiches_paie;
CREATE POLICY "Users can view fiches_paie in their company"
ON public.fiches_paie FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can create fiches_paie in their company" ON public.fiches_paie;
CREATE POLICY "Users can create fiches_paie in their company"
ON public.fiches_paie FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update fiches_paie in their company" ON public.fiches_paie;
CREATE POLICY "Users can update fiches_paie in their company"
ON public.fiches_paie FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete fiches_paie in their company" ON public.fiches_paie;
CREATE POLICY "Users can delete fiches_paie in their company"
ON public.fiches_paie FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_fiches_paie_company_id ON public.fiches_paie(company_id);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_employe_id ON public.fiches_paie(employe_id);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_periode ON public.fiches_paie(company_id, periode);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_statut ON public.fiches_paie(company_id, statut);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_fiches_paie_updated_at ON public.fiches_paie;
CREATE TRIGGER update_fiches_paie_updated_at
BEFORE UPDATE ON public.fiches_paie
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
