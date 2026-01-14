-- ============================================
-- BILVOXA ERP - ACHATS & CRM TABLES
-- ============================================

-- ============================================
-- PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(100) NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    expected_date DATE,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(number, company_id)
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase orders in their company"
ON public.purchase_orders FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage purchase orders in their company"
ON public.purchase_orders FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PURCHASE ORDER ITEMS TABLE
-- ============================================
CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view po items via po"
ON public.purchase_order_items FOR SELECT
USING (
    purchase_order_id IN (
        SELECT id FROM public.purchase_orders 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);

CREATE POLICY "Users can manage po items via po"
ON public.purchase_order_items FOR ALL
USING (
    purchase_order_id IN (
        SELECT id FROM public.purchase_orders 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);

-- ============================================
-- SUPPLIER INVOICES TABLE
-- ============================================
CREATE TABLE public.supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(100) NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT NOT NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'received', 'paid', 'overdue', 'partial')),
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(number, company_id)
);

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier invoices in their company"
ON public.supplier_invoices FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage supplier invoices in their company"
ON public.supplier_invoices FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_supplier_invoices_updated_at
BEFORE UPDATE ON public.supplier_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CRM COMPANIES TABLE
-- ============================================
CREATE TABLE public.crm_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    sector VARCHAR(100),
    sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view crm companies in their company"
ON public.crm_companies FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage crm companies in their company"
ON public.crm_companies FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_crm_companies_updated_at
BEFORE UPDATE ON public.crm_companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CRM CONTACTS TABLE
-- ============================================
CREATE TABLE public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    position VARCHAR(100),
    crm_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
    tags TEXT[],
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view crm contacts in their company"
ON public.crm_contacts FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage crm contacts in their company"
ON public.crm_contacts FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_crm_contacts_updated_at
BEFORE UPDATE ON public.crm_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CRM OPPORTUNITIES TABLE
-- ============================================
CREATE TABLE public.crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    crm_company_id UUID REFERENCES public.crm_companies(id) ON DELETE RESTRICT NOT NULL,
    crm_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    estimated_amount DECIMAL(15, 2) DEFAULT 0,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stage VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'qualification', 'proposal', 'negotiation', 'won', 'lost')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    description TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opportunities in their company"
ON public.crm_opportunities FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage opportunities in their company"
ON public.crm_opportunities FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_crm_opportunities_updated_at
BEFORE UPDATE ON public.crm_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CRM ACTIVITIES TABLE
-- ============================================
CREATE TABLE public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'task')),
    subject VARCHAR(255) NOT NULL,
    crm_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    crm_company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
    crm_opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME,
    duration INTEGER,
    sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities in their company"
ON public.crm_activities FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage activities in their company"
ON public.crm_activities FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_crm_activities_updated_at
BEFORE UPDATE ON public.crm_activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();