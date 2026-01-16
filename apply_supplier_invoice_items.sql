-- ============================================
-- LIGNES DE FACTURES FOURNISSEURS
-- Script à exécuter directement dans Supabase SQL Editor
-- ============================================

-- Table: supplier_invoice_items
-- Description: Lignes de produits/services dans une facture fournisseur
CREATE TABLE IF NOT EXISTS public.supplier_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
    product_id UUID, -- Référence vers produit (sera lié à produits quand la table existera)
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.supplier_invoice_items IS 'Lignes de produits/services dans une facture fournisseur';

-- Enable RLS
ALTER TABLE public.supplier_invoice_items ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_supplier_invoice_items_invoice_id ON public.supplier_invoice_items(supplier_invoice_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoice_items_product_id ON public.supplier_invoice_items(product_id);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view supplier_invoice_items via invoice" ON public.supplier_invoice_items;
CREATE POLICY "Users can view supplier_invoice_items via invoice"
ON public.supplier_invoice_items FOR SELECT
USING (
    supplier_invoice_id IN (
        SELECT id FROM public.supplier_invoices 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);

DROP POLICY IF EXISTS "Users can manage supplier_invoice_items via invoice" ON public.supplier_invoice_items;
CREATE POLICY "Users can manage supplier_invoice_items via invoice"
ON public.supplier_invoice_items FOR ALL
USING (
    supplier_invoice_id IN (
        SELECT id FROM public.supplier_invoices 
        WHERE public.user_belongs_to_company(auth.uid(), company_id)
    )
);
