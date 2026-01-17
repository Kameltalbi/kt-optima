-- ============================================
-- S'assurer que la table subscriptions et la colonne plan existent
-- Corrige les 404 sur /rest/v1/subscriptions
-- ============================================

-- 1. Fonction update_updated_at_column (si absente)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Valeur 'superadmin' dans app_role (si absente)
DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Fonction is_superadmin (pour RLS subscriptions)
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = 'superadmin'
    )
$$;

-- 4. Type company_plan avec les 4 plans (création ou complétion)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_plan') THEN
        CREATE TYPE public.company_plan AS ENUM ('depart', 'starter', 'business', 'enterprise');
    ELSE
        ALTER TYPE public.company_plan ADD VALUE IF NOT EXISTS 'depart';
        ALTER TYPE public.company_plan ADD VALUE IF NOT EXISTS 'starter';
        ALTER TYPE public.company_plan ADD VALUE IF NOT EXISTS 'business';
        ALTER TYPE public.company_plan ADD VALUE IF NOT EXISTS 'enterprise';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Colonne plan sur companies (si absente)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS plan public.company_plan NOT NULL DEFAULT 'depart';

-- 6. Table subscriptions (si absente)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    plan public.company_plan NOT NULL DEFAULT 'depart',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'TND',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'yearly')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (company_id)
);

-- 7. RLS sur subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmin can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmin can manage all subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Companies can view their own subscription" ON public.subscriptions;
CREATE POLICY "Companies can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 8. Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- 9. Trigger updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Politiques superadmin sur companies (au cas où)
DROP POLICY IF EXISTS "Superadmin can view all companies" ON public.companies;
CREATE POLICY "Superadmin can view all companies"
ON public.companies FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can manage all companies" ON public.companies;
CREATE POLICY "Superadmin can manage all companies"
ON public.companies FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));
