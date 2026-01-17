-- ============================================
-- SÉCURISATION : companies.plan et subscriptions
-- ============================================
-- À exécuter après 20260126000000_update_plans_enum.sql
-- Si "Impossible de modifier le plan" : exécutez d'abord
-- 20260118000000_add_superadmin_role.sql puis 20260126000000.

-- 1. Colonne companies.plan si absente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.companies
    ADD COLUMN plan public.company_plan NOT NULL DEFAULT 'depart';
    COMMENT ON COLUMN public.companies.plan IS 'Plan: depart, starter, business, enterprise';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'Type company_plan ou valeur depart absents. Exécutez 20260126000000_update_plans_enum.sql.';
  WHEN OTHERS THEN
    RAISE;
END $$;

-- 2. Table subscriptions si absente
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
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

-- Index et RLS pour subscriptions (si la table vient d'être créée, les CREATE IF NOT EXISTS sont sans effet si déjà présents)
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies subscriptions (éviter doublons : DROP IF EXISTS puis CREATE)
DROP POLICY IF EXISTS "Superadmin can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmin can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmin can manage all subscriptions" ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid())) WITH CHECK (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Companies can view their own subscription" ON public.subscriptions;
CREATE POLICY "Companies can view their own subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));
