-- Drop all existing INSERT policies on companies
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create fresh INSERT policy with explicit role targeting
CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);