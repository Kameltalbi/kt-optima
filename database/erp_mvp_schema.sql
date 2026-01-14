-- ============================================
-- ERP MVP - SCHÉMA DE BASE DE DONNÉES COMPLET
-- PostgreSQL / Supabase
-- Version: MVP
-- ============================================

-- Extension UUID (déjà activée dans Supabase, mais on le met pour compatibilité)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Type de produit/service
CREATE TYPE produit_type AS ENUM ('produit', 'service');
CREATE TYPE mouvement_stock_type AS ENUM ('entree', 'sortie');
CREATE TYPE facture_statut AS ENUM ('brouillon', 'validee', 'annulee', 'payee');
CREATE TYPE mouvement_tresorerie_type AS ENUM ('entree', 'sortie');
CREATE TYPE ecriture_ligne_type AS ENUM ('debit', 'credit');
CREATE TYPE parc_actif_type AS ENUM ('vehicule', 'materiel', 'immobilier', 'autre');
CREATE TYPE parc_affectation_statut AS ENUM ('active', 'terminee');

-- ============================================
-- MODULE CRM - CLIENTS
-- ============================================

-- Table: clients
-- Description: Gère les clients et prospects du CRM
-- Relations: Utilisée par factures_ventes, mouvements_tresorerie
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code client unique (ex: CLI-001)
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'prospect' CHECK (type IN ('prospect', 'client')),
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    numero_fiscal VARCHAR(100), -- Matricule fiscal
    numero_registre_commerce VARCHAR(100),
    site_web VARCHAR(255),
    notes TEXT, -- Notes internes sur le client
    solde_initial DECIMAL(15, 2) DEFAULT 0, -- Solde à l'ouverture
    solde_actuel DECIMAL(15, 2) DEFAULT 0, -- Solde actuel (calculé)
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL, -- Référence à la société (Supabase)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clients IS 'Gère les clients et prospects du module CRM';
COMMENT ON COLUMN clients.type IS 'prospect = pas encore client, client = client actif';
COMMENT ON COLUMN clients.solde_actuel IS 'Solde calculé automatiquement (factures - paiements)';

-- Index pour clients
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_code ON clients(code);
CREATE INDEX idx_clients_nom ON clients(nom);

-- ============================================
-- MODULE FOURNISSEURS
-- ============================================

-- Table: fournisseurs
-- Description: Gère les fournisseurs de l'entreprise
-- Relations: Utilisée par factures_achats, mouvements_tresorerie
CREATE TABLE fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code fournisseur unique (ex: FRN-001)
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    numero_fiscal VARCHAR(100), -- Matricule fiscal
    numero_registre_commerce VARCHAR(100),
    site_web VARCHAR(255),
    notes TEXT, -- Notes internes sur le fournisseur
    solde_initial DECIMAL(15, 2) DEFAULT 0, -- Solde à l'ouverture
    solde_actuel DECIMAL(15, 2) DEFAULT 0, -- Solde actuel (calculé)
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE fournisseurs IS 'Gère les fournisseurs de l''entreprise';
COMMENT ON COLUMN fournisseurs.solde_actuel IS 'Solde calculé automatiquement (factures - paiements)';

-- Index pour fournisseurs
CREATE INDEX idx_fournisseurs_company_id ON fournisseurs(company_id);
CREATE INDEX idx_fournisseurs_code ON fournisseurs(code);
CREATE INDEX idx_fournisseurs_nom ON fournisseurs(nom);

-- ============================================
-- MODULE PRODUITS / SERVICES
-- ============================================

