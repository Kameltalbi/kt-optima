-- ============================================
-- DONNÉES DE TEST FINANCE POUR ABC ARCHIBAT
-- Script à exécuter directement dans Supabase SQL Editor
-- ============================================

-- Trouver le compte ABC Archibat (insensible à la casse)
DO $$
DECLARE
    v_company_id UUID;
    v_user_id UUID;
    v_account_bank_id UUID;
    v_account_cash_id UUID;
    v_account_savings_id UUID;
BEGIN
    -- Trouver le compte ABC Archibat (insensible à la casse)
    SELECT id INTO v_company_id
    FROM public.companies
    WHERE LOWER(name) LIKE '%archibat%' OR LOWER(name) LIKE '%abc%'
    LIMIT 1;

    -- Vérifier si le compte existe
    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Compte ABC Archibat non trouvé. Veuillez créer le compte d''abord.';
    END IF;

    RAISE NOTICE 'Compte trouvé: % (ID: %)', (SELECT name FROM public.companies WHERE id = v_company_id), v_company_id;

    -- Trouver un utilisateur pour cette company (pour created_by)
    SELECT user_id INTO v_user_id
    FROM public.profiles
    WHERE company_id = v_company_id
    LIMIT 1;

    -- ============================================
    -- CRÉER DES COMPTES (si n'existent pas)
    -- ============================================

    -- Compte bancaire principal
    INSERT INTO public.accounts (
        name,
        type,
        balance,
        account_number,
        bank_name,
        iban,
        bic,
        active,
        company_id
    ) VALUES (
        'Compte principal',
        'bank',
        185320.00,
        '1234567890123456',
        'Banque Populaire',
        'TN59 12 345 678 9012345678901',
        'BPMAMAMC',
        true,
        v_company_id
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_account_bank_id;

    -- Si le compte existe déjà, le récupérer
    IF v_account_bank_id IS NULL THEN
        SELECT id INTO v_account_bank_id
        FROM public.accounts
        WHERE company_id = v_company_id AND name = 'Compte principal'
        LIMIT 1;
    END IF;

    -- Caisse
    INSERT INTO public.accounts (
        name,
        type,
        balance,
        active,
        company_id
    ) VALUES (
        'Caisse',
        'cash',
        12500.00,
        true,
        v_company_id
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_account_cash_id;

    IF v_account_cash_id IS NULL THEN
        SELECT id INTO v_account_cash_id
        FROM public.accounts
        WHERE company_id = v_company_id AND name = 'Caisse'
        LIMIT 1;
    END IF;

    -- Compte épargne
    INSERT INTO public.accounts (
        name,
        type,
        balance,
        account_number,
        bank_name,
        iban,
        active,
        company_id
    ) VALUES (
        'Épargne',
        'savings',
        75000.00,
        '9876543210987654',
        'Attijariwafa Bank',
        'TN59 98 765 432 1098765432109',
        true,
        v_company_id
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_account_savings_id;

    IF v_account_savings_id IS NULL THEN
        SELECT id INTO v_account_savings_id
        FROM public.accounts
        WHERE company_id = v_company_id AND name = 'Épargne'
        LIMIT 1;
    END IF;

    -- ============================================
    -- CRÉER DES TRANSACTIONS (MOUVEMENTS)
    -- ============================================

    -- Transactions d'entrée (revenus)
    INSERT INTO public.transactions (
        account_id,
        type,
        amount,
        category,
        date,
        description,
        reference_type,
        company_id
    ) VALUES
    -- Janvier 2024
    (v_account_bank_id, 'income', 8500.00, 'Ventes', '2024-01-15', 'Facture client FAC-2024-001', 'facture', v_company_id),
    (v_account_bank_id, 'income', 22300.00, 'Ventes', '2024-01-25', 'Facture client FAC-2024-002', 'facture', v_company_id),
    -- Février 2024
    (v_account_bank_id, 'income', 5200.00, 'Ventes', '2024-02-05', 'Facture client FAC-2024-003', 'facture', v_company_id),
    (v_account_cash_id, 'income', 1500.00, 'Ventes', '2024-02-10', 'Paiement espèces client', 'facture', v_company_id),
    (v_account_bank_id, 'income', 12800.00, 'Ventes', '2024-02-15', 'Facture client FAC-2024-004', 'facture', v_company_id),
    -- Mars 2024
    (v_account_bank_id, 'income', 18900.00, 'Ventes', '2024-03-08', 'Facture client FAC-2024-005', 'facture', v_company_id),
    (v_account_bank_id, 'income', 11200.00, 'Ventes', '2024-03-20', 'Facture client FAC-2024-006', 'facture', v_company_id),
    -- Transactions de sortie (dépenses)
    -- Janvier 2024
    (v_account_bank_id, 'expense', 15000.00, 'Achats', '2024-01-22', 'Facture fournisseur FAC-FOUR-2024-001', 'facture_fournisseur', v_company_id),
    (v_account_bank_id, 'expense', 9600.00, 'Achats', '2024-01-28', 'Facture fournisseur FAC-FOUR-2024-002', 'facture_fournisseur', v_company_id),
    -- Février 2024
    (v_account_bank_id, 'expense', 8000.00, 'Paie', '2024-02-05', 'Salaires février', 'paie', v_company_id),
    (v_account_bank_id, 'expense', 10800.00, 'Achats', '2024-02-15', 'Facture fournisseur FAC-FOUR-2024-003', 'facture_fournisseur', v_company_id),
    (v_account_cash_id, 'expense', 500.00, 'Divers', '2024-02-18', 'Frais de bureau', 'autre', v_company_id),
    -- Mars 2024
    (v_account_bank_id, 'expense', 8000.00, 'Paie', '2024-03-05', 'Salaires mars', 'paie', v_company_id),
    (v_account_bank_id, 'expense', 12500.00, 'Achats', '2024-03-12', 'Facture fournisseur FAC-FOUR-2024-004', 'facture_fournisseur', v_company_id),
    (v_account_bank_id, 'expense', 3200.00, 'Divers', '2024-03-25', 'Frais de maintenance', 'autre', v_company_id)
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- CRÉER DES PRÉVISIONS
    -- ============================================

    -- Prévisions d'entrée (factures clients à venir)
    INSERT INTO public.previsions (
        account_id,
        type,
        date_prevue,
        montant,
        description,
        source_module,
        source_reference,
        statut,
        company_id,
        created_by
    ) VALUES
    -- Avril 2024
    (v_account_bank_id, 'entree', '2024-04-10', 15200.00, 'Facture client FAC-2024-007', 'ventes', 'FAC-2024-007', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'entree', '2024-04-20', 18900.00, 'Facture client FAC-2024-008', 'ventes', 'FAC-2024-008', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'entree', '2024-04-28', 11200.00, 'Facture client FAC-2024-009', 'ventes', 'FAC-2024-009', 'prevue', v_company_id, v_user_id),
    -- Mai 2024
    (v_account_bank_id, 'entree', '2024-05-05', 22300.00, 'Facture client FAC-2024-010', 'ventes', 'FAC-2024-010', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'entree', '2024-05-15', 16800.00, 'Facture client FAC-2024-011', 'ventes', 'FAC-2024-011', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'entree', '2024-05-25', 9500.00, 'Facture client FAC-2024-012', 'ventes', 'FAC-2024-012', 'prevue', v_company_id, v_user_id),
    -- Juin 2024
    (v_account_bank_id, 'entree', '2024-06-10', 20100.00, 'Facture client FAC-2024-013', 'ventes', 'FAC-2024-013', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'entree', '2024-06-20', 14500.00, 'Facture client FAC-2024-014', 'ventes', 'FAC-2024-014', 'prevue', v_company_id, v_user_id),
    -- Prévisions de sortie (dépenses prévues)
    -- Avril 2024
    (v_account_bank_id, 'sortie', '2024-04-05', 8000.00, 'Salaires avril', 'paie', 'PAIE-2024-04', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-04-15', 13200.00, 'Facture fournisseur FAC-FOUR-2024-005', 'achats', 'FAC-FOUR-2024-005', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-04-25', 5600.00, 'Facture fournisseur FAC-FOUR-2024-006', 'achats', 'FAC-FOUR-2024-006', 'prevue', v_company_id, v_user_id),
    -- Mai 2024
    (v_account_bank_id, 'sortie', '2024-05-05', 8000.00, 'Salaires mai', 'paie', 'PAIE-2024-05', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-05-18', 14800.00, 'Facture fournisseur FAC-FOUR-2024-007', 'achats', 'FAC-FOUR-2024-007', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-05-28', 4200.00, 'Frais de maintenance', 'manuel', NULL, 'prevue', v_company_id, v_user_id),
    -- Juin 2024
    (v_account_bank_id, 'sortie', '2024-06-05', 8000.00, 'Salaires juin', 'paie', 'PAIE-2024-06', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-06-15', 11200.00, 'Facture fournisseur FAC-FOUR-2024-008', 'achats', 'FAC-FOUR-2024-008', 'prevue', v_company_id, v_user_id),
    (v_account_bank_id, 'sortie', '2024-06-30', 2800.00, 'Frais administratifs', 'manuel', NULL, 'prevue', v_company_id, v_user_id)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Données Finance créées avec succès pour ABC Archibat (company_id: %)', v_company_id;
    RAISE NOTICE 'Comptes créés: Compte principal, Caisse, Épargne';
    RAISE NOTICE 'Transactions créées: 15 mouvements';
    RAISE NOTICE 'Prévisions créées: 18 prévisions';

END $$;
