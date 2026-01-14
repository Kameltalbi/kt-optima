-- ============================================
-- ERP MVP - SCHÉMA COMPLET
-- Migration Supabase
-- Version: MVP
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS public.produit_type CASCADE;
DROP TYPE IF EXISTS public.mouvement_stock_type CASCADE;
DROP TYPE IF EXISTS public.facture_statut CASCADE;
DROP TYPE IF EXISTS public.mouvement_tresorerie_type CASCADE;
DROP TYPE IF EXISTS public.ecriture_ligne_type CASCADE;
DROP TYPE IF EXISTS public.parc_actif_type CASCADE;
DROP TYPE IF EXISTS public.parc_affectation_statut CASCADE;

CREATE TYPE public.produit_type AS ENUM ('produit', 'service');
CREATE TYPE public.mouvement_stock_type AS ENUM ('entree', 'sortie');
CREATE TYPE public.facture_statut AS ENUM ('brouillon', 'validee', 'annulee', 'payee');
CREATE TYPE public.mouvement_tresorerie_type AS ENUM ('entree', 'sortie');
CREATE TYPE public.ecriture_ligne_type AS ENUM ('debit', 'credit');
CREATE TYPE public.parc_actif_type AS ENUM ('vehicule', 'materiel', 'immobilier', 'autre');
CREATE TYPE public.parc_affectation_statut AS ENUM ('active', 'terminee');

-- ============================================
-- MODULE CRM - CLIENTS
-- ============================================

-- Drop existing table if it exists (old schema)
DROP TABLE IF EXISTS public.clients CASCADE;

CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'prospect' CHECK (type IN ('prospect', 'client')),
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    numero_fiscal VARCHAR(100),
    numero_registre_commerce VARCHAR(100),
    site_web VARCHAR(255),
    notes TEXT,
    solde_initial DECIMAL(15, 2) DEFAULT 0,
    solde_actuel DECIMAL(15, 2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT clients_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.clients IS 'Gère les clients et prospects du module CRM';

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view clients in their company" ON public.clients;
DROP POLICY IF EXISTS "Users can manage clients in their company" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients in their company" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in their company" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in their company" ON public.clients;

-- Index
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_clients_type ON public.clients(type);
CREATE INDEX idx_clients_code ON public.clients(code);
CREATE INDEX idx_clients_nom ON public.clients(nom);

-- RLS Policies
CREATE POLICY "Users can view clients in their company"
ON public.clients FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert clients in their company"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update clients in their company"
ON public.clients FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete clients in their company"
ON public.clients FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE FOURNISSEURS
-- ============================================

-- Drop existing suppliers table if it exists (old schema)
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.fournisseurs CASCADE;

CREATE TABLE public.fournisseurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    numero_fiscal VARCHAR(100),
    numero_registre_commerce VARCHAR(100),
    site_web VARCHAR(255),
    notes TEXT,
    solde_initial DECIMAL(15, 2) DEFAULT 0,
    solde_actuel DECIMAL(15, 2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fournisseurs_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.fournisseurs IS 'Gère les fournisseurs de l''entreprise';

-- Enable RLS
ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_fournisseurs_company_id ON public.fournisseurs(company_id);
CREATE INDEX idx_fournisseurs_code ON public.fournisseurs(code);
CREATE INDEX idx_fournisseurs_nom ON public.fournisseurs(nom);

-- RLS Policies
CREATE POLICY "Users can view fournisseurs in their company"
ON public.fournisseurs FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert fournisseurs in their company"
ON public.fournisseurs FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update fournisseurs in their company"
ON public.fournisseurs FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete fournisseurs in their company"
ON public.fournisseurs FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE PRODUITS / SERVICES
-- ============================================

-- Drop existing products/services tables if they exist
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;
DROP TABLE IF EXISTS public.produits CASCADE;

CREATE TABLE public.produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    type public.produit_type NOT NULL DEFAULT 'produit',
    stockable BOOLEAN DEFAULT false,
    unite VARCHAR(20) DEFAULT 'unite',
    prix_achat DECIMAL(15, 2) DEFAULT 0,
    prix_vente DECIMAL(15, 2) NOT NULL,
    taux_tva DECIMAL(5, 2) DEFAULT 0,
    categorie VARCHAR(100),
    stock_actuel DECIMAL(15, 3) DEFAULT 0,
    stock_minimum DECIMAL(15, 3) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT produits_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.produits IS 'Gère les produits et services de l''entreprise';

-- Enable RLS
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_produits_company_id ON public.produits(company_id);
CREATE INDEX idx_produits_code ON public.produits(code);
CREATE INDEX idx_produits_type ON public.produits(type);
CREATE INDEX idx_produits_stockable ON public.produits(stockable);
CREATE INDEX idx_produits_categorie ON public.produits(categorie);

-- RLS Policies
CREATE POLICY "Users can view produits in their company"
ON public.produits FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert produits in their company"
ON public.produits FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update produits in their company"
ON public.produits FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete produits in their company"
ON public.produits FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE VENTES
-- ============================================

-- Drop existing invoices tables if they exist
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.factures_ventes CASCADE;
DROP TABLE IF EXISTS public.facture_vente_lignes CASCADE;

CREATE TABLE public.factures_ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) NOT NULL,
    date_facture DATE NOT NULL,
    date_echeance DATE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    statut public.facture_statut DEFAULT 'brouillon',
    montant_ht DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_paye DECIMAL(15, 2) DEFAULT 0,
    montant_restant DECIMAL(15, 2) NOT NULL DEFAULT 0,
    conditions_paiement VARCHAR(100),
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT factures_ventes_numero_company_unique UNIQUE (numero, company_id)
);

