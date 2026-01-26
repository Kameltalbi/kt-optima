-- ============================================
-- SYSTÈME DE VALIDATION PAR PALIERS BUDGÉTAIRES
-- Pour les demandes d'achat
-- ============================================

-- Table: Paramètres de validation par paliers (un par organisation)
CREATE TABLE IF NOT EXISTS public.purchase_request_validation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT false, -- Activer/désactiver la validation par paliers
    require_exception_approval BOOLEAN DEFAULT true, -- Exiger validation exceptionnelle si montant > palier max
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.purchase_request_validation_settings IS 'Paramètres de validation par paliers budgétaires pour les demandes d''achat';
COMMENT ON COLUMN public.purchase_request_validation_settings.enabled IS 'Activer ou désactiver la validation par paliers';
COMMENT ON COLUMN public.purchase_request_validation_settings.require_exception_approval IS 'Exiger validation exceptionnelle si montant dépasse le palier maximum';

-- Table: Paliers budgétaires (ordonnés par montant croissant)
CREATE TABLE IF NOT EXISTS public.purchase_request_budget_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    montant_min DECIMAL(15, 2) NOT NULL,
    montant_max DECIMAL(15, 2) NOT NULL, -- NULL signifie "infini" (palier maximum)
    nombre_validations INTEGER NOT NULL CHECK (nombre_validations > 0),
    ordre INTEGER NOT NULL, -- Ordre d'application (1 = premier palier)
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT budget_tiers_montant_check CHECK (montant_max IS NULL OR montant_max > montant_min),
    CONSTRAINT budget_tiers_ordre_unique UNIQUE (company_id, ordre)
);

COMMENT ON TABLE public.purchase_request_budget_tiers IS 'Paliers budgétaires pour la validation des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_max IS 'NULL signifie "infini" (palier maximum)';
COMMENT ON COLUMN public.purchase_request_budget_tiers.ordre IS 'Ordre d''application des paliers (1 = premier palier)';

-- Table: Validateurs par palier (liste ordonnée des validateurs pour chaque palier)
CREATE TABLE IF NOT EXISTS public.purchase_request_tier_validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.purchase_request_budget_tiers(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0), -- 1 = premier validateur, 2 = deuxième, etc.
    validator_type VARCHAR(20) NOT NULL CHECK (validator_type IN ('role', 'user')), -- Par rôle ou par utilisateur
    role_name VARCHAR(50), -- Si validator_type = 'role', le nom du rôle (ex: 'manager', 'finance', 'direction')
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Si validator_type = 'user', l'ID de l'utilisateur
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT tier_validators_type_check CHECK (
        (validator_type = 'role' AND role_name IS NOT NULL AND user_id IS NULL) OR
        (validator_type = 'user' AND user_id IS NOT NULL AND role_name IS NULL)
    ),
    CONSTRAINT tier_validators_niveau_unique UNIQUE (tier_id, niveau_validation)
);

COMMENT ON TABLE public.purchase_request_tier_validators IS 'Liste ordonnée des validateurs pour chaque palier budgétaire';
COMMENT ON COLUMN public.purchase_request_tier_validators.niveau_validation IS 'Ordre de validation (1 = premier validateur, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_tier_validators.validator_type IS 'Type de validateur : par rôle ou par utilisateur spécifique';

-- Ajouter montant_total et palier_id à demandes_achat
ALTER TABLE public.demandes_achat 
ADD COLUMN IF NOT EXISTS montant_total DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS palier_id UUID REFERENCES public.purchase_request_budget_tiers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(20) DEFAULT 'brouillon' CHECK (statut_validation IN ('brouillon', 'en_validation', 'validee', 'rejetee'));

COMMENT ON COLUMN public.demandes_achat.montant_total IS 'Montant total calculé de la demande d''achat';
COMMENT ON COLUMN public.demandes_achat.palier_id IS 'Palier budgétaire assigné automatiquement selon le montant';
COMMENT ON COLUMN public.demandes_achat.statut_validation IS 'Statut de validation : brouillon, en_validation, validee, rejetee';

-- Table: Validations des demandes d'achat
CREATE TABLE IF NOT EXISTS public.purchase_request_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_achat_id UUID NOT NULL REFERENCES public.demandes_achat(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0), -- 1 = première validation, 2 = deuxième, etc.
    validateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    commentaire TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT validations_niveau_unique UNIQUE (demande_achat_id, niveau_validation)
);

