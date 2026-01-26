-- ============================================
-- FIX REGISTRATION TRIGGER
-- ============================================
-- Note: Les triggers sur auth.users ne peuvent pas être modifiés via migrations
-- car ils nécessitent des privilèges superuser.
-- Cette migration se concentre sur les politiques RLS pour companies.

-- 1. S'assurer que la politique d'insertion pour companies permet la création
DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON public.companies;
CREATE POLICY "Allow authenticated users to insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. S'assurer que les politiques superadmin existent
DROP POLICY IF EXISTS "Superadmin can view all companies" ON public.companies;
CREATE POLICY "Superadmin can view all companies"
ON public.companies FOR SELECT
TO authenticated
USING (public.is_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Superadmin can manage all companies" ON public.companies;
CREATE POLICY "Superadmin can manage all companies"
ON public.companies FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- 3. Vérifier que la fonction handle_new_user existe
-- Si elle n'existe pas, la créer ou la recréer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_company_name text;
  v_full_name text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_company_name := NEW.raw_user_meta_data->>'company_name';

  -- 1. Profil (comportement existant, avec upsert si déjà créé)
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name)
  ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 2. Si company_name est fourni : société + liaison profil + rôle admin
  IF v_company_name IS NOT NULL AND TRIM(v_company_name) <> '' THEN
    INSERT INTO public.companies (name, email, currency, language)
    VALUES (TRIM(v_company_name), NEW.email, 'TND', 'fr')
    RETURNING id INTO v_company_id;

    UPDATE public.profiles
    SET company_id = v_company_id
    WHERE user_id = NEW.id;

    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, v_company_id, 'admin')
    ON CONFLICT (user_id, company_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Note: Le trigger on_auth_user_created doit être créé manuellement via le dashboard Supabase
-- ou via un compte avec privilèges superuser.
-- Commande à exécuter dans le SQL Editor du dashboard:
-- 
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