COMMENT ON TABLE public.factures_ventes IS 'Factures de vente - génère mouvements de stock et écritures comptables';

-- Enable RLS
ALTER TABLE public.factures_ventes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_factures_ventes_company_id ON public.factures_ventes(company_id);
CREATE INDEX idx_factures_ventes_client_id ON public.factures_ventes(client_id);
CREATE INDEX idx_factures_ventes_numero ON public.factures_ventes(numero);
CREATE INDEX idx_factures_ventes_date_facture ON public.factures_ventes(date_facture);
CREATE INDEX idx_factures_ventes_statut ON public.factures_ventes(statut);

-- RLS Policies
CREATE POLICY "Users can view factures_ventes in their company"
ON public.factures_ventes FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert factures_ventes in their company"
ON public.factures_ventes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update factures_ventes in their company"
ON public.factures_ventes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete factures_ventes in their company"
ON public.factures_ventes FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: facture_vente_lignes
CREATE TABLE public.facture_vente_lignes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_vente_id UUID NOT NULL REFERENCES public.factures_ventes(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES public.produits(id) ON DELETE RESTRICT,
    description TEXT,
    quantite DECIMAL(15, 3) NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(15, 2) NOT NULL,
    taux_tva DECIMAL(5, 2) DEFAULT 0,
    montant_ht DECIMAL(15, 2) NOT NULL,
    montant_tva DECIMAL(15, 2) NOT NULL,
    montant_ttc DECIMAL(15, 2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.facture_vente_lignes IS 'Lignes de détail des factures de vente';

-- Enable RLS
ALTER TABLE public.facture_vente_lignes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_facture_vente_lignes_facture_id ON public.facture_vente_lignes(facture_vente_id);
CREATE INDEX idx_facture_vente_lignes_produit_id ON public.facture_vente_lignes(produit_id);

-- RLS Policies (via facture parent)
CREATE POLICY "Users can manage facture_vente_lignes via facture"
ON public.facture_vente_lignes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_ventes
        WHERE id = facture_vente_lignes.facture_vente_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

-- ============================================
-- MODULE ACHATS
-- ============================================

-- Drop existing purchase tables if they exist
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.purchase_order_lines CASCADE;
DROP TABLE IF EXISTS public.supplier_invoices CASCADE;
DROP TABLE IF EXISTS public.supplier_invoice_items CASCADE;
DROP TABLE IF EXISTS public.factures_achats CASCADE;
DROP TABLE IF EXISTS public.facture_achat_lignes CASCADE;

CREATE TABLE public.factures_achats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) NOT NULL,
    numero_interne VARCHAR(100),
    date_facture DATE NOT NULL,
    date_echeance DATE,
    fournisseur_id UUID NOT NULL REFERENCES public.fournisseurs(id) ON DELETE RESTRICT,
    statut public.facture_statut DEFAULT 'brouillon',
    montant_ht DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_paye DECIMAL(15, 2) DEFAULT 0,
    montant_restant DECIMAL(15, 2) NOT NULL DEFAULT 0,
    conditions_paiement VARCHAR(100),
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT factures_achats_numero_company_unique UNIQUE (numero, company_id)
);

