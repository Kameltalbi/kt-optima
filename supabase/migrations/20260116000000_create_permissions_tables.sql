-- ============================================
-- PERMISSIONS SYSTEM - TABLES
-- ============================================

-- Table des modules ERP
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des modules par défaut
INSERT INTO public.modules (code, name, description) VALUES
    ('dashboard', 'Tableau de bord', 'Vue d''ensemble de l''activité'),
    ('ventes', 'Ventes', 'Gestion des ventes et factures clients'),
    ('crm', 'CRM', 'Gestion de la relation client'),
    ('rh', 'Ressources humaines', 'Gestion des employés et RH'),
    ('comptabilite', 'Comptabilité', 'Gestion comptable'),
    ('parametres', 'Paramètres', 'Configuration de l''application')
ON CONFLICT (code) DO NOTHING;

-- Table des permissions utilisateur (permissions directes)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, company_id, module_code)
);

-- Table des rôles personnalisés
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, name)
);

-- Table des permissions de rôle
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (role_id, module_code)
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR MODULES
-- ============================================
CREATE POLICY "Everyone can view active modules"
ON public.modules FOR SELECT
TO authenticated
USING (active = TRUE);

-- ============================================
-- RLS POLICIES FOR USER_PERMISSIONS
-- ============================================
CREATE POLICY "Users can view permissions in their company"
ON public.user_permissions FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage user permissions in their company"
ON public.user_permissions FOR ALL
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- RLS POLICIES FOR ROLES
-- ============================================
CREATE POLICY "Users can view roles in their company"
ON public.roles FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can manage roles in their company"
ON public.roles FOR ALL
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- RLS POLICIES FOR ROLE_PERMISSIONS
-- ============================================
CREATE POLICY "Users can view role permissions in their company"
ON public.role_permissions FOR SELECT
TO authenticated
USING (
    role_id IN (
        SELECT id FROM public.roles 
        WHERE company_id = public.get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Admins can manage role permissions in their company"
ON public.role_permissions FOR ALL
TO authenticated
USING (
    role_id IN (
        SELECT id FROM public.roles 
        WHERE company_id = public.get_user_company_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    )
)
WITH CHECK (
    role_id IN (
        SELECT id FROM public.roles 
        WHERE company_id = public.get_user_company_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    )
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_company ON public.user_permissions(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module ON public.user_permissions(module_code);
CREATE INDEX IF NOT EXISTS idx_roles_company ON public.roles(company_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module ON public.role_permissions(module_code);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
