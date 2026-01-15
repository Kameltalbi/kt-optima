-- ============================================
-- PRÉCHARGEMENT PLAN COMPTABLE TUNISIEN (PCG)
-- ============================================
-- Migration: Insertion du plan comptable standard tunisien
-- Date: 2026-01-20
-- ============================================

-- ============================================
-- FUNCTION: Précharger le plan comptable pour une entreprise
-- ============================================

CREATE OR REPLACE FUNCTION public.preload_plan_comptable_tunisien(
    p_company_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Classe 1: Financement Permanent
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '10', 'Capital', 'passif', TRUE),
    (p_company_id, '11', 'Réserves', 'passif', TRUE),
    (p_company_id, '12', 'Report à nouveau', 'passif', TRUE),
    (p_company_id, '13', 'Résultat net', 'passif', TRUE),
    (p_company_id, '14', 'Subventions d''investissement', 'passif', TRUE),
    (p_company_id, '15', 'Provisions pour risques et charges', 'passif', TRUE),
    (p_company_id, '16', 'Emprunts et dettes assimilées', 'passif', TRUE),
    (p_company_id, '17', 'Dettes rattachées à des participations', 'passif', TRUE),
    (p_company_id, '18', 'Comptes de liaison des établissements et succursales', 'passif', TRUE),
    (p_company_id, '19', 'Provisions pour dépréciation des comptes de financement permanent', 'passif', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 2: Actif Immobilisé
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '20', 'Immobilisations incorporelles', 'actif', TRUE),
    (p_company_id, '21', 'Immobilisations corporelles', 'actif', TRUE),
    (p_company_id, '23', 'Immobilisations en cours', 'actif', TRUE),
    (p_company_id, '24', 'Immobilisations financières', 'actif', TRUE),
    (p_company_id, '25', 'Amortissements des immobilisations', 'actif', TRUE),
    (p_company_id, '26', 'Provisions pour dépréciation des immobilisations', 'actif', TRUE),
    (p_company_id, '27', 'Charges à répartir sur plusieurs exercices', 'actif', TRUE),
    (p_company_id, '28', 'Amortissements des charges à répartir', 'actif', TRUE),
    (p_company_id, '29', 'Provisions pour dépréciation des charges à répartir', 'actif', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 3: Stocks
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '31', 'Matières premières', 'actif', TRUE),
    (p_company_id, '32', 'Autres approvisionnements', 'actif', TRUE),
    (p_company_id, '33', 'Produits en cours', 'actif', TRUE),
    (p_company_id, '34', 'Produits intermédiaires', 'actif', TRUE),
    (p_company_id, '35', 'Produits finis', 'actif', TRUE),
    (p_company_id, '37', 'Stocks de marchandises', 'actif', TRUE),
    (p_company_id, '38', 'Stocks en cours de route', 'actif', TRUE),
    (p_company_id, '39', 'Provisions pour dépréciation des stocks', 'actif', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 4: Tiers
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '40', 'Fournisseurs', 'passif', TRUE),
    (p_company_id, '41', 'Clients', 'actif', TRUE),
    (p_company_id, '42', 'Personnel', 'passif', TRUE),
    (p_company_id, '43', 'Sécurité sociale et autres organismes sociaux', 'passif', TRUE),
    (p_company_id, '44', 'État et autres collectivités publiques', 'passif', TRUE),
    (p_company_id, '45', 'Groupe et associés', 'actif', TRUE),
    (p_company_id, '46', 'Débiteurs et créditeurs divers', 'actif', TRUE),
    (p_company_id, '47', 'Comptes d''attente', 'actif', TRUE),
    (p_company_id, '48', 'Comptes de régularisation', 'actif', TRUE),
    (p_company_id, '49', 'Provisions pour dépréciation des comptes de tiers', 'actif', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 5: Trésorerie
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '51', 'Banques', 'tresorerie', TRUE),
    (p_company_id, '52', 'Institutions financières', 'tresorerie', TRUE),
    (p_company_id, '53', 'Caisse', 'tresorerie', TRUE),
    (p_company_id, '54', 'Régies d''avances et accréditifs', 'tresorerie', TRUE),
    (p_company_id, '55', 'Valeurs mobilières de placement', 'tresorerie', TRUE),
    (p_company_id, '56', 'Banques, crédits de trésorerie et soldes créditeurs de banques', 'tresorerie', TRUE),
    (p_company_id, '57', 'Valeurs à l''encaissement', 'tresorerie', TRUE),
    (p_company_id, '58', 'Virements internes', 'tresorerie', TRUE),
    (p_company_id, '59', 'Provisions pour dépréciation des comptes de trésorerie', 'tresorerie', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 6: Charges
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '60', 'Achats', 'charge', TRUE),
    (p_company_id, '61', 'Services extérieurs', 'charge', TRUE),
    (p_company_id, '62', 'Autres services extérieurs', 'charge', TRUE),
    (p_company_id, '63', 'Impôts, taxes et assimilés', 'charge', TRUE),
    (p_company_id, '64', 'Charges de personnel', 'charge', TRUE),
    (p_company_id, '641', 'Salaires', 'charge', TRUE),
    (p_company_id, '645', 'Charges sociales', 'charge', TRUE),
    (p_company_id, '65', 'Autres charges de gestion courante', 'charge', TRUE),
    (p_company_id, '66', 'Charges financières', 'charge', TRUE),
    (p_company_id, '67', 'Charges exceptionnelles', 'charge', TRUE),
    (p_company_id, '68', 'Dotations aux amortissements et provisions', 'charge', TRUE),
    (p_company_id, '69', 'Participation des salariés aux résultats', 'charge', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 7: Produits
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '70', 'Ventes', 'produit', TRUE),
    (p_company_id, '71', 'Production stockée', 'produit', TRUE),
    (p_company_id, '72', 'Production immobilisée', 'produit', TRUE),
    (p_company_id, '73', 'Variations de stocks', 'produit', TRUE),
    (p_company_id, '74', 'Subventions d''exploitation', 'produit', TRUE),
    (p_company_id, '75', 'Autres produits de gestion courante', 'produit', TRUE),
    (p_company_id, '76', 'Produits financiers', 'produit', TRUE),
    (p_company_id, '77', 'Produits exceptionnels', 'produit', TRUE),
    (p_company_id, '78', 'Reprises sur amortissements et provisions', 'produit', TRUE),
    (p_company_id, '79', 'Transferts de charges', 'produit', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Classe 8: Comptes de résultat
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '80', 'Compte de résultat', 'produit', TRUE),
    (p_company_id, '81', 'Compte de résultat par nature', 'produit', TRUE),
    (p_company_id, '82', 'Compte de résultat par destination', 'produit', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Comptes spécifiques pour TVA
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '445', 'TVA collectée', 'passif', TRUE),
    (p_company_id, '4451', 'TVA due', 'passif', TRUE),
    (p_company_id, '4455', 'TVA à décaisser', 'passif', TRUE),
    (p_company_id, '4456', 'TVA déductible', 'actif', TRUE),
    (p_company_id, '4457', 'TVA à récupérer', 'actif', TRUE),
    (p_company_id, '431', 'Organismes sociaux', 'passif', TRUE),
    (p_company_id, '442', 'État - Impôts sur les bénéfices', 'passif', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;

    -- Comptes de trésorerie spécifiques
    INSERT INTO public.comptes_comptables (company_id, code_compte, libelle, type, is_system) VALUES
    (p_company_id, '512', 'Banques', 'tresorerie', TRUE),
    (p_company_id, '531', 'Caisse', 'tresorerie', TRUE)
    ON CONFLICT (company_id, code_compte) DO NOTHING;
END;
$$;

-- ============================================
-- FUNCTION: Précharger les journaux comptables par défaut
-- ============================================

CREATE OR REPLACE FUNCTION public.preload_journaux_comptables(
    p_company_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.journaux (company_id, code_journal, libelle) VALUES
    (p_company_id, 'VE', 'Journal des Ventes'),
    (p_company_id, 'AC', 'Journal des Achats'),
    (p_company_id, 'OD', 'Journal des Opérations Diverses'),
    (p_company_id, 'BN', 'Journal de Banque'),
    (p_company_id, 'CA', 'Journal de Caisse'),
    (p_company_id, 'PA', 'Journal de Paie')
    ON CONFLICT (company_id, code_journal) DO NOTHING;
END;
$$;