COMMENT ON TABLE public.factures_achats IS 'Factures d''achat - génère mouvements de stock et écritures comptables';

-- Enable RLS
ALTER TABLE public.factures_achats ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_factures_achats_company_id ON public.factures_achats(company_id);
CREATE INDEX idx_factures_achats_fournisseur_id ON public.factures_achats(fournisseur_id);
CREATE INDEX idx_factures_achats_numero ON public.factures_achats(numero);
CREATE INDEX idx_factures_achats_date_facture ON public.factures_achats(date_facture);
CREATE INDEX idx_factures_achats_statut ON public.factures_achats(statut);

-- RLS Policies
CREATE POLICY "Users can view factures_achats in their company"
ON public.factures_achats FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert factures_achats in their company"
ON public.factures_achats FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update factures_achats in their company"
ON public.factures_achats FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete factures_achats in their company"
ON public.factures_achats FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: facture_achat_lignes
CREATE TABLE public.facture_achat_lignes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facture_achat_id UUID NOT NULL REFERENCES public.factures_achats(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES public.produits(id) ON DELETE RESTRICT,
    description TEXT,
    quantite DECIMAL(15, 3) NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(15, 2) NOT NULL,
    taux_tva DECIMAL(5, 2) DEFAULT 0,
    montant_ht DECIMAL(15, 2) NOT NULL,
    montant_tva DECIMAL(15, 2) NOT NULL,
    montant_ttc DECIMAL(15, 2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.facture_achat_lignes IS 'Lignes de détail des factures d''achat';

-- Enable RLS
ALTER TABLE public.facture_achat_lignes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_facture_achat_lignes_facture_id ON public.facture_achat_lignes(facture_achat_id);
CREATE INDEX idx_facture_achat_lignes_produit_id ON public.facture_achat_lignes(produit_id);

-- RLS Policies
CREATE POLICY "Users can manage facture_achat_lignes via facture"
ON public.facture_achat_lignes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.factures_achats
        WHERE id = facture_achat_lignes.facture_achat_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

-- ============================================
-- MODULE STOCKS
-- ============================================

-- Drop existing stock tables if they exist
DROP TABLE IF EXISTS public.stock_items CASCADE;
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.stock_alerts CASCADE;
DROP TABLE IF EXISTS public.mouvements_stock CASCADE;

CREATE TABLE public.mouvements_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produit_id UUID NOT NULL REFERENCES public.produits(id) ON DELETE RESTRICT,
    type public.mouvement_stock_type NOT NULL,
    quantite DECIMAL(15, 3) NOT NULL,
    date_mouvement DATE NOT NULL DEFAULT CURRENT_DATE,
    prix_unitaire DECIMAL(15, 2),
    valeur_totale DECIMAL(15, 2),
    reference_type VARCHAR(50),
    reference_id UUID,
    depot VARCHAR(100),
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.mouvements_stock IS 'Mouvements de stock - uniquement entrées et sorties';

-- Enable RLS
ALTER TABLE public.mouvements_stock ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_mouvements_stock_company_id ON public.mouvements_stock(company_id);
CREATE INDEX idx_mouvements_stock_produit_id ON public.mouvements_stock(produit_id);
CREATE INDEX idx_mouvements_stock_type ON public.mouvements_stock(type);
CREATE INDEX idx_mouvements_stock_date_mouvement ON public.mouvements_stock(date_mouvement);
CREATE INDEX idx_mouvements_stock_reference ON public.mouvements_stock(reference_type, reference_id);

-- RLS Policies
CREATE POLICY "Users can view mouvements_stock in their company"
ON public.mouvements_stock FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert mouvements_stock in their company"
ON public.mouvements_stock FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update mouvements_stock in their company"
ON public.mouvements_stock FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete mouvements_stock in their company"
ON public.mouvements_stock FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE COMPTABILITÉ
-- ============================================

-- Drop existing accounting tables if they exist
DROP TABLE IF EXISTS public.accounting_accounts CASCADE;
DROP TABLE IF EXISTS public.accounting_entries CASCADE;
DROP TABLE IF EXISTS public.accounting_entry_lines CASCADE;
DROP TABLE IF EXISTS public.ecritures_comptables CASCADE;
DROP TABLE IF EXISTS public.ecriture_lignes CASCADE;

CREATE TABLE public.ecritures_comptables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100),
    date_ecriture DATE NOT NULL,
    journal VARCHAR(50),
    libelle TEXT NOT NULL,
    piece_jointe TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    total_debit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15, 2) NOT NULL DEFAULT 0,
    validee BOOLEAN DEFAULT false,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT ecritures_comptables_numero_company_unique UNIQUE (numero, company_id)
);

