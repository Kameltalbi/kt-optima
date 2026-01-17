-- ============================================
-- CRÉATION ENTREPRISE À L'INSCRIPTION (trigger)
-- ============================================
-- Quand company_name est dans raw_user_meta_data (signUp options.data),
-- le trigger crée : société, mise à jour du profil, rôle admin.
-- Corrige le 403 sur companies à l'inscription (auth.uid() peut être null
-- si "Confirmer l'email" est activé).

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
