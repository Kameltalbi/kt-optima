-- ============================================
-- MODULE PAIE - PAYROLL MODULE
-- Tables pour la gestion de la paie selon les règles tunisiennes
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
COMMENT ON COLUMN public.payroll_settings.pay_frequency IS 'Fréquence de paie (monthly, weekly, biweekly)';
COMMENT ON COLUMN public.payroll_settings.default_payment_method IS 'Méthode de paiement par défaut';
COMMENT ON COLUMN public.payroll_settings.currency IS 'Devise utilisée';
COMMENT ON COLUMN public.payroll_settings.cnss_rate_employee IS 'Taux CNSS salarié (défaut: 9.18%)';
COMMENT ON COLUMN public.payroll_settings.cnss_ceiling IS 'Plafond CNSS';
COMMENT ON COLUMN public.payroll_settings.cnss_active IS 'CNSS active ou non';
COMMENT ON COLUMN public.payroll_settings.irpp_professional_rate IS 'Taux de déduction frais professionnels (défaut: 10%)';
COMMENT ON COLUMN public.payroll_settings.irpp_professional_cap IS 'Plafond déduction frais professionnels (défaut: 2000 TND)';
COMMENT ON COLUMN public.payroll_settings.family_deduction IS 'Déduction familiale annuelle (défaut: 300 TND)';
COMMENT ON COLUMN public.payroll_settings.child_deduction IS 'Déduction par enfant annuelle (défaut: 200 TND)';
COMMENT ON COLUMN public.payroll_settings.css_rate IS 'Taux CSS (défaut: 1%)';
COMMENT ON COLUMN public.payroll_settings.css_exemption_threshold IS 'Seuil d''exemption CSS (IRPP ≤ 5000 TND)';
COMMENT ON COLUMN public.payroll_settings.overtime_rate_1 IS 'Taux heures supplémentaires niveau 1 (défaut: 125%)';
COMMENT ON COLUMN public.payroll_settings.overtime_rate_2 IS 'Taux heures supplémentaires niveau 2 (défaut: 150%)';
COMMENT ON COLUMN public.payroll_settings.overtime_threshold IS 'Seuil hebdomadaire heures supplémentaires (défaut: 48h)';
COMMENT ON COLUMN public.payroll_settings.bonus_taxable IS 'Les primes sont-elles imposables';
COMMENT ON COLUMN public.payroll_settings.bonus_subject_cnss IS 'Les primes sont-elles soumises à CNSS';
COMMENT ON COLUMN public.payroll_settings.payslip_language IS 'Langue du bulletin de paie (fr, ar)';
COMMENT ON COLUMN public.payroll_settings.retention_period IS 'Période de rétention en années (défaut: 5)';

-- Enable RLS
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payroll settings in their company"
ON public.payroll_settings FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

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
COMMENT ON COLUMN public.irpp_brackets.min_amount IS 'Montant minimum de la tranche (annuel)';
COMMENT ON COLUMN public.irpp_brackets.max_amount IS 'Montant maximum de la tranche (NULL = illimité)';
COMMENT ON COLUMN public.irpp_brackets.rate IS 'Taux d''imposition de la tranche (%)';
COMMENT ON COLUMN public.irpp_brackets.order_index IS 'Ordre de la tranche (pour tri)';

-- Enable RLS
ALTER TABLE public.irpp_brackets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view irpp brackets in their company"
ON public.irpp_brackets FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can manage irpp brackets in their company"
ON public.irpp_brackets FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX idx_irpp_brackets_company_id ON public.irpp_brackets(company_id);
CREATE INDEX idx_irpp_brackets_order ON public.irpp_brackets(company_id, order_index);

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
COMMENT ON COLUMN public.payslips.gross_salary IS 'Salaire brut';
COMMENT ON COLUMN public.payslips.bonuses IS 'Primes';
COMMENT ON COLUMN public.payslips.overtime IS 'Heures supplémentaires';
COMMENT ON COLUMN public.payslips.family_situation IS 'Situation familiale';
COMMENT ON COLUMN public.payslips.number_of_children IS 'Nombre d''enfants';
COMMENT ON COLUMN public.payslips.cnss IS 'Cotisation CNSS';
COMMENT ON COLUMN public.payslips.irpp IS 'Impôt sur le revenu (mensuel)';
COMMENT ON COLUMN public.payslips.css IS 'Cotisation CSS';
COMMENT ON COLUMN public.payslips.net_salary IS 'Salaire net';
COMMENT ON COLUMN public.payslips.pdf_file_path IS 'Chemin du fichier PDF du bulletin';

-- Enable RLS
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payslips in their company"
ON public.payslips FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create payslips in their company"
ON public.payslips FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update payslips in their company"
ON public.payslips FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete payslips in their company"
ON public.payslips FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX idx_payslips_company_id ON public.payslips(company_id);
CREATE INDEX idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX idx_payslips_period ON public.payslips(company_id, year, month);

-- Trigger pour updated_at
CREATE TRIGGER update_payroll_settings_updated_at
BEFORE UPDATE ON public.payroll_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_irpp_brackets_updated_at
BEFORE UPDATE ON public.irpp_brackets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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