COMMENT ON TABLE public.ecritures_comptables IS 'Écritures comptables - doit toujours être équilibrée (débit = crédit)';

-- Enable RLS
ALTER TABLE public.ecritures_comptables ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_ecritures_comptables_company_id ON public.ecritures_comptables(company_id);
CREATE INDEX idx_ecritures_comptables_numero ON public.ecritures_comptables(numero);
CREATE INDEX idx_ecritures_comptables_date_ecriture ON public.ecritures_comptables(date_ecriture);
CREATE INDEX idx_ecritures_comptables_journal ON public.ecritures_comptables(journal);
CREATE INDEX idx_ecritures_comptables_reference ON public.ecritures_comptables(reference_type, reference_id);

-- RLS Policies
CREATE POLICY "Users can view ecritures_comptables in their company"
ON public.ecritures_comptables FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert ecritures_comptables in their company"
ON public.ecritures_comptables FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update ecritures_comptables in their company"
ON public.ecritures_comptables FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete ecritures_comptables in their company"
ON public.ecritures_comptables FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: ecriture_lignes
CREATE TABLE public.ecriture_lignes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ecriture_id UUID NOT NULL REFERENCES public.ecritures_comptables(id) ON DELETE CASCADE,
    compte_comptable VARCHAR(20) NOT NULL,
    libelle TEXT,
    type public.ecriture_ligne_type NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.ecriture_lignes IS 'Lignes d''écriture comptable - débit ou crédit';

-- Enable RLS
ALTER TABLE public.ecriture_lignes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_ecriture_lignes_ecriture_id ON public.ecriture_lignes(ecriture_id);
CREATE INDEX idx_ecriture_lignes_compte_comptable ON public.ecriture_lignes(compte_comptable);
CREATE INDEX idx_ecriture_lignes_type ON public.ecriture_lignes(type);

-- RLS Policies
CREATE POLICY "Users can manage ecriture_lignes via ecriture"
ON public.ecriture_lignes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ecritures_comptables
        WHERE id = ecriture_lignes.ecriture_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

-- ============================================
-- MODULE TRÉSORERIE
-- ============================================

-- Drop existing treasury tables if they exist
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.comptes_tresorerie CASCADE;
DROP TABLE IF EXISTS public.mouvements_tresorerie CASCADE;

