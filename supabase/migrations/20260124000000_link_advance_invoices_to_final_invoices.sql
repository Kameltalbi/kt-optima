-- ============================================
-- LIAISON FACTURES D'ACOMPTE AUX FACTURES FINALES
-- ============================================

-- Table pour lier les factures d'acompte aux factures finales
CREATE TABLE IF NOT EXISTS public.facture_acompte_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_finale_id UUID NOT NULL REFERENCES public.factures_ventes(id) ON DELETE CASCADE,
    facture_acompte_id UUID NOT NULL REFERENCES public.factures_ventes(id) ON DELETE RESTRICT,
    montant_alloue DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT facture_acompte_allocations_unique UNIQUE (facture_finale_id, facture_acompte_id)
);

COMMENT ON TABLE public.facture_acompte_allocations IS 'Liaison factures d''acompte - factures finales pour allocation des acomptes';
COMMENT ON COLUMN public.facture_acompte_allocations.montant_alloue IS 'Montant alloué de cette facture d''acompte à cette facture finale';

-- Enable RLS
ALTER TABLE public.facture_acompte_allocations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_facture_acompte_allocations_facture_finale ON public.facture_acompte_allocations(facture_finale_id);
CREATE INDEX IF NOT EXISTS idx_facture_acompte_allocations_facture_acompte ON public.facture_acompte_allocations(facture_acompte_id);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view facture_acompte_allocations in their company" ON public.facture_acompte_allocations;
CREATE POLICY "Users can view facture_acompte_allocations in their company"
ON public.facture_acompte_allocations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_acompte_allocations.facture_finale_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage facture_acompte_allocations in their company" ON public.facture_acompte_allocations;
CREATE POLICY "Users can manage facture_acompte_allocations in their company"
ON public.facture_acompte_allocations FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_acompte_allocations.facture_finale_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_acompte_allocations.facture_finale_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Fonction pour calculer le montant disponible d'une facture d'acompte
CREATE OR REPLACE FUNCTION public.get_facture_acompte_available_amount(p_facture_acompte_id UUID)
RETURNS DECIMAL(15, 2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_montant_ttc DECIMAL(15, 2);
    v_montant_alloue DECIMAL(15, 2);
BEGIN
    -- Récupérer le montant TTC de la facture d'acompte
    SELECT montant_ttc INTO v_montant_ttc
    FROM public.factures_ventes
    WHERE id = p_facture_acompte_id;
    
    -- Calculer le montant déjà alloué
    SELECT COALESCE(SUM(montant_alloue), 0) INTO v_montant_alloue
    FROM public.facture_acompte_allocations
    WHERE facture_acompte_id = p_facture_acompte_id;
    
    -- Retourner le montant disponible
    RETURN COALESCE(v_montant_ttc, 0) - COALESCE(v_montant_alloue, 0);
END;
$$;

COMMENT ON FUNCTION public.get_facture_acompte_available_amount(UUID) IS 'Calcule le montant disponible d''une facture d''acompte (montant TTC - montant déjà alloué)';
