-- ============================================
-- BILVOXA ERP - STOCK & FINANCE TABLES
-- ============================================

-- ============================================
-- WAREHOUSES TABLE
-- ============================================
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    manager VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    capacity DECIMAL(10, 2),
    description TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view warehouses in their company"
ON public.warehouses FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage warehouses in their company"
ON public.warehouses FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_warehouses_updated_at
BEFORE UPDATE ON public.warehouses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STOCK ITEMS TABLE
-- ============================================
CREATE TABLE public.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_quantity DECIMAL(10, 2) DEFAULT 0,
    max_quantity DECIMAL(10, 2),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock in their company"
ON public.stock_items FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage stock in their company"
ON public.stock_items FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_stock_items_updated_at
BEFORE UPDATE ON public.stock_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STOCK MOVEMENTS TABLE
-- ============================================
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity DECIMAL(10, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view movements in their company"
ON public.stock_movements FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage movements in their company"
ON public.stock_movements FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- STOCK ALERTS TABLE
-- ============================================
CREATE TABLE public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock')),
    threshold DECIMAL(10, 2),
    current_quantity DECIMAL(10, 2),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts in their company"
ON public.stock_alerts FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage alerts in their company"
ON public.stock_alerts FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- ACCOUNTS TABLE (Bank/Cash accounts)
-- ============================================
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bank', 'cash', 'savings')),
    balance DECIMAL(15, 2) DEFAULT 0,
    account_number VARCHAR(100),
    bank_name VARCHAR(255),
    iban VARCHAR(50),
    bic VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accounts in their company"
ON public.accounts FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage accounts in their company"
ON public.accounts FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions in their company"
ON public.transactions FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage transactions in their company"
ON public.transactions FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'bank', 'check', 'card', 'transfer')),
    reference VARCHAR(255),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments in their company"
ON public.payments FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage payments in their company"
ON public.payments FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

-- ============================================
-- QUOTES TABLE
-- ============================================
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(100) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    expires_at DATE,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(number, company_id)
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotes in their company"
ON public.quotes FOR SELECT
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Users can manage quotes in their company"
ON public.quotes FOR ALL
USING (public.user_belongs_to_company(auth.uid(), company_id));

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- QUOTE ITEMS TABLE
-- ============================================
CREATE TABLE public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote items via quote"
ON public.quote_items FOR SELECT
USING (
    quote_id IN (
        SELECT id FROM public.quotes 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);

CREATE POLICY "Users can manage quote items via quote"
ON public.quote_items FOR ALL
USING (
    quote_id IN (
        SELECT id FROM public.quotes 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);