CREATE TABLE public.comptes_tresorerie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('banque', 'caisse')),
    numero_compte VARCHAR(100),
    banque VARCHAR(255),
    iban VARCHAR(34),
    solde_initial DECIMAL(15, 2) DEFAULT 0,
    solde_actuel DECIMAL(15, 2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT comptes_tresorerie_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.comptes_tresorerie IS 'Comptes de trésorerie (banque, caisse)';

-- Enable RLS
ALTER TABLE public.comptes_tresorerie ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_comptes_tresorerie_company_id ON public.comptes_tresorerie(company_id);
CREATE INDEX idx_comptes_tresorerie_code ON public.comptes_tresorerie(code);
CREATE INDEX idx_comptes_tresorerie_type ON public.comptes_tresorerie(type);

-- RLS Policies
CREATE POLICY "Users can view comptes_tresorerie in their company"
ON public.comptes_tresorerie FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert comptes_tresorerie in their company"
ON public.comptes_tresorerie FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update comptes_tresorerie in their company"
ON public.comptes_tresorerie FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete comptes_tresorerie in their company"
ON public.comptes_tresorerie FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: mouvements_tresorerie
CREATE TABLE public.mouvements_tresorerie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compte_tresorerie_id UUID NOT NULL REFERENCES public.comptes_tresorerie(id) ON DELETE RESTRICT,
    type public.mouvement_tresorerie_type NOT NULL,
    date_mouvement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant DECIMAL(15, 2) NOT NULL,
    libelle TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    moyen_paiement VARCHAR(50),
    numero_piece VARCHAR(100),
    beneficiaire VARCHAR(255),
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.mouvements_tresorerie IS 'Mouvements de trésorerie - génère écritures comptables';

-- Enable RLS
ALTER TABLE public.mouvements_tresorerie ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_mouvements_tresorerie_company_id ON public.mouvements_tresorerie(company_id);
CREATE INDEX idx_mouvements_tresorerie_compte_id ON public.mouvements_tresorerie(compte_tresorerie_id);
CREATE INDEX idx_mouvements_tresorerie_type ON public.mouvements_tresorerie(type);
CREATE INDEX idx_mouvements_tresorerie_date_mouvement ON public.mouvements_tresorerie(date_mouvement);
CREATE INDEX idx_mouvements_tresorerie_reference ON public.mouvements_tresorerie(reference_type, reference_id);

-- RLS Policies
CREATE POLICY "Users can view mouvements_tresorerie in their company"
ON public.mouvements_tresorerie FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert mouvements_tresorerie in their company"
ON public.mouvements_tresorerie FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update mouvements_tresorerie in their company"
ON public.mouvements_tresorerie FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete mouvements_tresorerie in their company"
ON public.mouvements_tresorerie FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE RH
-- ============================================

-- Drop existing HR tables if they exist
DROP TABLE IF EXISTS public.hr_employees CASCADE;
DROP TABLE IF EXISTS public.payrolls CASCADE;
DROP TABLE IF EXISTS public.employes CASCADE;
DROP TABLE IF EXISTS public.salaires CASCADE;

CREATE TABLE public.employes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    date_naissance DATE,
    date_embauche DATE NOT NULL,
    date_depart DATE,
    poste VARCHAR(255),
    departement VARCHAR(100),
    salaire_base DECIMAL(15, 2) NOT NULL,
    numero_cnss VARCHAR(100),
    numero_cin VARCHAR(50),
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT employes_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.employes IS 'Employés de l''entreprise';

-- Enable RLS
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_employes_company_id ON public.employes(company_id);
CREATE INDEX idx_employes_code ON public.employes(code);
CREATE INDEX idx_employes_actif ON public.employes(actif);

-- RLS Policies
CREATE POLICY "Users can view employes in their company"
ON public.employes FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert employes in their company"
ON public.employes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update employes in their company"
ON public.employes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete employes in their company"
ON public.employes FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: salaires
CREATE TABLE public.salaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100),
    employe_id UUID NOT NULL REFERENCES public.employes(id) ON DELETE RESTRICT,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    date_paiement DATE NOT NULL,
    salaire_brut DECIMAL(15, 2) NOT NULL,
    cotisations_salariales DECIMAL(15, 2) DEFAULT 0,
    cotisations_patronales DECIMAL(15, 2) DEFAULT 0,
    salaire_net DECIMAL(15, 2) NOT NULL,
    prime DECIMAL(15, 2) DEFAULT 0,
    retenues DECIMAL(15, 2) DEFAULT 0,
    net_a_payer DECIMAL(15, 2) NOT NULL,
    compte_tresorerie_id UUID REFERENCES public.comptes_tresorerie(id),
    paye BOOLEAN DEFAULT false,
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT salaires_numero_company_unique UNIQUE (numero, company_id)
);

COMMENT ON TABLE public.salaires IS 'Fiches de paie - génère mouvements de trésorerie et écritures comptables';

-- Enable RLS
ALTER TABLE public.salaires ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_salaires_company_id ON public.salaires(company_id);
CREATE INDEX idx_salaires_employe_id ON public.salaires(employe_id);
CREATE INDEX idx_salaires_numero ON public.salaires(numero);
CREATE INDEX idx_salaires_periode ON public.salaires(periode_debut, periode_fin);
CREATE INDEX idx_salaires_date_paiement ON public.salaires(date_paiement);

