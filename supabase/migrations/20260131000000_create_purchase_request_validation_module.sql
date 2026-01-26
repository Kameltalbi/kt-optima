-- ============================================
-- MODULE DEMANDE D'ACHAT AVEC VALIDATION PAR PALIERS
-- ============================================

-- Table: Paliers de budget pour validation
CREATE TABLE IF NOT EXISTS public.purchase_request_budget_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    montant_min DECIMAL(15, 2) NOT NULL,
    montant_max DECIMAL(15, 2) NOT NULL,
    nombre_validations INTEGER NOT NULL DEFAULT 1 CHECK (nombre_validations >= 0),
    ordre INTEGER NOT NULL, -- Ordre d'application des paliers
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Contrainte unique sur ordre supprimée pour permettre plusieurs paliers avec le même ordre
    -- L'ordre sera géré au niveau applicatif
    CONSTRAINT check_montant_range CHECK (montant_max > montant_min)
);

COMMENT ON TABLE public.purchase_request_budget_tiers IS 'Paliers de budget pour validation automatique des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_min IS 'Montant minimum du palier (inclus)';
COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_max IS 'Montant maximum du palier (inclus)';
COMMENT ON COLUMN public.purchase_request_budget_tiers.nombre_validations IS 'Nombre de validations requises pour ce palier';
COMMENT ON COLUMN public.purchase_request_budget_tiers.ordre IS 'Ordre d''application (1 = premier palier)';

-- Table: Validateurs par palier
CREATE TABLE IF NOT EXISTS public.purchase_request_tier_validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.purchase_request_budget_tiers(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0), -- 1 = première validation, 2 = deuxième, etc.
    validator_type VARCHAR(20) NOT NULL CHECK (validator_type IN ('role', 'user')), -- 'role' ou 'user'
    role_name VARCHAR(50), -- Si type = 'role', ex: 'manager', 'finance', 'direction'
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Si type = 'user'
    ordre INTEGER NOT NULL, -- Ordre de validation dans le niveau
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_validator_type CHECK (
        (validator_type = 'role' AND role_name IS NOT NULL AND user_id IS NULL) OR
        (validator_type = 'user' AND user_id IS NOT NULL AND role_name IS NULL)
    )
);

COMMENT ON TABLE public.purchase_request_tier_validators IS 'Liste des validateurs pour chaque palier et niveau de validation';
COMMENT ON COLUMN public.purchase_request_tier_validators.niveau_validation IS 'Niveau de validation (1 = première, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_tier_validators.validator_type IS 'Type: role ou user';
COMMENT ON COLUMN public.purchase_request_tier_validators.role_name IS 'Rôle du validateur si type = role';
COMMENT ON COLUMN public.purchase_request_tier_validators.user_id IS 'ID utilisateur si type = user';

-- Table: Paramètres de validation par organisation
CREATE TABLE IF NOT EXISTS public.purchase_request_validation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT false,
    require_exception_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.purchase_request_validation_settings IS 'Paramètres de validation des demandes d''achat par organisation';

-- Extension de la table demandes_achat existante
-- Ajouter les colonnes nécessaires pour la validation par paliers
ALTER TABLE public.demandes_achat 
ADD COLUMN IF NOT EXISTS montant_total DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS objet TEXT,
ADD COLUMN IF NOT EXISTS categorie VARCHAR(100),
ADD COLUMN IF NOT EXISTS palier_id UUID REFERENCES public.purchase_request_budget_tiers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Mettre à jour la contrainte de statut pour inclure les nouveaux statuts
DO $$ 
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    ALTER TABLE public.demandes_achat 
    DROP CONSTRAINT IF EXISTS demandes_achat_statut_check;
    
    -- Ajouter la nouvelle contrainte avec les statuts de validation
    ALTER TABLE public.demandes_achat 
    ADD CONSTRAINT demandes_achat_statut_check 
    CHECK (statut IN ('brouillon', 'en_attente', 'en_validation', 'approuvee', 'validee', 'rejetee', 'convertie', 'annulee'));
END $$;

