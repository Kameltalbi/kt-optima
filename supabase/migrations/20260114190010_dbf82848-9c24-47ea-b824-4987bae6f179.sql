-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create a PERMISSIVE INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);