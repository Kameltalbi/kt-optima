-- ============================================
-- UPDATE PLANS ENUM TO NEW STRUCTURE
-- ============================================
-- Migration pour adapter les plans aux nouveaux noms :
-- - depart (ancien core) : 0 DT/mois
-- - starter : 45 DT/mois
-- - business : 79 DT/mois
-- - enterprise : 139 DT/mois

-- 1. Créer le nouveau type enum avec les nouveaux plans
DO $$ BEGIN
    CREATE TYPE public.company_plan_new AS ENUM ('depart', 'starter', 'business', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Gérer la colonne plan dans companies
DO $$
DECLARE
    plan_exists BOOLEAN;
    plan_new_exists BOOLEAN;
BEGIN
    -- Vérifier si la colonne plan existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'plan'
    ) INTO plan_exists;
    
    -- Vérifier si la colonne plan_new existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'plan_new'
    ) INTO plan_new_exists;
    
    IF plan_exists AND NOT plan_new_exists THEN
        -- La colonne plan existe, on crée plan_new pour la migration
        ALTER TABLE public.companies
        ADD COLUMN plan_new public.company_plan_new;
        
        -- Migrer les données
        UPDATE public.companies
        SET plan_new = CASE 
            WHEN plan::text = 'core' THEN 'depart'::public.company_plan_new
            WHEN plan::text = 'business' THEN 'business'::public.company_plan_new
            WHEN plan::text = 'enterprise' THEN 'enterprise'::public.company_plan_new
            ELSE 'depart'::public.company_plan_new
        END;
        
        -- Supprimer l'ancienne colonne
        ALTER TABLE public.companies DROP COLUMN plan;
        
        -- Renommer plan_new en plan
        ALTER TABLE public.companies RENAME COLUMN plan_new TO plan;
        
        -- Mettre NOT NULL
        ALTER TABLE public.companies ALTER COLUMN plan SET NOT NULL;
        
    ELSIF NOT plan_exists AND NOT plan_new_exists THEN
        -- La colonne n'existe pas, on crée directement plan avec le nouveau type
        ALTER TABLE public.companies
        ADD COLUMN plan public.company_plan_new NOT NULL DEFAULT 'depart';
    END IF;
END $$;

-- 3. Gérer la colonne plan dans subscriptions (si la table existe)
DO $$
DECLARE
    table_exists BOOLEAN;
    plan_exists BOOLEAN;
    plan_new_exists BOOLEAN;
BEGIN
    -- Vérifier si la table subscriptions existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Vérifier si la colonne plan existe
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'subscriptions' 
            AND column_name = 'plan'
        ) INTO plan_exists;
        
        -- Vérifier si la colonne plan_new existe
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'subscriptions' 
            AND column_name = 'plan_new'
        ) INTO plan_new_exists;
        
        IF plan_exists AND NOT plan_new_exists THEN
            -- La colonne plan existe, on crée plan_new pour la migration
            ALTER TABLE public.subscriptions
            ADD COLUMN plan_new public.company_plan_new;
            
            -- Migrer les données
            UPDATE public.subscriptions
            SET plan_new = CASE 
                WHEN plan::text = 'core' THEN 'depart'::public.company_plan_new
                WHEN plan::text = 'business' THEN 'business'::public.company_plan_new
                WHEN plan::text = 'enterprise' THEN 'enterprise'::public.company_plan_new
                ELSE 'depart'::public.company_plan_new
            END;
            
            -- Supprimer l'ancienne colonne
            ALTER TABLE public.subscriptions DROP COLUMN plan;
            
            -- Renommer plan_new en plan
            ALTER TABLE public.subscriptions RENAME COLUMN plan_new TO plan;
            
            -- Mettre NOT NULL
            ALTER TABLE public.subscriptions ALTER COLUMN plan SET NOT NULL;
            
        ELSIF NOT plan_exists AND NOT plan_new_exists THEN
            -- La colonne n'existe pas, on crée directement plan avec le nouveau type
            ALTER TABLE public.subscriptions
            ADD COLUMN plan public.company_plan_new NOT NULL DEFAULT 'depart';
        END IF;
    END IF;
END $$;

-- 4. Gérer les types enum
DO $$
BEGIN
    -- Supprimer l'ancien type enum s'il existe (seulement s'il n'est plus utilisé)
    -- On vérifie d'abord s'il est encore utilisé
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE udt_name = 'company_plan'
    ) THEN
        DROP TYPE IF EXISTS public.company_plan;
    END IF;
    
    -- Renommer le nouveau type en company_plan
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_plan_new') THEN
        ALTER TYPE public.company_plan_new RENAME TO company_plan;
    END IF;
END $$;

-- 5. Mettre à jour les commentaires
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'plan'
    ) THEN
        COMMENT ON COLUMN public.companies.plan IS 'Plan ERP: depart (0 DT - CRM+Ventes+Produits), starter (45 DT - +Encaissements+Inventaire), business (79 DT - +Stock avancé+Trésorerie+Fournisseurs+RH), enterprise (139 DT - +Comptabilité+Parc+POS)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_plan') THEN
        COMMENT ON TYPE public.company_plan IS 'Plans tarifaires: depart (gratuit), starter (45 DT/mois), business (79 DT/mois), enterprise (139 DT/mois)';
    END IF;
END $$;
