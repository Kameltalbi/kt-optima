-- Insérer le rôle superadmin pour l'utilisateur kameltalbi.tn@gmail.com
INSERT INTO public.user_roles (user_id, company_id, role)
SELECT 
    au.id as user_id,
    COALESCE(p.company_id, (SELECT id FROM public.companies LIMIT 1)) as company_id,
    'superadmin'::public.app_role as role
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE au.email = 'kameltalbi.tn@gmail.com'
ON CONFLICT DO NOTHING;