COMMENT ON COLUMN public.demandes_achat.palier_id IS 'Palier de budget assigné automatiquement selon le montant';
COMMENT ON COLUMN public.demandes_achat.montant_total IS 'Montant total calculé à partir des lignes';
COMMENT ON COLUMN public.demandes_achat.objet IS 'Objet de la demande d''achat';
COMMENT ON COLUMN public.demandes_achat.categorie IS 'Catégorie de la demande';

-- Table: Validations des demandes
CREATE TABLE IF NOT EXISTS public.purchase_request_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id UUID NOT NULL REFERENCES public.demandes_achat(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0),
    validateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    commentaire TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_demande_niveau UNIQUE (demande_id, niveau_validation)
);

COMMENT ON TABLE public.purchase_request_validations IS 'Validations séquentielles des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_validations.niveau_validation IS 'Niveau de validation (1 = première, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_validations.statut IS 'en_attente, valide, rejete';

-- Index
CREATE INDEX IF NOT EXISTS idx_purchase_request_budget_tiers_company_id ON public.purchase_request_budget_tiers(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_budget_tiers_montant_range ON public.purchase_request_budget_tiers(company_id, montant_min, montant_max);
CREATE INDEX IF NOT EXISTS idx_purchase_request_tier_validators_tier_id ON public.purchase_request_tier_validators(tier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validation_settings_company_id ON public.purchase_request_validation_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_palier_id ON public.demandes_achat(palier_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_montant_total ON public.demandes_achat(montant_total);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_demande_id ON public.purchase_request_validations(demande_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_validateur_id ON public.purchase_request_validations(validateur_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_statut ON public.purchase_request_validations(statut);

-- RLS Policies
ALTER TABLE public.budget_paliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_palier_validateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_validations ENABLE ROW LEVEL SECURITY;

-- Policies pour purchase_request_budget_tiers
CREATE POLICY "Users can view budget tiers in their company"
ON public.purchase_request_budget_tiers FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage budget tiers in their company"
ON public.purchase_request_budget_tiers FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Policies pour purchase_request_tier_validators
CREATE POLICY "Users can view validators in their company tiers"
ON public.purchase_request_tier_validators FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Admins can manage validators in their company tiers"
ON public.purchase_request_tier_validators FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Policies pour purchase_request_validation_settings
CREATE POLICY "Users can view purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Les policies pour demandes_achat existent déjà dans la migration 20260121000003

-- Policies pour purchase_request_validations
CREATE POLICY "Users can view validations for their company requests"
ON public.purchase_request_validations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.demandes_achat
        WHERE demandes_achat.id = purchase_request_validations.demande_id
        AND demandes_achat.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Validators can update their assigned validations"
ON public.purchase_request_validations FOR UPDATE
TO authenticated
USING (
    validateur_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.demandes_achat
        WHERE demandes_achat.id = purchase_request_validations.demande_id
        AND demandes_achat.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Triggers
CREATE TRIGGER update_purchase_request_budget_tiers_updated_at
BEFORE UPDATE ON public.purchase_request_budget_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_request_validation_settings_updated_at
BEFORE UPDATE ON public.purchase_request_validation_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Le trigger pour demandes_achat existe déjà dans la migration 20260121000003

-- Fonction pour obtenir le palier selon le montant
CREATE OR REPLACE FUNCTION public.get_budget_palier(
    p_company_id UUID,
    p_montant DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_palier_id UUID;
BEGIN
    SELECT id INTO v_palier_id
    FROM public.purchase_request_budget_tiers
    WHERE company_id = p_company_id
      AND actif = true
      AND p_montant >= montant_min
      AND p_montant <= montant_max
    ORDER BY ordre ASC
    LIMIT 1;
    
    RETURN v_palier_id;
END;
$$;

COMMENT ON FUNCTION public.get_budget_palier IS 'Retourne le palier de budget correspondant au montant donné pour une entreprise';

-- Fonction pour générer les validations d'une demande
CREATE OR REPLACE FUNCTION public.generate_purchase_request_validations(
    p_demande_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_demande RECORD;
    v_palier RECORD;
    v_validateur RECORD;
    v_niveau INTEGER;
    v_validateur_user_id UUID;
BEGIN
    -- Récupérer la demande et son palier
    SELECT da.*, bp.nombre_validations
    INTO v_demande
    FROM public.demandes_achat da
    LEFT JOIN public.budget_paliers bp ON bp.id = da.palier_id
    WHERE da.id = p_demande_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Demande d''achat non trouvée: %', p_demande_id;
    END IF;
    
    -- Si pas de palier, pas de validation
    IF v_demande.palier_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Supprimer les validations existantes
    DELETE FROM public.purchase_request_validations
    WHERE demande_id = p_demande_id;
    
    -- Générer les validations pour chaque niveau
    FOR v_niveau IN 1..v_demande.nombre_validations LOOP
        -- Récupérer les validateurs pour ce niveau
        FOR v_validateur IN 
            SELECT * FROM public.budget_palier_validateurs
            WHERE palier_id = v_demande.palier_id
              AND niveau_validation = v_niveau
            ORDER BY ordre ASC
        LOOP
            -- Déterminer l'ID utilisateur du validateur
            IF v_validateur.type_validateur = 'user' THEN
                v_validateur_user_id := v_validateur.validateur_user_id;
            ELSIF v_validateur.type_validateur = 'role' THEN
                -- Trouver un utilisateur avec ce rôle dans la même entreprise
                SELECT ur.user_id INTO v_validateur_user_id
                FROM public.user_roles ur
                WHERE ur.company_id = v_demande.company_id
                  AND ur.role::text = v_validateur.validateur_role
                LIMIT 1;
            END IF;
            
            -- Créer la validation seulement pour le premier validateur du niveau
            -- (les autres sont des remplaçants potentiels)
            IF v_validateur.ordre = 1 AND v_validateur_user_id IS NOT NULL THEN
                INSERT INTO public.purchase_request_validations (
                    demande_id,
                    niveau_validation,
                    validateur_id,
                    statut
                ) VALUES (
                    p_demande_id,
                    v_niveau,
                    v_validateur_user_id,
                    CASE WHEN v_niveau = 1 THEN 'en_attente' ELSE 'en_attente' END
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION public.generate_purchase_request_validations IS 'Génère automatiquement les validations pour une demande d''achat selon son palier';

-- MODULE DEMANDE D'ACHAT AVEC VALIDATION PAR PALIERS
-- ============================================

-- Table: Paliers de budget pour validation
CREATE TABLE IF NOT EXISTS public.purchase_request_budget_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    montant_min DECIMAL(15, 2) NOT NULL,
    montant_max DECIMAL(15, 2) NOT NULL,
    nombre_validations INTEGER NOT NULL DEFAULT 1 CHECK (nombre_validations >= 0),
    ordre INTEGER NOT NULL, -- Ordre d'application des paliers
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Contrainte unique sur ordre supprimée pour permettre plusieurs paliers avec le même ordre
    -- L'ordre sera géré au niveau applicatif
    CONSTRAINT check_montant_range CHECK (montant_max > montant_min)
);

COMMENT ON TABLE public.purchase_request_budget_tiers IS 'Paliers de budget pour validation automatique des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_min IS 'Montant minimum du palier (inclus)';
COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_max IS 'Montant maximum du palier (inclus)';
COMMENT ON COLUMN public.purchase_request_budget_tiers.nombre_validations IS 'Nombre de validations requises pour ce palier';
COMMENT ON COLUMN public.purchase_request_budget_tiers.ordre IS 'Ordre d''application (1 = premier palier)';

-- Table: Validateurs par palier
CREATE TABLE IF NOT EXISTS public.purchase_request_tier_validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.purchase_request_budget_tiers(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0), -- 1 = première validation, 2 = deuxième, etc.
    validator_type VARCHAR(20) NOT NULL CHECK (validator_type IN ('role', 'user')), -- 'role' ou 'user'
    role_name VARCHAR(50), -- Si type = 'role', ex: 'manager', 'finance', 'direction'
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Si type = 'user'
    ordre INTEGER NOT NULL, -- Ordre de validation dans le niveau
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_validator_type CHECK (
        (validator_type = 'role' AND role_name IS NOT NULL AND user_id IS NULL) OR
        (validator_type = 'user' AND user_id IS NOT NULL AND role_name IS NULL)
    )
);

COMMENT ON TABLE public.purchase_request_tier_validators IS 'Liste des validateurs pour chaque palier et niveau de validation';
COMMENT ON COLUMN public.purchase_request_tier_validators.niveau_validation IS 'Niveau de validation (1 = première, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_tier_validators.validator_type IS 'Type: role ou user';
COMMENT ON COLUMN public.purchase_request_tier_validators.role_name IS 'Rôle du validateur si type = role';
COMMENT ON COLUMN public.purchase_request_tier_validators.user_id IS 'ID utilisateur si type = user';

-- Table: Paramètres de validation par organisation
CREATE TABLE IF NOT EXISTS public.purchase_request_validation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT false,
    require_exception_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.purchase_request_validation_settings IS 'Paramètres de validation des demandes d''achat par organisation';

-- Extension de la table demandes_achat existante
-- Ajouter les colonnes nécessaires pour la validation par paliers
ALTER TABLE public.demandes_achat 
ADD COLUMN IF NOT EXISTS montant_total DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS objet TEXT,
ADD COLUMN IF NOT EXISTS categorie VARCHAR(100),
ADD COLUMN IF NOT EXISTS palier_id UUID REFERENCES public.purchase_request_budget_tiers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Mettre à jour la contrainte de statut pour inclure les nouveaux statuts
DO $$ 
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    ALTER TABLE public.demandes_achat 
    DROP CONSTRAINT IF EXISTS demandes_achat_statut_check;
    
    -- Ajouter la nouvelle contrainte avec les statuts de validation
    ALTER TABLE public.demandes_achat 
    ADD CONSTRAINT demandes_achat_statut_check 
    CHECK (statut IN ('brouillon', 'en_attente', 'en_validation', 'approuvee', 'validee', 'rejetee', 'convertie', 'annulee'));
END $$;

COMMENT ON COLUMN public.demandes_achat.palier_id IS 'Palier de budget assigné automatiquement selon le montant';
COMMENT ON COLUMN public.demandes_achat.montant_total IS 'Montant total calculé à partir des lignes';
COMMENT ON COLUMN public.demandes_achat.objet IS 'Objet de la demande d''achat';
COMMENT ON COLUMN public.demandes_achat.categorie IS 'Catégorie de la demande';

-- Table: Validations des demandes
CREATE TABLE IF NOT EXISTS public.purchase_request_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id UUID NOT NULL REFERENCES public.demandes_achat(id) ON DELETE CASCADE,
    niveau_validation INTEGER NOT NULL CHECK (niveau_validation > 0),
    validateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    commentaire TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_demande_niveau UNIQUE (demande_id, niveau_validation)
);

COMMENT ON TABLE public.purchase_request_validations IS 'Validations séquentielles des demandes d''achat';
COMMENT ON COLUMN public.purchase_request_validations.niveau_validation IS 'Niveau de validation (1 = première, 2 = deuxième, etc.)';
COMMENT ON COLUMN public.purchase_request_validations.statut IS 'en_attente, valide, rejete';

-- Index
CREATE INDEX IF NOT EXISTS idx_purchase_request_budget_tiers_company_id ON public.purchase_request_budget_tiers(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_budget_tiers_montant_range ON public.purchase_request_budget_tiers(company_id, montant_min, montant_max);
CREATE INDEX IF NOT EXISTS idx_purchase_request_tier_validators_tier_id ON public.purchase_request_tier_validators(tier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validation_settings_company_id ON public.purchase_request_validation_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_palier_id ON public.demandes_achat(palier_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_montant_total ON public.demandes_achat(montant_total);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_demande_id ON public.purchase_request_validations(demande_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_validateur_id ON public.purchase_request_validations(validateur_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_validations_statut ON public.purchase_request_validations(statut);

-- RLS Policies
ALTER TABLE public.budget_paliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_palier_validateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_validations ENABLE ROW LEVEL SECURITY;

-- Policies pour purchase_request_budget_tiers
CREATE POLICY "Users can view budget tiers in their company"
ON public.purchase_request_budget_tiers FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage budget tiers in their company"
ON public.purchase_request_budget_tiers FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Policies pour purchase_request_tier_validators
CREATE POLICY "Users can view validators in their company tiers"
ON public.purchase_request_tier_validators FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Admins can manage validators in their company tiers"
ON public.purchase_request_tier_validators FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Policies pour purchase_request_validation_settings
CREATE POLICY "Users can view purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR ALL
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- Les policies pour demandes_achat existent déjà dans la migration 20260121000003

-- Policies pour purchase_request_validations
CREATE POLICY "Users can view validations for their company requests"
ON public.purchase_request_validations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.demandes_achat
        WHERE demandes_achat.id = purchase_request_validations.demande_id
        AND demandes_achat.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Validators can update their assigned validations"
ON public.purchase_request_validations FOR UPDATE
TO authenticated
USING (
    validateur_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.demandes_achat
        WHERE demandes_achat.id = purchase_request_validations.demande_id
        AND demandes_achat.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Triggers
CREATE TRIGGER update_purchase_request_budget_tiers_updated_at
BEFORE UPDATE ON public.purchase_request_budget_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_request_validation_settings_updated_at
BEFORE UPDATE ON public.purchase_request_validation_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Le trigger pour demandes_achat existe déjà dans la migration 20260121000003

-- Fonction pour obtenir le palier selon le montant
CREATE OR REPLACE FUNCTION public.get_budget_palier(
    p_company_id UUID,
    p_montant DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_palier_id UUID;
BEGIN
    SELECT id INTO v_palier_id
    FROM public.purchase_request_budget_tiers
    WHERE company_id = p_company_id
      AND actif = true
      AND p_montant >= montant_min
      AND p_montant <= montant_max
    ORDER BY ordre ASC
    LIMIT 1;
    
    RETURN v_palier_id;
END;
$$;

COMMENT ON FUNCTION public.get_budget_palier IS 'Retourne le palier de budget correspondant au montant donné pour une entreprise';

-- Fonction pour générer les validations d'une demande
CREATE OR REPLACE FUNCTION public.generate_purchase_request_validations(
    p_demande_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_demande RECORD;
    v_palier RECORD;
    v_validateur RECORD;
    v_niveau INTEGER;
    v_validateur_user_id UUID;
BEGIN
    -- Récupérer la demande et son palier
    SELECT da.*, bp.nombre_validations
    INTO v_demande
    FROM public.demandes_achat da
    LEFT JOIN public.budget_paliers bp ON bp.id = da.palier_id
    WHERE da.id = p_demande_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Demande d''achat non trouvée: %', p_demande_id;
    END IF;
    
    -- Si pas de palier, pas de validation
    IF v_demande.palier_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Supprimer les validations existantes
    DELETE FROM public.purchase_request_validations
    WHERE demande_id = p_demande_id;
    
    -- Générer les validations pour chaque niveau
    FOR v_niveau IN 1..v_demande.nombre_validations LOOP
        -- Récupérer les validateurs pour ce niveau
        FOR v_validateur IN 
            SELECT * FROM public.budget_palier_validateurs
            WHERE palier_id = v_demande.palier_id
              AND niveau_validation = v_niveau
            ORDER BY ordre ASC
        LOOP
            -- Déterminer l'ID utilisateur du validateur
            IF v_validateur.type_validateur = 'user' THEN
                v_validateur_user_id := v_validateur.validateur_user_id;
            ELSIF v_validateur.type_validateur = 'role' THEN
                -- Trouver un utilisateur avec ce rôle dans la même entreprise
                SELECT ur.user_id INTO v_validateur_user_id
                FROM public.user_roles ur
                WHERE ur.company_id = v_demande.company_id
                  AND ur.role::text = v_validateur.validateur_role
                LIMIT 1;
            END IF;
            
            -- Créer la validation seulement pour le premier validateur du niveau
            -- (les autres sont des remplaçants potentiels)
            IF v_validateur.ordre = 1 AND v_validateur_user_id IS NOT NULL THEN
                INSERT INTO public.purchase_request_validations (
                    demande_id,
                    niveau_validation,
                    validateur_id,
                    statut
                ) VALUES (
                    p_demande_id,
                    v_niveau,
                    v_validateur_user_id,
                    CASE WHEN v_niveau = 1 THEN 'en_attente' ELSE 'en_attente' END
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION public.generate_purchase_request_validations IS 'Génère automatiquement les validations pour une demande d''achat selon son palier';
