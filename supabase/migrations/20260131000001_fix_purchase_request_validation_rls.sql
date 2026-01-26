-- ============================================
-- CORRECTION RLS ET CONTRAINTES POUR VALIDATION PAR PALIERS
-- ============================================

-- 1. Permettre nombre_validations = 0 (palier sans validation)
ALTER TABLE public.purchase_request_budget_tiers
DROP CONSTRAINT IF EXISTS purchase_request_budget_tiers_nombre_validations_check;

ALTER TABLE public.purchase_request_budget_tiers
ADD CONSTRAINT purchase_request_budget_tiers_nombre_validations_check 
CHECK (nombre_validations >= 0);

-- 2. Supprimer la contrainte unique sur ordre (permettre plusieurs paliers avec le même ordre)
ALTER TABLE public.purchase_request_budget_tiers
DROP CONSTRAINT IF EXISTS unique_company_ordre;

-- 3. Corriger les politiques RLS pour utiliser user_belongs_to_company au lieu de get_user_company_id
-- (évite les problèmes de récursion et fonctionne mieux avec les utilisateurs authentifiés)

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view budget tiers in their company" ON public.purchase_request_budget_tiers;
DROP POLICY IF EXISTS "Admins can manage budget tiers in their company" ON public.purchase_request_budget_tiers;
DROP POLICY IF EXISTS "Users can view validators in their company tiers" ON public.purchase_request_tier_validators;
DROP POLICY IF EXISTS "Admins can manage validators in their company tiers" ON public.purchase_request_tier_validators;
DROP POLICY IF EXISTS "Users can view purchase request validation settings in their company" ON public.purchase_request_validation_settings;
DROP POLICY IF EXISTS "Admins can manage purchase request validation settings in their company" ON public.purchase_request_validation_settings;

-- Recréer les policies avec user_belongs_to_company
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

-- 4. Mettre à jour la fonction generate_purchase_request_validations pour gérer nombre_validations = 0
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
    LEFT JOIN public.purchase_request_budget_tiers bp ON bp.id = da.palier_id
    WHERE da.id = p_demande_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Demande d''achat non trouvée: %', p_demande_id;
    END IF;
    
    -- Si pas de palier, pas de validation
    IF v_demande.palier_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Si nombre_validations = 0, approuver directement sans validation
    IF v_demande.nombre_validations = 0 OR v_demande.nombre_validations IS NULL THEN
        UPDATE public.demandes_achat
        SET statut = 'validee',
            validated_at = NOW()
        WHERE id = p_demande_id;
        RETURN;
    END IF;
    
    -- Supprimer les validations existantes
    DELETE FROM public.purchase_request_validations
    WHERE demande_id = p_demande_id;
    
    -- Générer les validations pour chaque niveau
    FOR v_niveau IN 1..v_demande.nombre_validations LOOP
        -- Récupérer les validateurs pour ce niveau
        FOR v_validateur IN 
            SELECT * FROM public.purchase_request_tier_validators
            WHERE tier_id = v_demande.palier_id
              AND niveau_validation = v_niveau
            ORDER BY ordre ASC
        LOOP
            -- Déterminer l'ID utilisateur du validateur
            IF v_validateur.validator_type = 'user' THEN
                v_validateur_user_id := v_validateur.user_id;
            ELSIF v_validateur.validator_type = 'role' THEN
                -- Trouver un utilisateur avec ce rôle dans la même entreprise
                SELECT ur.user_id INTO v_validateur_user_id
                FROM public.user_roles ur
                WHERE ur.company_id = v_demande.company_id
                  AND ur.role::text = v_validateur.role_name
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
