-- ============================================
-- CORRECTION RLS ET CONTRAINTES POUR VALIDATION PAR PALIERS
-- ============================================

-- Table: Validateurs par défaut par niveau (créés dans le module RH)
CREATE TABLE IF NOT EXISTS public.purchase_request_default_validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    niveau INTEGER NOT NULL CHECK (niveau IN (1, 2, 3)),
    validator_type VARCHAR(20) NOT NULL CHECK (validator_type IN ('role', 'user')),
    role_name VARCHAR(50), -- Si type = 'role'
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Si type = 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_niveau UNIQUE (company_id, niveau),
    CONSTRAINT check_default_validator_type CHECK (
        (validator_type = 'role' AND role_name IS NOT NULL AND user_id IS NULL) OR
        (validator_type = 'user' AND user_id IS NOT NULL AND role_name IS NULL)
    )
);

COMMENT ON TABLE public.purchase_request_default_validators IS 'Validateurs par défaut par niveau de validation (configurés dans le module RH)';
COMMENT ON COLUMN public.purchase_request_default_validators.niveau IS 'Niveau de validation (1, 2 ou 3)';
COMMENT ON COLUMN public.purchase_request_default_validators.validator_type IS 'Type: role ou user';
COMMENT ON COLUMN public.purchase_request_default_validators.role_name IS 'Rôle du validateur si type = role (doit exister dans user_roles)';
COMMENT ON COLUMN public.purchase_request_default_validators.user_id IS 'ID utilisateur si type = user (doit exister dans profiles)';

-- Index
CREATE INDEX IF NOT EXISTS idx_purchase_request_default_validators_company_id ON public.purchase_request_default_validators(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_default_validators_niveau ON public.purchase_request_default_validators(niveau);

-- RLS
ALTER TABLE public.purchase_request_default_validators ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can view default validators in their company" ON public.purchase_request_default_validators;
DROP POLICY IF EXISTS "Admins can manage default validators in their company" ON public.purchase_request_default_validators;

CREATE POLICY "Users can view default validators in their company"
ON public.purchase_request_default_validators FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage default validators in their company"
ON public.purchase_request_default_validators FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_purchase_request_default_validators_updated_at ON public.purchase_request_default_validators;
CREATE TRIGGER update_purchase_request_default_validators_updated_at
BEFORE UPDATE ON public.purchase_request_default_validators
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1. Permettre nombre_validations = 0 (palier sans validation)
ALTER TABLE public.purchase_request_budget_tiers
DROP CONSTRAINT IF EXISTS purchase_request_budget_tiers_nombre_validations_check;

ALTER TABLE public.purchase_request_budget_tiers
ADD CONSTRAINT purchase_request_budget_tiers_nombre_validations_check 
CHECK (nombre_validations >= 0);

-- 2. Supprimer la contrainte unique sur ordre
ALTER TABLE public.purchase_request_budget_tiers
DROP CONSTRAINT IF EXISTS unique_company_ordre;

-- 3. Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view budget tiers in their company" ON public.purchase_request_budget_tiers;
DROP POLICY IF EXISTS "Admins can manage budget tiers in their company" ON public.purchase_request_budget_tiers;
DROP POLICY IF EXISTS "Users can view validators in their company tiers" ON public.purchase_request_tier_validators;
DROP POLICY IF EXISTS "Admins can manage validators in their company tiers" ON public.purchase_request_tier_validators;
DROP POLICY IF EXISTS "Users can view purchase request validation settings in their company" ON public.purchase_request_validation_settings;
DROP POLICY IF EXISTS "Admins can manage purchase request validation settings in their company" ON public.purchase_request_validation_settings;

-- 4. Recréer les policies pour purchase_request_budget_tiers
CREATE POLICY "Users can view budget tiers in their company"
ON public.purchase_request_budget_tiers FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage budget tiers in their company"
ON public.purchase_request_budget_tiers FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- 5. Recréer les policies pour purchase_request_tier_validators
CREATE POLICY "Users can view validators in their company tiers"
ON public.purchase_request_tier_validators FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins can manage validators in their company tiers"
ON public.purchase_request_tier_validators FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.purchase_request_budget_tiers
        WHERE purchase_request_budget_tiers.id = purchase_request_tier_validators.tier_id
        AND purchase_request_budget_tiers.company_id IN (
            SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
        )
    )
);

-- 6. Recréer les policies pour purchase_request_validation_settings
CREATE POLICY "Users can view purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage purchase request validation settings in their company"
ON public.purchase_request_validation_settings FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- 7. Mettre à jour la fonction generate_purchase_request_validations
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
    SELECT da.*, bp.nombre_validations
    INTO v_demande
    FROM public.demandes_achat da
    LEFT JOIN public.purchase_request_budget_tiers bp ON bp.id = da.palier_id
    WHERE da.id = p_demande_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Demande d''achat non trouvée: %', p_demande_id;
    END IF;
    
    IF v_demande.palier_id IS NULL THEN
        RETURN;
    END IF;
    
    IF v_demande.nombre_validations = 0 OR v_demande.nombre_validations IS NULL THEN
        UPDATE public.demandes_achat
        SET statut = 'validee',
            validated_at = NOW()
        WHERE id = p_demande_id;
        RETURN;
    END IF;
    
    DELETE FROM public.purchase_request_validations
    WHERE demande_id = p_demande_id;
    
    FOR v_niveau IN 1..v_demande.nombre_validations LOOP
        FOR v_validateur IN 
            SELECT * FROM public.purchase_request_tier_validators
            WHERE tier_id = v_demande.palier_id
              AND niveau_validation = v_niveau
            ORDER BY ordre ASC
        LOOP
            IF v_validateur.validator_type = 'user' THEN
                v_validateur_user_id := v_validateur.user_id;
            ELSIF v_validateur.validator_type = 'role' THEN
                SELECT ur.user_id INTO v_validateur_user_id
                FROM public.user_roles ur
                WHERE ur.company_id = v_demande.company_id
                  AND ur.role::text = v_validateur.role_name
                LIMIT 1;
            END IF;
            
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
                    'en_attente'
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- 8. Permettre montant_max = NULL (infini)
ALTER TABLE public.purchase_request_budget_tiers
ALTER COLUMN montant_max DROP NOT NULL;

-- Mettre à jour la contrainte CHECK pour gérer montant_max NULL
ALTER TABLE public.purchase_request_budget_tiers
DROP CONSTRAINT IF EXISTS check_montant_range;

ALTER TABLE public.purchase_request_budget_tiers
ADD CONSTRAINT check_montant_range CHECK (
    montant_max IS NULL OR montant_max > montant_min
);

COMMENT ON COLUMN public.purchase_request_budget_tiers.montant_max IS 'Montant maximum du palier (inclus). NULL = infini';

-- 9. Mettre à jour la fonction get_budget_palier pour gérer montant_max NULL (infini)
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
      AND (montant_max IS NULL OR p_montant <= montant_max)
    ORDER BY ordre ASC
    LIMIT 1;
    
    RETURN v_palier_id;
END;
$$;
