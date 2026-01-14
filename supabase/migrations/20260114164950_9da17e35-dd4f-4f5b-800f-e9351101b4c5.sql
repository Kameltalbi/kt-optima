-- ============================================
-- BILVOXA ERP - CORE TABLES
-- ============================================

-- Create app_role enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user', 'accountant', 'hr', 'sales');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    tax_number VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER ROLES TABLE (separate from profiles for security)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
          AND role = _role
    )
$$;

-- Function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- Function to check if user belongs to a company
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = _user_id
          AND company_id = _company_id
    )
$$;

-- ============================================
-- RLS POLICIES FOR COMPANIES
-- ============================================
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
USING (
    id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can update their company" ON public.companies;
CREATE POLICY "Admins can update their company"
ON public.companies
FOR UPDATE
USING (
    public.user_belongs_to_company(auth.uid(), id)
    AND public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view profiles in same company" ON public.profiles;
CREATE POLICY "Users can view profiles in same company"
ON public.profiles
FOR SELECT
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- RLS POLICIES FOR USER_ROLES
-- ============================================
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;
CREATE POLICY "Users can view roles in their company"
ON public.user_roles
FOR SELECT
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage roles in their company" ON public.user_roles;
CREATE POLICY "Admins can manage roles in their company"
ON public.user_roles
FOR ALL
USING (
    public.user_belongs_to_company(auth.uid(), company_id)
    AND public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();