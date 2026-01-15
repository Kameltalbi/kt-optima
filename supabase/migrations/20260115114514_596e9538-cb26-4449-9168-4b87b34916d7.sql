-- Secure the employes table: only HR and admin users can access employee data

-- First, enable RLS if not already enabled
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "employes_select_policy" ON public.employes;
DROP POLICY IF EXISTS "employes_insert_policy" ON public.employes;
DROP POLICY IF EXISTS "employes_update_policy" ON public.employes;
DROP POLICY IF EXISTS "employes_delete_policy" ON public.employes;
DROP POLICY IF EXISTS "Users can view employees in their company" ON public.employes;
DROP POLICY IF EXISTS "Users can create employees in their company" ON public.employes;
DROP POLICY IF EXISTS "Users can update employees in their company" ON public.employes;
DROP POLICY IF EXISTS "Users can delete employees in their company" ON public.employes;

-- Create a helper function to check if user has HR or admin role
CREATE OR REPLACE FUNCTION public.user_has_hr_or_admin_role(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id 
        AND company_id = _company_id 
        AND role IN ('admin', 'hr')
    );
$$;

-- SELECT: Only HR and admin users can view employee data within their company
CREATE POLICY "HR and admins can view employees"
ON public.employes
FOR SELECT
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

-- INSERT: Only HR and admin users can create employees within their company
CREATE POLICY "HR and admins can create employees"
ON public.employes
FOR INSERT
TO authenticated
WITH CHECK (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

-- UPDATE: Only HR and admin users can update employees within their company
CREATE POLICY "HR and admins can update employees"
ON public.employes
FOR UPDATE
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
)
WITH CHECK (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

-- DELETE: Only HR and admin users can delete employees within their company
CREATE POLICY "HR and admins can delete employees"
ON public.employes
FOR DELETE
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

-- Also secure the salaires table (contains sensitive payroll data)
ALTER TABLE public.salaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salaires_select_policy" ON public.salaires;
DROP POLICY IF EXISTS "salaires_insert_policy" ON public.salaires;
DROP POLICY IF EXISTS "salaires_update_policy" ON public.salaires;
DROP POLICY IF EXISTS "salaires_delete_policy" ON public.salaires;

CREATE POLICY "HR and admins can view salaries"
ON public.salaires
FOR SELECT
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

CREATE POLICY "HR and admins can create salaries"
ON public.salaires
FOR INSERT
TO authenticated
WITH CHECK (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

CREATE POLICY "HR and admins can update salaries"
ON public.salaires
FOR UPDATE
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
)
WITH CHECK (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);

CREATE POLICY "HR and admins can delete salaries"
ON public.salaires
FOR DELETE
TO authenticated
USING (
    public.user_has_hr_or_admin_role(auth.uid(), company_id)
);