-- Table: produits
-- Description: Gère les produits et services (stockable ou non)
-- Relations: Utilisée par facture_vente_lignes, facture_achat_lignes, mouvements_stock
CREATE TABLE produits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code produit unique (ex: PRD-001)
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    type produit_type NOT NULL DEFAULT 'produit', -- produit ou service
    stockable BOOLEAN DEFAULT false, -- true = produit stockable, false = service ou produit non stockable
    unite VARCHAR(20) DEFAULT 'unite', -- Unité de mesure (unité, kg, m, L, etc.)
    prix_achat DECIMAL(15, 2) DEFAULT 0, -- Prix d'achat moyen
    prix_vente DECIMAL(15, 2) NOT NULL, -- Prix de vente
    taux_tva DECIMAL(5, 2) DEFAULT 0, -- Taux de TVA (ex: 19.00 pour 19%)
    categorie VARCHAR(100), -- Catégorie du produit
    stock_actuel DECIMAL(15, 3) DEFAULT 0, -- Stock actuel (calculé via mouvements)
    stock_minimum DECIMAL(15, 3) DEFAULT 0, -- Stock minimum pour alertes
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE produits IS 'Gère les produits et services de l''entreprise';
COMMENT ON COLUMN produits.type IS 'produit = bien physique, service = prestation';
COMMENT ON COLUMN produits.stockable IS 'Si true, le produit génère des mouvements de stock';
COMMENT ON COLUMN produits.stock_actuel IS 'Stock calculé automatiquement via mouvements_stock';

-- Index pour produits
CREATE INDEX idx_produits_company_id ON produits(company_id);
CREATE INDEX idx_produits_code ON produits(code);
CREATE INDEX idx_produits_type ON produits(type);
CREATE INDEX idx_produits_stockable ON produits(stockable);
CREATE INDEX idx_produits_categorie ON produits(categorie);

-- ============================================
-- MODULE VENTES
-- ============================================

-- Table: factures_ventes
-- Description: Factures de vente (devis transformés en factures)
-- Relations: Génère mouvements_stock (si produits stockables) et ecritures_comptables
CREATE TABLE factures_ventes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE NOT NULL, -- Numéro de facture unique (ex: FV-2024-001)
    date_facture DATE NOT NULL,
    date_echeance DATE, -- Date d'échéance pour le paiement
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    statut facture_statut DEFAULT 'brouillon',
    montant_ht DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant hors taxes
    montant_tva DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant TVA
    montant_ttc DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant toutes taxes comprises
    montant_paye DECIMAL(15, 2) DEFAULT 0, -- Montant déjà payé
    montant_restant DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Montant restant à payer
    conditions_paiement VARCHAR(100), -- Conditions de paiement (ex: "30 jours")
    notes TEXT, -- Notes sur la facture
    company_id UUID NOT NULL,
    created_by UUID, -- Utilisateur qui a créé la facture (auth.uid())
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE factures_ventes IS 'Factures de vente - génère mouvements de stock et écritures comptables';
COMMENT ON COLUMN factures_ventes.statut IS 'brouillon, validee, annulee, payee';
COMMENT ON COLUMN factures_ventes.montant_restant IS 'Calculé: montant_ttc - montant_paye';

-- Index pour factures_ventes
CREATE INDEX idx_factures_ventes_company_id ON factures_ventes(company_id);
CREATE INDEX idx_factures_ventes_client_id ON factures_ventes(client_id);
CREATE INDEX idx_factures_ventes_numero ON factures_ventes(numero);
CREATE INDEX idx_factures_ventes_date_facture ON factures_ventes(date_facture);
CREATE INDEX idx_factures_ventes_statut ON factures_ventes(statut);

-- Table: facture_vente_lignes
-- Description: Lignes de détail d'une facture de vente
-- Relations: Référence produits, calcule montants
CREATE TABLE facture_vente_lignes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facture_vente_id UUID NOT NULL REFERENCES factures_ventes(id) ON DELETE CASCADE,
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    description TEXT, -- Description libre (si produit non référencé)
    quantite DECIMAL(15, 3) NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(15, 2) NOT NULL, -- Prix unitaire HT
    taux_tva DECIMAL(5, 2) DEFAULT 0, -- Taux TVA pour cette ligne
    montant_ht DECIMAL(15, 2) NOT NULL, -- quantite * prix_unitaire
    montant_tva DECIMAL(15, 2) NOT NULL, -- montant_ht * taux_tva / 100
    montant_ttc DECIMAL(15, 2) NOT NULL, -- montant_ht + montant_tva
    ordre INTEGER DEFAULT 0, -- Ordre d'affichage des lignes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE facture_vente_lignes IS 'Lignes de détail des factures de vente';

-- Index pour facture_vente_lignes
CREATE INDEX idx_facture_vente_lignes_facture_id ON facture_vente_lignes(facture_vente_id);
CREATE INDEX idx_facture_vente_lignes_produit_id ON facture_vente_lignes(produit_id);

