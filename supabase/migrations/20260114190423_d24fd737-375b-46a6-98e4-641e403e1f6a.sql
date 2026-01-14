-- Create a secure helper to create a company and link it to the current user
-- This avoids client-side multi-step inserts that can fail under RLS.

CREATE OR REPLACE FUNCTION public.create_company_and_link_profile(
  _name text,
  _tax_number text DEFAULT NULL,
  _address text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL,
  _currency text DEFAULT 'TND',
  _language text DEFAULT 'fr'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_company_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.companies (name, tax_number, address, phone, email, currency, language)
  VALUES (_name, _tax_number, _address, _phone, _email, COALESCE(_currency, 'TND'), COALESCE(_language, 'fr'))
  RETURNING id INTO v_company_id;

  UPDATE public.profiles
  SET company_id = v_company_id
  WHERE user_id = v_uid;

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (v_uid, v_company_id, 'admin')
  ON CONFLICT DO NOTHING;

  RETURN v_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_company_and_link_profile(text, text, text, text, text, text, text) TO authenticated;