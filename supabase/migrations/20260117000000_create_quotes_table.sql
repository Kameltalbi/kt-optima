-- ============================================
-- QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotes (
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
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert quotes in their company"
ON public.quotes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update quotes in their company"
ON public.quotes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete quotes in their company"
ON public.quotes FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_quotes_company_id ON public.quotes(company_id);
CREATE INDEX idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX idx_quotes_number ON public.quotes(number);
CREATE INDEX idx_quotes_date ON public.quotes(date);
CREATE INDEX idx_quotes_status ON public.quotes(status);

-- ============================================
-- QUOTE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quote_items (
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
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quotes
        WHERE id = quote_items.quote_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can insert quote items via quote"
ON public.quote_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quotes
        WHERE id = quote_items.quote_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can update quote items via quote"
ON public.quote_items FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quotes
        WHERE id = quote_items.quote_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quotes
        WHERE id = quote_items.quote_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can delete quote items via quote"
ON public.quote_items FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quotes
        WHERE id = quote_items.quote_id
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

-- Index
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON public.quote_items(product_id);
CREATE INDEX idx_quote_items_service_id ON public.quote_items(service_id);
