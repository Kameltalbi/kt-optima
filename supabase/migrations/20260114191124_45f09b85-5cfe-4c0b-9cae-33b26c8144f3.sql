-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their company logo" ON storage.objects;

-- Create new permissive policies for company-logos bucket
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload to company-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can update in company-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can delete from company-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');