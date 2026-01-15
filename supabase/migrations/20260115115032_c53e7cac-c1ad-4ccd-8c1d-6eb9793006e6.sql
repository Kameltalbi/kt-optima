-- Fix profiles table RLS: restrict SELECT to own profile or profiles in same company

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a single comprehensive SELECT policy
-- Users can view: their own profile OR profiles of users in the same company
CREATE POLICY "Users can view profiles in their company or own"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR 
    (company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid()))
);

-- Ensure anonymous users cannot access profiles at all
-- The TO authenticated clause already handles this, but let's be explicit
-- by ensuring RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;