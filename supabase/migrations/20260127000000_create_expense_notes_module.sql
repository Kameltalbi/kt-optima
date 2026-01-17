-- ============================================
-- MODULE NOTES DE FRAIS
-- ============================================

-- Table: Catégories de dépenses
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50),
    plafond_mensuel DECIMAL(15, 2), -- Plafond mensuel pour cette catégorie
    plafond_annuel DECIMAL(15, 2), -- Plafond annuel pour cette catégorie
    actif BOOLEAN DEFAULT true,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, company_id)
);

COMMENT ON TABLE public.expense_categories IS 'Catégories de dépenses pour les notes de frais';
COMMENT ON COLUMN public.expense_categories.plafond_mensuel IS 'Plafond mensuel autorisé pour cette catégorie';
COMMENT ON COLUMN public.expense_categories.plafond_annuel IS 'Plafond annuel autorisé pour cette catégorie';

-- Table: Notes de frais
CREATE TABLE IF NOT EXISTS public.expense_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(100) NOT NULL, -- Numéro séquentiel de la note
    employee_id UUID REFERENCES public.employes(id) ON DELETE RESTRICT, -- Table "employes" (RH), pas "employees"
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

COMMENT ON TABLE public.expense_notes IS 'Notes de frais des employés';
COMMENT ON COLUMN public.expense_notes.status IS 'brouillon, soumis, valide, rejete, paye';
COMMENT ON COLUMN public.expense_notes.number IS 'Numéro séquentiel unique par entreprise';

-- Table: Lignes de notes de frais
CREATE TABLE IF NOT EXISTS public.expense_note_items (
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

COMMENT ON TABLE public.expense_note_items IS 'Lignes de dépenses d''une note de frais';

-- Table: Justificatifs (documents)
CREATE TABLE IF NOT EXISTS public.expense_attachments (
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

COMMENT ON TABLE public.expense_attachments IS 'Justificatifs (documents) attachés aux notes de frais ou lignes';

-- Table: Historique et audit
CREATE TABLE IF NOT EXISTS public.expense_note_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_note_id UUID NOT NULL REFERENCES public.expense_notes(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'submitted', 'validated', 'rejected', 'paid', 'updated'
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.expense_note_history IS 'Historique et audit des actions sur les notes de frais';

-- Index
CREATE INDEX idx_expense_categories_company_id ON public.expense_categories(company_id);
CREATE INDEX idx_expense_notes_company_id ON public.expense_notes(company_id);
CREATE INDEX idx_expense_notes_employee_id ON public.expense_notes(employee_id);
CREATE INDEX idx_expense_notes_status ON public.expense_notes(status);
CREATE INDEX idx_expense_notes_date ON public.expense_notes(date);
CREATE INDEX idx_expense_notes_number ON public.expense_notes(number);
CREATE INDEX idx_expense_note_items_expense_note_id ON public.expense_note_items(expense_note_id);
CREATE INDEX idx_expense_note_items_category_id ON public.expense_note_items(category_id);
CREATE INDEX idx_expense_attachments_expense_note_id ON public.expense_attachments(expense_note_id);
CREATE INDEX idx_expense_attachments_expense_item_id ON public.expense_attachments(expense_item_id);
CREATE INDEX idx_expense_note_history_expense_note_id ON public.expense_note_history(expense_note_id);

-- RLS Policies
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_note_history ENABLE ROW LEVEL SECURITY;

-- Policies pour expense_categories
CREATE POLICY "Users can view expense categories in their company"
ON public.expense_categories FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert expense categories in their company"
ON public.expense_categories FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update expense categories in their company"
ON public.expense_categories FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete expense categories in their company"
ON public.expense_categories FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Policies pour expense_notes
CREATE POLICY "Users can view expense notes in their company"
ON public.expense_notes FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert expense notes in their company"
ON public.expense_notes FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update expense notes in their company"
ON public.expense_notes FOR UPDATE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete expense notes in their company"
ON public.expense_notes FOR DELETE
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

-- Policies pour expense_note_items
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

-- Policies pour expense_attachments
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

-- Policies pour expense_note_history
CREATE POLICY "Users can view expense note history via expense note"
ON public.expense_note_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_note_history.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can insert expense note history via expense note"
ON public.expense_note_history FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.expense_notes
        WHERE expense_notes.id = expense_note_history.expense_note_id
        AND expense_notes.company_id = public.get_user_company_id(auth.uid())
    )
);

-- Triggers
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_notes_updated_at
BEFORE UPDATE ON public.expense_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour calculer le total de la note de frais
CREATE OR REPLACE FUNCTION calculate_expense_note_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.expense_notes
    SET total_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.expense_note_items
        WHERE expense_note_id = COALESCE(NEW.expense_note_id, OLD.expense_note_id)
    )
    WHERE id = COALESCE(NEW.expense_note_id, OLD.expense_note_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_expense_note_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.expense_note_items
FOR EACH ROW EXECUTE FUNCTION calculate_expense_note_total();

-- Trigger pour créer l'historique automatiquement
CREATE OR REPLACE FUNCTION log_expense_note_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.expense_note_history (expense_note_id, action, new_status, user_id)
        VALUES (NEW.id, 'created', NEW.status, NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO public.expense_note_history (expense_note_id, action, old_status, new_status, user_id)
            VALUES (NEW.id, 
                    CASE NEW.status
                        WHEN 'soumis' THEN 'submitted'
                        WHEN 'valide' THEN 'validated'
                        WHEN 'rejete' THEN 'rejected'
                        WHEN 'paye' THEN 'paid'
                        ELSE 'updated'
                    END,
                    OLD.status, NEW.status, auth.uid());
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_expense_note_history_trigger
AFTER INSERT OR UPDATE ON public.expense_notes
FOR EACH ROW EXECUTE FUNCTION log_expense_note_history();

-- ============================================
-- STORAGE BUCKET POUR JUSTIFICATIFS
-- ============================================

-- Créer le bucket pour les justificatifs de notes de frais
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-attachments', 'expense-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture : seuls les utilisateurs de la même société peuvent lire
CREATE POLICY "Users can read their company expense attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expense-attachments'
  AND auth.role() = 'authenticated'
);

-- Politique d'insertion : utilisateurs authentifiés peuvent uploader
CREATE POLICY "Users can upload expense attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expense-attachments'
  AND auth.role() = 'authenticated'
);

-- Politique de mise à jour
CREATE POLICY "Users can update their company expense attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expense-attachments'
  AND auth.role() = 'authenticated'
);

-- Politique de suppression
CREATE POLICY "Users can delete their company expense attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expense-attachments'
  AND auth.role() = 'authenticated'
);
