-- Mettre à jour le company_id dans le profile de l'utilisateur superadmin
UPDATE profiles 
SET company_id = '34b42a68-b668-4f25-85ce-ffe63defda3f' 
WHERE user_id = '8b7ee06b-4697-4c0d-902f-697b3ab36424' AND company_id IS NULL;