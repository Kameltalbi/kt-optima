-- Table des bons de livraison
CREATE TABLE public.bons_livraison (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  facture_vente_id UUID REFERENCES public.factures_ventes(id) ON DELETE SET NULL,
  numero VARCHAR NOT NULL,
  date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
  adresse_livraison TEXT,
  statut VARCHAR NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'valide', 'livre', 'annule')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT bons_livraison_numero_company_unique UNIQUE (numero, company_id)
);

-- Lignes des bons de livraison
CREATE TABLE public.bon_livraison_lignes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bon_livraison_id UUID NOT NULL REFERENCES public.bons_livraison(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES public.produits(id) ON DELETE SET NULL,
  description TEXT,
  quantite NUMERIC NOT NULL DEFAULT 1,
  unite VARCHAR DEFAULT 'unité',
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bons_livraison ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bon_livraison_lignes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bons_livraison
CREATE POLICY "Users can view bons_livraison in their company"
  ON public.bons_livraison FOR SELECT
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert bons_livraison in their company"
  ON public.bons_livraison FOR INSERT
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update bons_livraison in their company"
  ON public.bons_livraison FOR UPDATE
  USING (company_id = get_user_company_id(auth.uid()))
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete bons_livraison in their company"
  ON public.bons_livraison FOR DELETE
  USING (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for bon_livraison_lignes
CREATE POLICY "Users can manage bon_livraison_lignes via bon_livraison"
  ON public.bon_livraison_lignes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.bons_livraison
    WHERE bons_livraison.id = bon_livraison_lignes.bon_livraison_id
    AND bons_livraison.company_id = get_user_company_id(auth.uid())
  ));

-- Indexes
CREATE INDEX idx_bons_livraison_company_id ON public.bons_livraison(company_id);
CREATE INDEX idx_bons_livraison_client_id ON public.bons_livraison(client_id);
CREATE INDEX idx_bons_livraison_date ON public.bons_livraison(date_livraison);
CREATE INDEX idx_bons_livraison_statut ON public.bons_livraison(statut);
CREATE INDEX idx_bon_livraison_lignes_bon_id ON public.bon_livraison_lignes(bon_livraison_id);

-- Trigger for updated_at
CREATE TRIGGER update_bons_livraison_updated_at
  BEFORE UPDATE ON public.bons_livraison
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();