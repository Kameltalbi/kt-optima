-- Ajouter les colonnes pour la remise sur les factures de vente
ALTER TABLE public.factures_ventes 
ADD COLUMN IF NOT EXISTS remise_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS remise_valeur NUMERIC(12,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remise_montant NUMERIC(12,3) DEFAULT 0;

COMMENT ON COLUMN public.factures_ventes.remise_type IS 'Type de remise: percentage ou amount';
COMMENT ON COLUMN public.factures_ventes.remise_valeur IS 'Valeur saisie (pourcentage ou montant fixe)';
COMMENT ON COLUMN public.factures_ventes.remise_montant IS 'Montant calculé de la remise';