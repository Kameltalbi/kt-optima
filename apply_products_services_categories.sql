-- ============================================
-- TABLES PRODUCTS, SERVICES, CATEGORIES
-- Script à exécuter directement dans Supabase SQL Editor
-- ============================================

-- Table: product_categories
-- Description: Catégories pour produits et services
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service')),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.product_categories IS 'Catégories pour produits et services';

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view categories in their company" ON public.product_categories;
CREATE POLICY "Users can view categories in their company"
ON public.product_categories FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert categories in their company" ON public.product_categories;
CREATE POLICY "Users can insert categories in their company"
ON public.product_categories FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update categories in their company" ON public.product_categories;
CREATE POLICY "Users can update categories in their company"
ON public.product_categories FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete categories in their company" ON public.product_categories;
CREATE POLICY "Users can delete categories in their company"
ON public.product_categories FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_product_categories_company_id ON public.product_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_type ON public.product_categories(company_id, type);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: products
-- Description: Produits de l'entreprise
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    purchase_price DECIMAL(15, 2),
    sale_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 20.00,
    unit VARCHAR(20) DEFAULT 'unit',
    stockable BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT products_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.products IS 'Produits de l''entreprise';

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view products in their company" ON public.products;
CREATE POLICY "Users can view products in their company"
ON public.products FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert products in their company" ON public.products;
CREATE POLICY "Users can insert products in their company"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update products in their company" ON public.products;
CREATE POLICY "Users can update products in their company"
ON public.products FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete products in their company" ON public.products;
CREATE POLICY "Users can delete products in their company"
ON public.products FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(company_id, code);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(company_id, active);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Table: services
-- Description: Services de l'entreprise
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 20.00,
    billing_type VARCHAR(20) DEFAULT 'fixed' CHECK (billing_type IN ('fixed', 'duration')),
    active BOOLEAN DEFAULT TRUE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT services_code_company_unique UNIQUE (code, company_id)
);

COMMENT ON TABLE public.services IS 'Services de l''entreprise';

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view services in their company" ON public.services;
CREATE POLICY "Users can view services in their company"
ON public.services FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert services in their company" ON public.services;
CREATE POLICY "Users can insert services in their company"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update services in their company" ON public.services;
CREATE POLICY "Users can update services in their company"
ON public.services FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete services in their company" ON public.services;
CREATE POLICY "Users can delete services in their company"
ON public.services FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Index
CREATE INDEX IF NOT EXISTS idx_services_company_id ON public.services(company_id);
CREATE INDEX IF NOT EXISTS idx_services_code ON public.services(company_id, code);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(company_id, active);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
