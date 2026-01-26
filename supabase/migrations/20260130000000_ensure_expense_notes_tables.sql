-- ============================================
-- VÉRIFICATION ET CORRECTION DES TABLES NOTES DE FRAIS
-- ============================================
-- Cette migration s'assure que les tables et RLS policies existent

-- Vérifier que la fonction get_user_company_id existe
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

-- S'assurer que les tables existent (CREATE IF NOT EXISTS)
DO $$ 
BEGIN
    -- Table expense_categories
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expense_categories') THEN
        CREATE TABLE public.expense_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            code VARCHAR(50),
            plafond_mensuel DECIMAL(15, 2),
            plafond_annuel DECIMAL(15, 2),
            actif BOOLEAN DEFAULT true,
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(code, company_id)
        );
        
        CREATE INDEX idx_expense_categories_company_id ON public.expense_categories(company_id);
        ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Table expense_notes
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expense_notes') THEN
        CREATE TABLE public.expense_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            number VARCHAR(100) NOT NULL,
            employee_id UUID REFERENCES public.employes(id) ON DELETE RESTRICT,
            date DATE NOT NULL,
            total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
            status VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'soumis', 'valide', 'rejete', 'paye')),
            submitted_at TIMESTAMP WITH TIME ZONE,
            validated_at TIMESTAMP WITH TIME ZONE,
            validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            rejected_at TIMESTAMP WITH TIME ZONE,
            rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            rejection_reason TEXT,
            paid_at TIMESTAMP WITH TIME ZONE,
            paid_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            notes TEXT,
            company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
            created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(number, company_id)
        );
        
        CREATE INDEX idx_expense_notes_company_id ON public.expense_notes(company_id);
        CREATE INDEX idx_expense_notes_employee_id ON public.expense_notes(employee_id);
        CREATE INDEX idx_expense_notes_status ON public.expense_notes(status);
        CREATE INDEX idx_expense_notes_date ON public.expense_notes(date);
        ALTER TABLE public.expense_notes ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Table expense_note_items
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expense_note_items') THEN
        CREATE TABLE public.expense_note_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            expense_note_id UUID NOT NULL REFERENCES public.expense_notes(id) ON DELETE CASCADE,
            category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
            description TEXT NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            date DATE NOT NULL,
            tva_rate DECIMAL(5, 2) DEFAULT 0,
            tva_amount DECIMAL(15, 2) DEFAULT 0,
            total_amount DECIMAL(15, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_expense_note_items_expense_note_id ON public.expense_note_items(expense_note_id);
        CREATE INDEX idx_expense_note_items_category_id ON public.expense_note_items(category_id);
        ALTER TABLE public.expense_note_items ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Table expense_attachments
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expense_attachments') THEN
        CREATE TABLE public.expense_attachments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            expense_note_id UUID REFERENCES public.expense_notes(id) ON DELETE CASCADE,
            expense_item_id UUID REFERENCES public.expense_note_items(id) ON DELETE CASCADE,
            file_name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            file_type VARCHAR(100),
            uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_expense_attachments_expense_note_id ON public.expense_attachments(expense_note_id);
        CREATE INDEX idx_expense_attachments_expense_item_id ON public.expense_attachments(expense_item_id);
        ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Recréer les RLS policies pour expense_categories (au cas où elles n'existent pas)
DROP POLICY IF EXISTS "Users can view expense categories in their company" ON public.expense_categories;
CREATE POLICY "Users can view expense categories in their company"
ON public.expense_categories FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert expense categories in their company" ON public.expense_categories;
CREATE POLICY "Users can insert expense categories in their company"
ON public.expense_categories FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update expense categories in their company" ON public.expense_categories;
CREATE POLICY "Users can update expense categories in their company"
ON public.expense_categories FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete expense categories in their company" ON public.expense_categories;
CREATE POLICY "Users can delete expense categories in their company"
ON public.expense_categories FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Recréer les RLS policies pour expense_notes
DROP POLICY IF EXISTS "Users can view expense notes in their company" ON public.expense_notes;
CREATE POLICY "Users can view expense notes in their company"
ON public.expense_notes FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert expense notes in their company" ON public.expense_notes;
CREATE POLICY "Users can insert expense notes in their company"
ON public.expense_notes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update expense notes in their company" ON public.expense_notes;
CREATE POLICY "Users can update expense notes in their company"
ON public.expense_notes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete expense notes in their company" ON public.expense_notes;
CREATE POLICY "Users can delete expense notes in their company"
ON public.expense_notes FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- RLS policies pour expense_note_items
DROP POLICY IF EXISTS "Users can view expense note items via expense note" ON public.expense_note_items;
CREATE POLICY "Users can view expense note items via expense note"
ON public.expense_note_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_note_items.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage expense note items via expense note" ON public.expense_note_items;
CREATE POLICY "Users can manage expense note items via expense note"
ON public.expense_note_items FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_note_items.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);

-- RLS policies pour expense_attachments
DROP POLICY IF EXISTS "Users can view expense attachments via expense note" ON public.expense_attachments;
CREATE POLICY "Users can view expense attachments via expense note"
ON public.expense_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_attachments.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can manage expense attachments via expense note" ON public.expense_attachments;
CREATE POLICY "Users can manage expense attachments via expense note"
ON public.expense_attachments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_attachments.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);
