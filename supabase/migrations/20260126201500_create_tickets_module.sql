-- ============================================
-- TICKETS MODULE
-- ============================================
-- Support ticket system for clients to report issues to superadmin

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'autre',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT tickets_category_check CHECK (category IN ('technique', 'facturation', 'fonctionnalite', 'autre')),
    CONSTRAINT tickets_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT tickets_status_check CHECK (status IN ('new', 'in_progress', 'resolved', 'closed'))
);

-- ============================================
-- TICKET MESSAGES TABLE
-- ============================================
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- TICKET ATTACHMENTS TABLE
-- ============================================
CREATE TABLE public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_tickets_company_id ON public.tickets(company_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view tickets from their company"
ON public.tickets FOR SELECT
TO authenticated
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create tickets for their company"
ON public.tickets FOR INSERT
TO authenticated
WITH CHECK (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their company tickets"
ON public.tickets FOR UPDATE
TO authenticated
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Superadmin can view all tickets"
ON public.tickets FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can update all tickets"
ON public.tickets FOR UPDATE
TO authenticated
USING (public.is_superadmin(auth.uid()));

-- Ticket messages policies
CREATE POLICY "Users can view messages from their company tickets"
ON public.ticket_messages FOR SELECT
TO authenticated
USING (
    ticket_id IN (
        SELECT id FROM public.tickets 
        WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
        AND NOT is_internal
    )
);

CREATE POLICY "Users can create messages on their company tickets"
ON public.ticket_messages FOR INSERT
TO authenticated
WITH CHECK (
    ticket_id IN (
        SELECT id FROM public.tickets 
        WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    )
    AND NOT is_internal
);

CREATE POLICY "Superadmin can view all ticket messages"
ON public.ticket_messages FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can create ticket messages"
ON public.ticket_messages FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin(auth.uid()));

-- Ticket attachments policies
CREATE POLICY "Users can view attachments from their company tickets"
ON public.ticket_attachments FOR SELECT
TO authenticated
USING (
    ticket_id IN (
        SELECT id FROM public.tickets 
        WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can upload attachments to their company tickets"
ON public.ticket_attachments FOR INSERT
TO authenticated
WITH CHECK (
    ticket_id IN (
        SELECT id FROM public.tickets 
        WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Superadmin can view all ticket attachments"
ON public.ticket_attachments FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can upload ticket attachments"
ON public.ticket_attachments FOR INSERT
TO authenticated
WITH CHECK (public.is_superadmin(auth.uid()));

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.tickets IS 'Support tickets from companies to superadmin';
COMMENT ON TABLE public.ticket_messages IS 'Messages/conversation on tickets';
COMMENT ON TABLE public.ticket_attachments IS 'File attachments for tickets';