-- ============================================
-- MODULE ACHATS
-- ============================================

-- Table: factures_achats
-- Description: Factures d'achat (factures fournisseurs)
-- Relations: Génère mouvements_stock (si produits stockables) et ecritures_comptables
CREATE TABLE factures_achats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE NOT NULL, -- Numéro de facture fournisseur
    numero_interne VARCHAR(100), -- Numéro interne (ex: FA-2024-001)
    date_facture DATE NOT NULL,
    date_echeance DATE, -- Date d'échéance pour le paiement
    fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    statut facture_statut DEFAULT 'brouillon',
    montant_ht DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_tva DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(15, 2) NOT NULL DEFAULT 0,
    montant_paye DECIMAL(15, 2) DEFAULT 0,
    montant_restant DECIMAL(15, 2) NOT NULL DEFAULT 0,
    conditions_paiement VARCHAR(100),
    notes TEXT,
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE factures_achats IS 'Factures d''achat - génère mouvements de stock et écritures comptables';
COMMENT ON COLUMN factures_achats.numero IS 'Numéro de la facture fournisseur (unique)';
COMMENT ON COLUMN factures_achats.numero_interne IS 'Numéro interne de suivi';

-- Index pour factures_achats
CREATE INDEX idx_factures_achats_company_id ON factures_achats(company_id);
CREATE INDEX idx_factures_achats_fournisseur_id ON factures_achats(fournisseur_id);
CREATE INDEX idx_factures_achats_numero ON factures_achats(numero);
CREATE INDEX idx_factures_achats_date_facture ON factures_achats(date_facture);
CREATE INDEX idx_factures_achats_statut ON factures_achats(statut);

