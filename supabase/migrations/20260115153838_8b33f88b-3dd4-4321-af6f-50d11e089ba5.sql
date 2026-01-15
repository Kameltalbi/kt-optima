-- Créer le bucket pour les contrats RH
INSERT INTO storage.buckets (id, name, public)
VALUES ('hr-contracts', 'hr-contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture : seuls les utilisateurs de la même société peuvent lire
CREATE POLICY "Users can read their company contracts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'hr-contracts'
  AND auth.role() = 'authenticated'
);

-- Politique d'insertion : utilisateurs authentifiés peuvent uploader
CREATE POLICY "Users can upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hr-contracts'
  AND auth.role() = 'authenticated'
);

-- Politique de mise à jour
CREATE POLICY "Users can update their company contracts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hr-contracts'
  AND auth.role() = 'authenticated'
);

-- Politique de suppression
CREATE POLICY "Users can delete their company contracts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hr-contracts'
  AND auth.role() = 'authenticated'
);