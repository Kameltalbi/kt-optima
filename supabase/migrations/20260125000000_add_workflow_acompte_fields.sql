-- ============================================
-- WORKFLOW FACTURATION AVEC ACOMPTE
-- Ajout des champs pour gérer le workflow complet
-- ============================================

-- Ajouter les champs manquants à la table factures_ventes
ALTER TABLE public.factures_ventes
ADD COLUMN IF NOT EXISTS acompte_valeur DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS acompte_type VARCHAR(20) CHECK (acompte_type IN ('amount', 'percentage')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS facture_parent_id UUID REFERENCES public.factures_ventes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS devis_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.factures_ventes.acompte_valeur IS 'Montant ou pourcentage de l''acompte demandé';
COMMENT ON COLUMN public.factures_ventes.acompte_type IS 'Type d''acompte: amount (montant fixe) ou percentage (pourcentage)';
COMMENT ON COLUMN public.factures_ventes.facture_parent_id IS 'ID de la facture d''acompte parente (pour facture finale) ou ID de la facture finale (pour facture d''acompte)';
COMMENT ON COLUMN public.factures_ventes.devis_id IS 'ID du devis source (optionnel)';

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_factures_ventes_facture_parent_id ON public.factures_ventes(facture_parent_id);
CREATE INDEX IF NOT EXISTS idx_factures_ventes_devis_id ON public.factures_ventes(devis_id);
CREATE INDEX IF NOT EXISTS idx_factures_ventes_type_facture ON public.factures_ventes(type_facture);

-- Fonction pour calculer le montant de l'acompte
CREATE OR REPLACE FUNCTION public.calculate_acompte_amount(
    p_total_ttc DECIMAL(15, 2),
    p_acompte_type VARCHAR(20),
    p_acompte_valeur DECIMAL(15, 2)
)
RETURNS DECIMAL(15, 2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_acompte_type = 'percentage' THEN
        RETURN (p_total_ttc * p_acompte_valeur) / 100;
    ELSIF p_acompte_type = 'amount' THEN
        RETURN LEAST(p_acompte_valeur, p_total_ttc); -- Ne pas dépasser le total
    ELSE
        RETURN 0;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.calculate_acompte_amount(DECIMAL, VARCHAR, DECIMAL) IS 'Calcule le montant de l''acompte selon le type (montant fixe ou pourcentage)';