-- Table: facture_achat_lignes
-- Description: Lignes de détail d'une facture d'achat
-- Relations: Référence produits, calcule montants
CREATE TABLE facture_achat_lignes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facture_achat_id UUID NOT NULL REFERENCES factures_achats(id) ON DELETE CASCADE,
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    description TEXT,
    quantite DECIMAL(15, 3) NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(15, 2) NOT NULL, -- Prix unitaire HT
    taux_tva DECIMAL(5, 2) DEFAULT 0,
    montant_ht DECIMAL(15, 2) NOT NULL,
    montant_tva DECIMAL(15, 2) NOT NULL,
    montant_ttc DECIMAL(15, 2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE facture_achat_lignes IS 'Lignes de détail des factures d''achat';

-- Index pour facture_achat_lignes
CREATE INDEX idx_facture_achat_lignes_facture_id ON facture_achat_lignes(facture_achat_id);
CREATE INDEX idx_facture_achat_lignes_produit_id ON facture_achat_lignes(produit_id);

-- ============================================
-- MODULE STOCKS
-- ============================================

-- Table: mouvements_stock
-- Description: Mouvements de stock (entrées/sorties uniquement)
-- Relations: Généré par factures_ventes et factures_achats, référence produits
CREATE TABLE mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    type mouvement_stock_type NOT NULL, -- entree ou sortie
    quantite DECIMAL(15, 3) NOT NULL, -- Quantité positive (entrée ou sortie)
    date_mouvement DATE NOT NULL DEFAULT CURRENT_DATE,
    prix_unitaire DECIMAL(15, 2), -- Prix unitaire du mouvement (pour valorisation)
    valeur_totale DECIMAL(15, 2), -- quantite * prix_unitaire
    reference_type VARCHAR(50), -- Type de référence (ex: 'facture_vente', 'facture_achat', 'ajustement')
    reference_id UUID, -- ID de la référence (facture, etc.)
    depot VARCHAR(100), -- Nom du dépôt/entrepôt (simple pour MVP)
    notes TEXT,
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE mouvements_stock IS 'Mouvements de stock - uniquement entrées et sorties';
COMMENT ON COLUMN mouvements_stock.type IS 'entree = augmentation stock, sortie = diminution stock';
COMMENT ON COLUMN mouvements_stock.reference_type IS 'Type de document source (facture_vente, facture_achat, ajustement, etc.)';
COMMENT ON COLUMN mouvements_stock.reference_id IS 'ID du document source';

-- Index pour mouvements_stock
CREATE INDEX idx_mouvements_stock_company_id ON mouvements_stock(company_id);
CREATE INDEX idx_mouvements_stock_produit_id ON mouvements_stock(produit_id);
CREATE INDEX idx_mouvements_stock_type ON mouvements_stock(type);
CREATE INDEX idx_mouvements_stock_date_mouvement ON mouvements_stock(date_mouvement);
CREATE INDEX idx_mouvements_stock_reference ON mouvements_stock(reference_type, reference_id);

-- ============================================
-- MODULE COMPTABILITÉ
-- ============================================

-- Table: ecritures_comptables
-- Description: Écritures comptables (journal)
-- Relations: Contient ecriture_lignes, généré par factures, paiements, salaires, etc.
CREATE TABLE ecritures_comptables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE, -- Numéro d'écriture (ex: EC-2024-001)
    date_ecriture DATE NOT NULL,
    journal VARCHAR(50), -- Journal comptable (ex: 'Ventes', 'Achats', 'Banque', 'OD')
    libelle TEXT NOT NULL, -- Libellé de l'écriture
    piece_jointe TEXT, -- Référence pièce jointe
    reference_type VARCHAR(50), -- Type de référence (ex: 'facture_vente', 'facture_achat', 'paiement', 'salaire')
    reference_id UUID, -- ID de la référence
    total_debit DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Total débit (vérification équilibre)
    total_credit DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Total crédit (vérification équilibre)
    validee BOOLEAN DEFAULT false, -- Écriture validée (équilibrée)
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ecritures_comptables IS 'Écritures comptables - doit toujours être équilibrée (débit = crédit)';
COMMENT ON COLUMN ecritures_comptables.validee IS 'true si total_debit = total_credit';
COMMENT ON COLUMN ecritures_comptables.reference_type IS 'Type de document source (facture_vente, facture_achat, paiement, salaire, etc.)';

-- Index pour ecritures_comptables
CREATE INDEX idx_ecritures_comptables_company_id ON ecritures_comptables(company_id);
CREATE INDEX idx_ecritures_comptables_numero ON ecritures_comptables(numero);
CREATE INDEX idx_ecritures_comptables_date_ecriture ON ecritures_comptables(date_ecriture);
CREATE INDEX idx_ecritures_comptables_journal ON ecritures_comptables(journal);
CREATE INDEX idx_ecritures_comptables_reference ON ecritures_comptables(reference_type, reference_id);

-- Table: ecriture_lignes
-- Description: Lignes d'écriture comptable (débit/crédit)
-- Relations: Référence compte comptable (à créer dans plan_comptable si nécessaire)
CREATE TABLE ecriture_lignes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ecriture_id UUID NOT NULL REFERENCES ecritures_comptables(id) ON DELETE CASCADE,
    compte_comptable VARCHAR(20) NOT NULL, -- Numéro de compte (ex: '411000', '701000', '512000')
    libelle TEXT, -- Libellé de la ligne
    type ecriture_ligne_type NOT NULL, -- debit ou credit
    montant DECIMAL(15, 2) NOT NULL, -- Montant toujours positif
    ordre INTEGER DEFAULT 0, -- Ordre d'affichage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ecriture_lignes IS 'Lignes d''écriture comptable - débit ou crédit';
COMMENT ON COLUMN ecriture_lignes.compte_comptable IS 'Numéro de compte du plan comptable';
COMMENT ON COLUMN ecriture_lignes.montant IS 'Montant toujours positif, le type (débit/crédit) indique le sens';

-- Index pour ecriture_lignes
CREATE INDEX idx_ecriture_lignes_ecriture_id ON ecriture_lignes(ecriture_id);
CREATE INDEX idx_ecriture_lignes_compte_comptable ON ecriture_lignes(compte_comptable);
CREATE INDEX idx_ecriture_lignes_type ON ecriture_lignes(type);

-- ============================================
-- MODULE TRÉSORERIE
-- ============================================

-- Table: comptes_tresorerie
-- Description: Comptes de trésorerie (banque, caisse)
-- Relations: Utilisé par mouvements_tresorerie
CREATE TABLE comptes_tresorerie (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code compte (ex: BANQ-001, CAISSE-001)
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('banque', 'caisse')), -- banque ou caisse
    numero_compte VARCHAR(100), -- Numéro de compte bancaire
    banque VARCHAR(255), -- Nom de la banque
    iban VARCHAR(34), -- IBAN
    solde_initial DECIMAL(15, 2) DEFAULT 0, -- Solde à l'ouverture
    solde_actuel DECIMAL(15, 2) DEFAULT 0, -- Solde actuel (calculé via mouvements)
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comptes_tresorerie IS 'Comptes de trésorerie (banque, caisse)';
COMMENT ON COLUMN comptes_tresorerie.solde_actuel IS 'Solde calculé automatiquement via mouvements_tresorerie';

-- Index pour comptes_tresorerie
CREATE INDEX idx_comptes_tresorerie_company_id ON comptes_tresorerie(company_id);
CREATE INDEX idx_comptes_tresorerie_code ON comptes_tresorerie(code);
CREATE INDEX idx_comptes_tresorerie_type ON comptes_tresorerie(type);

-- Table: mouvements_tresorerie
-- Description: Mouvements de trésorerie (entrées/sorties)
-- Relations: Généré par paiements, salaires, etc. Génère ecritures_comptables
CREATE TABLE mouvements_tresorerie (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compte_tresorerie_id UUID NOT NULL REFERENCES comptes_tresorerie(id) ON DELETE RESTRICT,
    type mouvement_tresorerie_type NOT NULL, -- entree ou sortie
    date_mouvement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant DECIMAL(15, 2) NOT NULL, -- Montant toujours positif
    libelle TEXT NOT NULL, -- Libellé du mouvement
    reference_type VARCHAR(50), -- Type de référence (ex: 'paiement_client', 'paiement_fournisseur', 'salaire', 'virement')
    reference_id UUID, -- ID de la référence
    moyen_paiement VARCHAR(50), -- Moyen de paiement (ex: 'cheque', 'virement', 'especes', 'carte')
    numero_piece VARCHAR(100), -- Numéro de chèque, virement, etc.
    beneficiaire VARCHAR(255), -- Bénéficiaire (pour sorties)
    notes TEXT,
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE mouvements_tresorerie IS 'Mouvements de trésorerie - génère écritures comptables';
COMMENT ON COLUMN mouvements_tresorerie.type IS 'entree = augmentation trésorerie, sortie = diminution trésorerie';
COMMENT ON COLUMN mouvements_tresorerie.reference_type IS 'Type de document source (paiement_client, paiement_fournisseur, salaire, etc.)';

-- Index pour mouvements_tresorerie
CREATE INDEX idx_mouvements_tresorerie_company_id ON mouvements_tresorerie(company_id);
CREATE INDEX idx_mouvements_tresorerie_compte_id ON mouvements_tresorerie(compte_tresorerie_id);
CREATE INDEX idx_mouvements_tresorerie_type ON mouvements_tresorerie(type);
CREATE INDEX idx_mouvements_tresorerie_date_mouvement ON mouvements_tresorerie(date_mouvement);
CREATE INDEX idx_mouvements_tresorerie_reference ON mouvements_tresorerie(reference_type, reference_id);

-- ============================================
-- MODULE RH
-- ============================================

-- Table: employes
-- Description: Employés de l'entreprise
-- Relations: Utilisé par salaires, parc_affectations
CREATE TABLE employes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code employé (ex: EMP-001)
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    date_naissance DATE,
    date_embauche DATE NOT NULL,
    date_depart DATE, -- Date de départ (si null, toujours actif)
    poste VARCHAR(255), -- Poste occupé
    departement VARCHAR(100), -- Département
    salaire_base DECIMAL(15, 2) NOT NULL, -- Salaire de base
    numero_cnss VARCHAR(100), -- Numéro CNSS
    numero_cin VARCHAR(50), -- Numéro CIN
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE employes IS 'Employés de l''entreprise';
COMMENT ON COLUMN employes.date_depart IS 'Si null, l''employé est toujours actif';

-- Index pour employes
CREATE INDEX idx_employes_company_id ON employes(company_id);
CREATE INDEX idx_employes_code ON employes(code);
CREATE INDEX idx_employes_actif ON employes(actif);

-- Table: salaires
-- Description: Fiches de paie / salaires
-- Relations: Génère mouvements_tresorerie et ecritures_comptables
CREATE TABLE salaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE, -- Numéro de fiche de paie (ex: SAL-2024-001)
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE RESTRICT,
    periode_debut DATE NOT NULL, -- Début de période (ex: 01/01/2024)
    periode_fin DATE NOT NULL, -- Fin de période (ex: 31/01/2024)
    date_paiement DATE NOT NULL, -- Date de paiement
    salaire_brut DECIMAL(15, 2) NOT NULL, -- Salaire brut
    cotisations_salariales DECIMAL(15, 2) DEFAULT 0, -- Cotisations salariales
    cotisations_patronales DECIMAL(15, 2) DEFAULT 0, -- Cotisations patronales
    salaire_net DECIMAL(15, 2) NOT NULL, -- Salaire net (brut - cotisations salariales)
    prime DECIMAL(15, 2) DEFAULT 0, -- Primes diverses
    retenues DECIMAL(15, 2) DEFAULT 0, -- Retenues diverses
    net_a_payer DECIMAL(15, 2) NOT NULL, -- Net à payer (salaire_net + prime - retenues)
    compte_tresorerie_id UUID REFERENCES comptes_tresorerie(id), -- Compte utilisé pour le paiement
    paye BOOLEAN DEFAULT false, -- Si le salaire a été payé
    notes TEXT,
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE salaires IS 'Fiches de paie - génère mouvements de trésorerie et écritures comptables';
COMMENT ON COLUMN salaires.net_a_payer IS 'Montant effectivement versé à l''employé';

-- Index pour salaires
CREATE INDEX idx_salaires_company_id ON salaires(company_id);
CREATE INDEX idx_salaires_employe_id ON salaires(employe_id);
CREATE INDEX idx_salaires_numero ON salaires(numero);
CREATE INDEX idx_salaires_periode ON salaires(periode_debut, periode_fin);
CREATE INDEX idx_salaires_date_paiement ON salaires(date_paiement);

-- ============================================
-- MODULE GESTION DE PARC
-- ============================================

-- Table: parc_actifs
-- Description: Actifs du parc (véhicules, matériel, immobilier)
-- Relations: Utilisé par parc_affectations, génère ecritures_comptables (immobilisation)
CREATE TABLE parc_actifs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE, -- Code actif (ex: VEH-001, MAT-001)
    nom VARCHAR(255) NOT NULL,
    type parc_actif_type NOT NULL, -- vehicule, materiel, immobilier, autre
    marque VARCHAR(100), -- Marque (pour véhicules/matériel)
    modele VARCHAR(100), -- Modèle
    numero_serie VARCHAR(100), -- Numéro de série
    immatriculation VARCHAR(50), -- Immatriculation (pour véhicules)
    date_acquisition DATE, -- Date d'acquisition
    valeur_acquisition DECIMAL(15, 2), -- Valeur d'acquisition
    valeur_residuelle DECIMAL(15, 2) DEFAULT 0, -- Valeur résiduelle (pour amortissement)
    duree_amortissement INTEGER, -- Durée d'amortissement en mois
    valeur_comptable DECIMAL(15, 2), -- Valeur comptable actuelle (valeur_acquisition - amortissements)
    etat VARCHAR(50), -- État (ex: 'neuf', 'bon', 'moyen', 'mauvais')
    localisation VARCHAR(255), -- Localisation actuelle
    notes TEXT,
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE parc_actifs IS 'Actifs du parc - génère écritures comptables (immobilisation)';
COMMENT ON COLUMN parc_actifs.valeur_comptable IS 'Valeur comptable actuelle (calculée via amortissements)';

-- Index pour parc_actifs
CREATE INDEX idx_parc_actifs_company_id ON parc_actifs(company_id);
CREATE INDEX idx_parc_actifs_code ON parc_actifs(code);
CREATE INDEX idx_parc_actifs_type ON parc_actifs(type);
CREATE INDEX idx_parc_actifs_actif ON parc_actifs(actif);

-- Table: parc_affectations
-- Description: Affectations d'actifs aux employés
-- Relations: Lie parc_actifs et employes
CREATE TABLE parc_affectations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actif_id UUID NOT NULL REFERENCES parc_actifs(id) ON DELETE RESTRICT,
    employe_id UUID REFERENCES employes(id) ON DELETE SET NULL, -- NULL si non affecté
    date_debut DATE NOT NULL, -- Date de début d'affectation
    date_fin DATE, -- Date de fin d'affectation (NULL si toujours affecté)
    statut parc_affectation_statut DEFAULT 'active', -- active ou terminee
    notes TEXT,
    company_id UUID NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE parc_affectations IS 'Affectations d''actifs aux employés';
COMMENT ON COLUMN parc_affectations.employe_id IS 'NULL si l''actif n''est pas affecté';
COMMENT ON COLUMN parc_affectations.date_fin IS 'NULL si l''affectation est toujours active';

-- Index pour parc_affectations
CREATE INDEX idx_parc_affectations_company_id ON parc_affectations(company_id);
CREATE INDEX idx_parc_affectations_actif_id ON parc_affectations(actif_id);
CREATE INDEX idx_parc_affectations_employe_id ON parc_affectations(employe_id);
CREATE INDEX idx_parc_affectations_statut ON parc_affectations(statut);

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers sur toutes les tables avec updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factures_ventes_updated_at BEFORE UPDATE ON factures_ventes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factures_achats_updated_at BEFORE UPDATE ON factures_achats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comptes_tresorerie_updated_at BEFORE UPDATE ON comptes_tresorerie
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecritures_comptables_updated_at BEFORE UPDATE ON ecritures_comptables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employes_updated_at BEFORE UPDATE ON employes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salaires_updated_at BEFORE UPDATE ON salaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parc_actifs_updated_at BEFORE UPDATE ON parc_actifs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parc_affectations_updated_at BEFORE UPDATE ON parc_affectations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. RELATIONS MÉTIER IMPORTANTES :
--    - Une facture_vente validee génère :
--      * Des mouvements_stock (si produits stockables)
--      * Une ecriture_comptable avec ecriture_lignes
--
--    - Une facture_achat validee génère :
--      * Des mouvements_stock (si produits stockables)
--      * Une ecriture_comptable avec ecriture_lignes
--
--    - Un paiement (mouvement_tresorerie) génère :
--      * Une ecriture_comptable avec ecriture_lignes
--
--    - Un salaire paye génère :
--      * Un mouvement_tresorerie (sortie)
--      * Une ecriture_comptable avec ecriture_lignes
--
--    - Un actif acquis génère :
--      * Une ecriture_comptable (immobilisation)

-- 2. CALCULS AUTOMATIQUES (à faire côté application) :
--    - stock_actuel dans produits = SUM(mouvements_stock) WHERE type='entree' - SUM(mouvements_stock) WHERE type='sortie'
--    - solde_actuel dans clients = SUM(factures_ventes.montant_restant) WHERE statut='validee'
--    - solde_actuel dans fournisseurs = SUM(factures_achats.montant_restant) WHERE statut='validee'
--    - solde_actuel dans comptes_tresorerie = solde_initial + SUM(mouvements WHERE type='entree') - SUM(mouvements WHERE type='sortie')
--    - total_debit et total_credit dans ecritures_comptables = SUM(ecriture_lignes) GROUP BY type

-- 3. CONTRAINTES MÉTIER (à vérifier côté application) :
--    - Une ecriture_comptable doit toujours être équilibrée (total_debit = total_credit)
--    - Les montants dans facture_vente_lignes et facture_achat_lignes doivent être cohérents
--    - Les mouvements_stock ne doivent être créés que pour des produits stockable=true

-- 4. COMPATIBILITÉ SUPABASE :
--    - Toutes les tables ont company_id pour le multi-tenant (RLS)
--    - created_by peut utiliser auth.uid() pour l'utilisateur connecté
--    - Les UUID sont compatibles avec Supabase Auth

-- 5. ÉVOLUTIVITÉ :
--    - Le schéma est prêt pour l'ajout de multi-société (company_id déjà présent)
--    - Les références génériques (reference_type, reference_id) permettent d'étendre facilement
--    - Les enums peuvent être étendus si nécessaire
