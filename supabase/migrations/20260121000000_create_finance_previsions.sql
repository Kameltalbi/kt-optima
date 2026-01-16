-- ============================================
-- PRÉVISIONS FINANCIÈRES
-- ============================================

-- Table: previsions
-- Description: Prévisions de trésorerie (entrées/sorties prévues)
CREATE TABLE IF NOT EXISTS public.previsions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('entree', 'sortie')),
    date_prevue DATE NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    description TEXT NOT NULL,
    source_module VARCHAR(50), -- 'ventes', 'achats', 'paie', 'manuel'
    source_id UUID, -- ID du document source (facture, bon de commande, fiche de paie, etc.)
    source_reference VARCHAR(255), -- Numéro de référence (FAC-2024-001, etc.)
    statut VARCHAR(20) NOT NULL DEFAULT 'prevue' CHECK (statut IN ('prevue', 'realisee', 'annulee')),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL, -- Lien vers la transaction réalisée
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.previsions IS 'Prévisions de trésorerie (entrées/sorties prévues)';
COMMENT ON COLUMN public.previsions.source_module IS 'Module source: ventes, achats, paie, manuel';
COMMENT ON COLUMN public.previsions.source_id IS 'ID du document source (facture, bon de commande, etc.)';
COMMENT ON COLUMN public.previsions.source_reference IS 'Numéro de référence du document source';
COMMENT ON COLUMN public.previsions.statut IS 'prevue = prévue, realisee = réalisée (transaction créée), annulee = annulée';

-- Enable RLS
ALTER TABLE public.previsions ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_previsions_company_id ON public.previsions(company_id);
CREATE INDEX idx_previsions_date_prevue ON public.previsions(date_prevue);
CREATE INDEX idx_previsions_source ON public.previsions(source_module, source_id);
CREATE INDEX idx_previsions_statut ON public.previsions(statut);

-- RLS Policies
CREATE POLICY "Users can view previsions in their company"
ON public.previsions FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage previsions in their company"
ON public.previsions FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_previsions_updated_at
BEFORE UPDATE ON public.previsions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement une prévision depuis une facture client
CREATE OR REPLACE FUNCTION public.create_prevision_from_facture()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une prévision d'entrée si la facture est validée et non payée
    IF NEW.statut = 'validee' AND OLD.statut != 'validee' THEN
        INSERT INTO public.previsions (
            account_id,
            type,
            date_prevue,
            montant,
            description,
            source_module,
            source_id,
            source_reference,
            company_id,
            created_by
        )
        VALUES (
            NULL, -- Pas de compte spécifique par défaut
            'entree',
            NEW.date_echeance, -- Date d'échéance de la facture
            NEW.total_ttc,
            'Facture client ' || NEW.numero,
            'ventes',
            NEW.id,
            NEW.numero,
            NEW.company_id,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement une prévision depuis une facture client
DROP TRIGGER IF EXISTS trigger_create_prevision_from_facture ON public.factures_ventes;
CREATE TRIGGER trigger_create_prevision_from_facture
AFTER INSERT OR UPDATE ON public.factures_ventes
FOR EACH ROW
WHEN (NEW.statut = 'validee')
EXECUTE FUNCTION public.create_prevision_from_facture();

-- Fonction pour créer automatiquement une prévision depuis un bon de commande fournisseur
CREATE OR REPLACE FUNCTION public.create_prevision_from_bon_commande()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une prévision de sortie si le bon de commande est validé
    IF NEW.statut = 'valide' AND OLD.statut != 'valide' THEN
        INSERT INTO public.previsions (
            account_id,
            type,
            date_prevue,
            montant,
            description,
            source_module,
            source_id,
            source_reference,
            company_id,
            created_by
        )
        VALUES (
            NULL,
            'sortie',
            NEW.date_livraison_prevue, -- Date de livraison prévue
            NEW.total_ttc,
            'Bon de commande fournisseur ' || NEW.numero,
            'achats',
            NEW.id,
            NEW.numero,
            NEW.company_id,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement une prévision depuis un bon de commande fournisseur
DROP TRIGGER IF EXISTS trigger_create_prevision_from_bon_commande ON public.bons_commande_fournisseurs;
CREATE TRIGGER trigger_create_prevision_from_bon_commande
AFTER INSERT OR UPDATE ON public.bons_commande_fournisseurs
FOR EACH ROW
WHEN (NEW.statut = 'valide')
EXECUTE FUNCTION public.create_prevision_from_bon_commande();

-- Fonction pour créer automatiquement une prévision depuis une fiche de paie
CREATE OR REPLACE FUNCTION public.create_prevision_from_fiche_paie()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une prévision de sortie pour chaque fiche de paie validée
    IF NEW.statut = 'validee' AND OLD.statut != 'validee' THEN
        INSERT INTO public.previsions (
            account_id,
            type,
            date_prevue,
            montant,
            description,
            source_module,
            source_id,
            source_reference,
            company_id,
            created_by
        )
        VALUES (
            NULL,
            'sortie',
            NEW.date_paiement, -- Date de paiement de la fiche de paie
            NEW.net_a_payer,
            'Paie ' || NEW.periode || ' - ' || NEW.employe_nom,
            'paie',
            NEW.id,
            'PAIE-' || NEW.periode || '-' || NEW.employe_nom,
            NEW.company_id,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement une prévision depuis une fiche de paie
DROP TRIGGER IF EXISTS trigger_create_prevision_from_fiche_paie ON public.fiches_paie;
CREATE TRIGGER trigger_create_prevision_from_fiche_paie
AFTER INSERT OR UPDATE ON public.fiches_paie
FOR EACH ROW
WHEN (NEW.statut = 'validee')
EXECUTE FUNCTION public.create_prevision_from_fiche_paie();
