-- ============================================
-- ADD SUPERADMIN ROLE
-- ============================================

-- Add 'superadmin' to app_role enum
DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    plan public.company_plan NOT NULL,
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

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

-- ============================================
-- FUNCTION: IS_SUPERADMIN
-- ============================================
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

-- ============================================
-- RLS POLICIES FOR SUBSCRIPTIONS
-- ============================================
-- Superadmin can view all subscriptions
CREATE POLICY "Superadmin can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Superadmin can manage all subscriptions
CREATE POLICY "Superadmin can manage all subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- Companies can view their own subscription
CREATE POLICY "Companies can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================
-- RLS POLICIES FOR COMPANIES (SUPERADMIN ACCESS)
-- ============================================
-- Superadmin can view all companies
DROP POLICY IF EXISTS "Superadmin can view all companies" ON public.companies;
CREATE POLICY "Superadmin can view all companies"
ON public.companies FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Superadmin can manage all companies
DROP POLICY IF EXISTS "Superadmin can manage all companies" ON public.companies;
CREATE POLICY "Superadmin can manage all companies"
ON public.companies FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- ============================================
-- RLS POLICIES FOR MODULES (SUPERADMIN ACCESS)
-- ============================================
-- Superadmin can view all modules
DROP POLICY IF EXISTS "Superadmin can view all modules" ON public.modules;
CREATE POLICY "Superadmin can view all modules"
ON public.modules FOR SELECT
TO authenticated
USING (
    active = TRUE 
    OR public.is_superadmin(auth.uid())
);

-- Superadmin can manage all modules
DROP POLICY IF EXISTS "Superadmin can manage all modules" ON public.modules;
CREATE POLICY "Superadmin can manage all modules"
ON public.modules FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- ============================================
-- TRIGGER FOR SUBSCRIPTIONS UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
