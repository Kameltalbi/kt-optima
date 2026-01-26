-- 1. Créer l'entreprise KT Consulting
INSERT INTO public.companies (id, name, currency, language, plan)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'KT Consulting',
  'TND',
  'fr',
  'enterprise'
);

-- 2. Attribuer le rôle HR à mguediche@gmail.com (avec le bon user_id)
INSERT INTO public.user_roles (user_id, company_id, role)
VALUES (
  'bdef490d-94c4-4f97-9ff2-09dcfcdd5c00',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'hr'
);

-- 3. Mettre à jour le profil avec le company_id
UPDATE public.profiles
SET company_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE user_id = 'bdef490d-94c4-4f97-9ff2-09dcfcdd5c00';

-- 4. Créer les permissions pour TOUS les modules
INSERT INTO public.user_permissions (user_id, company_id, module_code, can_read, can_create, can_update, can_delete)
VALUES
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'dashboard', true, true, true, true),
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ventes', true, true, true, true),
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'crm', true, true, true, true),
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'rh', true, true, true, true),
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'comptabilite', true, true, true, true),
  ('bdef490d-94c4-4f97-9ff2-09dcfcdd5c00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'parametres', true, true, true, true);

-- 5. Ajouter aussi les autres utilisateurs existants à la même entreprise
INSERT INTO public.user_roles (user_id, company_id, role)
VALUES 
  ('e647b57a-0a40-481d-9be9-6b1114dfdb25', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin'),
  ('8b7ee06b-4697-4c0d-902f-697b3ab36424', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');

UPDATE public.profiles
SET company_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE user_id IN ('e647b57a-0a40-481d-9be9-6b1114dfdb25', '8b7ee06b-4697-4c0d-902f-697b3ab36424');