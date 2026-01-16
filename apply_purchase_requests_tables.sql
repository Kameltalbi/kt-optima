-- ============================================
-- DEMANDES D'ACHAT
-- Script à exécuter directement dans Supabase SQL Editor
-- ============================================

-- Table: demandes_achat
-- Description: Demandes d'achat internes avant création de bon de commande
CREATE TABLE IF NOT EXISTS public.demandes_achat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) NOT NULL,
    date_demande DATE NOT NULL,
    demandeur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    departement VARCHAR(100),
    priorite VARCHAR(20) NOT NULL DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente', 'approuvee', 'rejetee', 'convertie', 'annulee')),
    approbateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    date_approbation DATE,
    notes TEXT,
    bon_commande_id UUID, -- Lien vers le bon de commande créé (sera lié à purchase_orders quand la table existera)
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT demandes_achat_numero_company_unique UNIQUE (numero, company_id)
);

COMMENT ON TABLE public.demandes_achat IS 'Demandes d''achat internes - étape préalable aux bons de commande';
COMMENT ON COLUMN public.demandes_achat.demandeur_id IS 'Utilisateur qui fait la demande';
COMMENT ON COLUMN public.demandes_achat.approbateur_id IS 'Utilisateur qui approuve la demande';
COMMENT ON COLUMN public.demandes_achat.bon_commande_id IS 'Bon de commande créé à partir de cette demande';

-- Enable RLS
ALTER TABLE public.demandes_achat ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_demandes_achat_company_id ON public.demandes_achat(company_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_demandeur_id ON public.demandes_achat(demandeur_id);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_statut ON public.demandes_achat(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_date_demande ON public.demandes_achat(date_demande);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view demandes_achat in their company" ON public.demandes_achat;
CREATE POLICY "Users can view demandes_achat in their company"
ON public.demandes_achat FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users can manage demandes_achat in their company" ON public.demandes_achat;
CREATE POLICY "Users can manage demandes_achat in their company"
ON public.demandes_achat FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_demandes_achat_updated_at ON public.demandes_achat;
CREATE TRIGGER update_demandes_achat_updated_at
BEFORE UPDATE ON public.demandes_achat
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- LIGNES DE DEMANDE D'ACHAT
-- ============================================

-- Table: demande_achat_lignes
-- Description: Lignes de produits/services dans une demande d'achat
CREATE TABLE IF NOT EXISTS public.demande_achat_lignes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_achat_id UUID NOT NULL REFERENCES public.demandes_achat(id) ON DELETE CASCADE,
    produit_id UUID, -- Référence vers produit (sera lié à produits quand la table existera)
    description TEXT NOT NULL,
    quantite DECIMAL(10, 2) NOT NULL,
    prix_unitaire_estime DECIMAL(15, 2),
    montant_estime DECIMAL(15, 2),
    unite VARCHAR(50),
    notes TEXT,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.demande_achat_lignes IS 'Lignes de produits/services dans une demande d''achat';

-- Enable RLS
ALTER TABLE public.demande_achat_lignes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_demande_achat_lignes_demande_id ON public.demande_achat_lignes(demande_achat_id);
CREATE INDEX IF NOT EXISTS idx_demande_achat_lignes_produit_id ON public.demande_achat_lignes(produit_id);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view demande_achat_lignes via demande" ON public.demande_achat_lignes;
CREATE POLICY "Users can view demande_achat_lignes via demande"
ON public.demande_achat_lignes FOR SELECT
USING (
    demande_achat_id IN (
        SELECT id FROM public.demandes_achat 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);

DROP POLICY IF EXISTS "Users can manage demande_achat_lignes via demande" ON public.demande_achat_lignes;
CREATE POLICY "Users can manage demande_achat_lignes via demande"
ON public.demande_achat_lignes FOR ALL
USING (
    demande_achat_id IN (
        SELECT id FROM public.demandes_achat 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);