COMMENT ON TABLE public.purchase_request_validations IS 'Validations séquentielles des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_validations.niveau_validation IS 'Niveau de validation (1 = première, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_validations.statut IS 'Statut de la validation : en_attente, valide, rejete';

-- Index
CREATE INDEX idx_purchase_request_validation_settings_company_id ON public.purchase_request_validation_settings(company_id);
CREATE INDEX idx_purchase_request_budget_tiers_company_id ON public.purchase_request_budget_tiers(company_id);
CREATE INDEX idx_purchase_request_budget_tiers_ordre ON public.purchase_request_budget_tiers(company_id, ordre);
CREATE INDEX idx_purchase_request_tier_validators_tier_id ON public.purchase_request_tier_validators(tier_id);
CREATE INDEX idx_purchase_request_tier_validators_niveau ON public.purchase_request_tier_validators(tier_id, niveau_validation);
CREATE INDEX idx_purchase_request_validations_demande_id ON public.purchase_request_validations(demande_achat_id);
CREATE INDEX idx_purchase_request_validations_validateur_id ON public.purchase_request_validations(validateur_id);
CREATE INDEX idx_purchase_request_validations_statut ON public.purchase_request_validations(statut);
CREATE INDEX idx_demandes_achat_palier_id ON public.demandes_achat(palier_id);
CREATE INDEX idx_demandes_achat_montant_total ON public.demandes_achat(montant_total);

-- RLS Policies
ALTER TABLE public.purchase_request_validation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_budget_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_tier_validators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_validations ENABLE ROW LEVEL SECURITY;

-- Policies pour purchase_request_validation_settings
CREATE POLICY "Users can view validation settings in their company"
ON public.purchase_request_validation_settings FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage validation settings in their company"
ON public.purchase_request_validation_settings FOR ALL
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.company_id = public.get_user_company_id(auth.uid())
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Policies pour purchase_request_budget_tiers
CREATE POLICY "Users can view budget tiers in their company"
ON public.purchase_request_budget_tiers FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage budget tiers in their company"
ON public.purchase_request_budget_tiers FOR ALL
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.company_id = public.get_user_company_id(auth.uid())
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Policies pour purchase_request_tier_validators
CREATE POLICY "Users can view tier validators in their company"
ON public.purchase_request_tier_validators FOR SELECT
TO authenticated
USING (
    tier_id IN (
        SELECT id FROM public.purchase_request_budget_tiers
        WHERE company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Admins can manage tier validators in their company"
ON public.purchase_request_tier_validators FOR ALL
TO authenticated
USING (
    tier_id IN (
        SELECT id FROM public.purchase_request_budget_tiers
        WHERE company_id = public.get_user_company_id(auth.uid())
    ) AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.company_id = public.get_user_company_id(auth.uid())
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Policies pour purchase_request_validations
CREATE POLICY "Users can view validations for their company requests"
ON public.purchase_request_validations FOR SELECT
TO authenticated
USING (
    demande_achat_id IN (
        SELECT id FROM public.demandes_achat
        WHERE company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can validate requests assigned to them"
ON public.purchase_request_validations FOR UPDATE
TO authenticated
USING (
    validateur_id = auth.uid() AND
    statut = 'en_attente' AND
    demande_achat_id IN (
        SELECT id FROM public.demandes_achat
        WHERE company_id = public.get_user_company_id(auth.uid())
    )
)
WITH CHECK (
    validateur_id = auth.uid() AND
    statut IN ('valide', 'rejete')
);

-- Triggers
CREATE TRIGGER update_purchase_request_validation_settings_updated_at
BEFORE UPDATE ON public.purchase_request_validation_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_request_budget_tiers_updated_at
BEFORE UPDATE ON public.purchase_request_budget_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer le montant total d'une demande
CREATE OR REPLACE FUNCTION calculate_demande_achat_total(demande_id UUID)
RETURNS DECIMAL(15, 2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(montant_estime) 
         FROM public.demande_achat_lignes 
         WHERE demande_achat_id = demande_id),
        0
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour identifier le palier selon le montant
CREATE OR REPLACE FUNCTION get_budget_tier_for_amount(company_uuid UUID, amount DECIMAL(15, 2))
RETURNS UUID AS $$
DECLARE
    tier_id_result UUID;
BEGIN
    SELECT id INTO tier_id_result
    FROM public.purchase_request_budget_tiers
    WHERE company_id = company_uuid
    AND actif = true
    AND montant_min <= amount
    AND (montant_max IS NULL OR montant_max >= amount)
    ORDER BY ordre ASC
    LIMIT 1;
    
    RETURN tier_id_result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_budget_tier_for_amount IS 'Identifie le palier budgétaire correspondant à un montant donné pour une organisation';
