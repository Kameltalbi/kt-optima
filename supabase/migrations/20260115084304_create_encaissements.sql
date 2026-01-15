-- ============================================
-- ENCAISSEMENTS ET ACOMPTES CLIENTS
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.facture_encaissements CASCADE;
DROP TABLE IF EXISTS public.encaissements CASCADE;

-- Table: encaissements
-- Description: Gère les encaissements clients (standard et acomptes)
CREATE TABLE public.encaissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    mode_paiement VARCHAR(50) NOT NULL, -- 'cheque', 'virement', 'especes', 'carte', 'autre'
    reference VARCHAR(255), -- Référence du paiement (numéro de chèque, virement, etc.)
    type_encaissement VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (type_encaissement IN ('standard', 'acompte')),
    allocated_amount DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant alloué à des factures
    remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant restant disponible
    status VARCHAR(30) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'partiellement alloué', 'totalement alloué')),
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.encaissements IS 'Encaissements clients - standard ou acomptes';
COMMENT ON COLUMN public.encaissements.type_encaissement IS 'standard = lié à une facture, acompte = avance client';
COMMENT ON COLUMN public.encaissements.allocated_amount IS 'Montant déjà alloué à des factures';
COMMENT ON COLUMN public.encaissements.remaining_amount IS 'Montant restant disponible pour allocation';
COMMENT ON COLUMN public.encaissements.status IS 'Statut basé sur allocated_amount vs montant';

-- Enable RLS
ALTER TABLE public.encaissements ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_encaissements_company_id ON public.encaissements(company_id);
CREATE INDEX idx_encaissements_client_id ON public.encaissements(client_id);
CREATE INDEX idx_encaissements_date ON public.encaissements(date);
CREATE INDEX idx_encaissements_type ON public.encaissements(type_encaissement);
CREATE INDEX idx_encaissements_status ON public.encaissements(status);
CREATE INDEX idx_encaissements_remaining ON public.encaissements(remaining_amount) WHERE remaining_amount > 0;

-- RLS Policies
CREATE POLICY "Users can view encaissements in their company"
ON public.encaissements FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert encaissements in their company"
ON public.encaissements FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update encaissements in their company"
ON public.encaissements FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete encaissements in their company"
ON public.encaissements FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_encaissements_updated_at
BEFORE UPDATE ON public.encaissements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour calculer le statut automatiquement
CREATE OR REPLACE FUNCTION public.update_encaissement_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.allocated_amount = 0 THEN
        NEW.status = 'disponible';
    ELSIF NEW.allocated_amount >= NEW.montant THEN
        NEW.status = 'totalement alloué';
    ELSE
        NEW.status = 'partiellement alloué';
    END IF;
    
    NEW.remaining_amount = NEW.montant - NEW.allocated_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_encaissement_status
BEFORE INSERT OR UPDATE ON public.encaissements
FOR EACH ROW
EXECUTE FUNCTION public.update_encaissement_status();

-- Table: facture_encaissements
-- Description: Table de liaison entre factures et encaissements (allocation)
CREATE TABLE public.facture_encaissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_id UUID NOT NULL REFERENCES public.factures_ventes(id) ON DELETE CASCADE,
    encaissement_id UUID NOT NULL REFERENCES public.encaissements(id) ON DELETE CASCADE,
    montant_alloue DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT facture_encaissements_unique UNIQUE (facture_id, encaissement_id)
);

COMMENT ON TABLE public.facture_encaissements IS 'Liaison factures-encaissements pour allocation des acomptes';
COMMENT ON COLUMN public.facture_encaissements.montant_alloue IS 'Montant alloué de cet encaissement à cette facture';

-- Enable RLS
ALTER TABLE public.facture_encaissements ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_facture_encaissements_facture_id ON public.facture_encaissements(facture_id);
CREATE INDEX idx_facture_encaissements_encaissement_id ON public.facture_encaissements(encaissement_id);

-- RLS Policies
CREATE POLICY "Users can view facture_encaissements in their company"
ON public.facture_encaissements FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_encaissements.facture_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can insert facture_encaissements in their company"
ON public.facture_encaissements FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_encaissements.facture_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can update facture_encaissements in their company"
ON public.facture_encaissements FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_encaissements.facture_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can delete facture_encaissements in their company"
ON public.facture_encaissements FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes fv
        WHERE fv.id = facture_encaissements.facture_id
        AND fv.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Trigger pour mettre à jour allocated_amount dans encaissements
CREATE OR REPLACE FUNCTION public.update_encaissement_allocated()
RETURNS TRIGGER AS $$
DECLARE
    v_encaissement_id UUID;
    v_montant_alloue DECIMAL(15, 2);
BEGIN
    -- Déterminer l'encaissement concerné
    IF TG_OP = 'DELETE' THEN
        v_encaissement_id = OLD.encaissement_id;
    ELSE
        v_encaissement_id = NEW.encaissement_id;
    END IF;
    
    -- Calculer le montant total alloué pour cet encaissement
    SELECT COALESCE(SUM(montant_alloue), 0)
    INTO v_montant_alloue
    FROM public.facture_encaissements
    WHERE encaissement_id = v_encaissement_id;
    
    -- Mettre à jour l'encaissement (le trigger update_encaissement_status calculera le statut et remaining_amount)
    UPDATE public.encaissements
    SET allocated_amount = v_montant_alloue
    WHERE id = v_encaissement_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_encaissement_allocated
AFTER INSERT OR UPDATE OR DELETE ON public.facture_encaissements
FOR EACH ROW
EXECUTE FUNCTION public.update_encaissement_allocated();
