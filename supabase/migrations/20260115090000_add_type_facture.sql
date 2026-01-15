-- ============================================
-- AJOUT TYPE_FACTURE POUR FACTURES D'ACOMPTE
-- ============================================

-- Ajouter la colonne type_facture à la table factures_ventes
ALTER TABLE public.factures_ventes
ADD COLUMN IF NOT EXISTS type_facture VARCHAR(20) DEFAULT 'standard' 
CHECK (type_facture IN ('standard', 'acompte'));

-- Commentaire
COMMENT ON COLUMN public.factures_ventes.type_facture IS 'Type de facture: standard = facture normale, acompte = facture d''acompte (avance client)';

-- Index pour faciliter les requêtes par type
CREATE INDEX IF NOT EXISTS idx_factures_ventes_type_facture 
ON public.factures_ventes(type_facture) 
WHERE type_facture = 'acompte';

-- Mettre à jour les factures existantes pour qu'elles soient de type 'standard'
UPDATE public.factures_ventes
SET type_facture = 'standard'
WHERE type_facture IS NULL;
