-- ============================================
-- FIX RLS RECURSION IN PROFILES TABLE - FINAL
-- ============================================
-- Le problème : La policy SELECT sur profiles utilise une sous-requête
-- qui lit depuis profiles, créant une récursion infinie.
-- Solution : Simplifier la policy pour éviter toute récursion

-- Supprimer toutes les anciennes policies problématiques
DROP POLICY IF EXISTS "Users can view profiles in same company" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view roles in their company" ON public.user_roles;

-- Policy simplifiée : Les utilisateurs peuvent voir leur propre profil
-- Pour voir les autres profils de la même entreprise, on utilisera get_user_company_id
-- dans les autres tables, pas directement dans profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy pour voir les profils de la même entreprise
-- On utilise get_user_company_id qui est SECURITY DEFINER et contourne RLS
CREATE POLICY "Users can view profiles in same company"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
);

-- Recréer la policy user_roles avec get_user_company_id
CREATE POLICY "Users can view roles in their company"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    company_id = public.get_user_company_id(auth.uid())
);
