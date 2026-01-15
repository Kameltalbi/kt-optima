-- ============================================
-- SET SUPERADMIN USER
-- ============================================
-- Cette migration attribue le rôle superadmin à l'utilisateur spécifié
-- Email: kameltalbi.tn@gmail.com

-- Créer une company système pour le superadmin si elle n'existe pas
INSERT INTO public.companies (id, name, email, currency, language, plan)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Système SuperAdmin',
    'system@maghreb-erp.com',
    'TND',
    'fr',
    'enterprise'
)
ON CONFLICT (id) DO NOTHING;

-- Fonction pour attribuer le rôle superadmin à un utilisateur par email
CREATE OR REPLACE FUNCTION public.set_superadmin_role(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
    system_company_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Trouver l'ID de l'utilisateur par email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;

    -- Si l'utilisateur n'existe pas, retourner false
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Utilisateur avec email % non trouvé', user_email;
        RETURN FALSE;
    END IF;

    -- Supprimer les rôles existants pour cet utilisateur dans la company système
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id
      AND company_id = system_company_id;

    -- Attribuer le rôle superadmin
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (target_user_id, system_company_id, 'superadmin')
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET role = 'superadmin';

    -- Mettre à jour le profile pour lier à la company système
    UPDATE public.profiles
    SET company_id = system_company_id
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Rôle superadmin attribué à l''utilisateur %', user_email;
    RETURN TRUE;
END;
$$;

-- Attribuer le rôle superadmin à l'utilisateur spécifié
SELECT public.set_superadmin_role('kameltalbi.tn@gmail.com');

-- Commentaire
COMMENT ON FUNCTION public.set_superadmin_role IS 'Attribue le rôle superadmin à un utilisateur par email';