-- RLS Policies
CREATE POLICY "Users can view salaires in their company"
ON public.salaires FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert salaires in their company"
ON public.salaires FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update salaires in their company"
ON public.salaires FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete salaires in their company"
ON public.salaires FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- MODULE GESTION DE PARC
-- ============================================

-- Drop existing fleet/equipment tables if they exist
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.equipment_assignments CASCADE;
DROP TABLE IF EXISTS public.parc_actifs CASCADE;
DROP TABLE IF EXISTS public.parc_affectations CASCADE;

CREATE TABLE public.parc_actifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    nom VARCHAR(255) NOT NULL,
    type public.parc_actif_type NOT NULL,
    marque VARCHAR(100),
    modele VARCHAR(100),
    numero_serie VARCHAR(100),
    immatriculation VARCHAR(50),
    date_acquisition DATE,
    valeur_acquisition DECIMAL(15, 2),
    valeur_residuelle DECIMAL(15, 2) DEFAULT 0,
    duree_amortissement INTEGER,
    valeur_comptable DECIMAL(15, 2),
    etat VARCHAR(50),
    localisation VARCHAR(255),
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT parc_actifs_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.parc_actifs IS 'Actifs du parc - génère écritures comptables (immobilisation)';

-- Enable RLS
ALTER TABLE public.parc_actifs ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_parc_actifs_company_id ON public.parc_actifs(company_id);
CREATE INDEX idx_parc_actifs_code ON public.parc_actifs(code);
CREATE INDEX idx_parc_actifs_type ON public.parc_actifs(type);
CREATE INDEX idx_parc_actifs_actif ON public.parc_actifs(actif);

-- RLS Policies
CREATE POLICY "Users can view parc_actifs in their company"
ON public.parc_actifs FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert parc_actifs in their company"
ON public.parc_actifs FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update parc_actifs in their company"
ON public.parc_actifs FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete parc_actifs in their company"
ON public.parc_actifs FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Table: parc_affectations
CREATE TABLE public.parc_affectations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actif_id UUID NOT NULL REFERENCES public.parc_actifs(id) ON DELETE RESTRICT,
    employe_id UUID REFERENCES public.employes(id) ON DELETE SET NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut public.parc_affectation_statut DEFAULT 'active',
    notes TEXT,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.parc_affectations IS 'Affectations d''actifs aux employés';

-- Enable RLS
ALTER TABLE public.parc_affectations ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_parc_affectations_company_id ON public.parc_affectations(company_id);
CREATE INDEX idx_parc_affectations_actif_id ON public.parc_affectations(actif_id);
CREATE INDEX idx_parc_affectations_employe_id ON public.parc_affectations(employe_id);
CREATE INDEX idx_parc_affectations_statut ON public.parc_affectations(statut);

-- RLS Policies
CREATE POLICY "Users can view parc_affectations in their company"
ON public.parc_affectations FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert parc_affectations in their company"
ON public.parc_affectations FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update parc_affectations in their company"
ON public.parc_affectations FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete parc_affectations in their company"
ON public.parc_affectations FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================

-- La fonction update_updated_at_column existe déjà dans les migrations précédentes
-- On crée les triggers pour les nouvelles tables

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fournisseurs_updated_at
BEFORE UPDATE ON public.fournisseurs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produits_updated_at
BEFORE UPDATE ON public.produits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factures_ventes_updated_at
BEFORE UPDATE ON public.factures_ventes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_factures_achats_updated_at
BEFORE UPDATE ON public.factures_achats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comptes_tresorerie_updated_at
BEFORE UPDATE ON public.comptes_tresorerie
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecritures_comptables_updated_at
BEFORE UPDATE ON public.ecritures_comptables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employes_updated_at
BEFORE UPDATE ON public.employes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salaires_updated_at
BEFORE UPDATE ON public.salaires
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parc_actifs_updated_at
BEFORE UPDATE ON public.parc_actifs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parc_affectations_updated_at
BEFORE UPDATE ON public.parc_affectations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
