-- ============================================
-- FIX RLS RECURSION IN PROFILES TABLE
-- ============================================
-- Le problème : La policy SELECT sur profiles utilise une sous-requête
-- qui lit depuis profiles, créant une récursion infinie.
-- Solution : Utiliser la fonction get_user_company_id qui est SECURITY DEFINER

-- Supprimer toutes les anciennes policies qui peuvent causer des problèmes
DROP POLICY IF EXISTS "Users can view profiles in same company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;

-- Recréer la policy profiles avec get_user_company_id (évite la récursion)
-- Cette policy permet de voir son propre profil OU les profils de la même entreprise
CREATE POLICY "Users can view profiles in same company"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- L'utilisateur peut voir son propre profil
    user_id = auth.uid()
    -- OU les profils de la même entreprise (en utilisant get_user_company_id qui est SECURITY DEFINER)
    OR (
        company_id IS NOT NULL 
        AND company_id = public.get_user_company_id(auth.uid())
    )
);

-- Recréer la policy user_roles avec get_user_company_id
CREATE POLICY "Users can view roles in their company"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid())
);
