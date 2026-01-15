-- ============================================
-- NUMÉROTATION SÉQUENTIELLE UNIFIÉE
-- Factures d'acompte, Factures clients, Avoirs
-- ============================================

-- Créer une séquence pour la numérotation unique
CREATE SEQUENCE IF NOT EXISTS public.numero_document_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

COMMENT ON SEQUENCE public.numero_document_seq IS 'Séquence unique pour la numérotation séquentielle des factures d''acompte, factures clients et avoirs';

-- Fonction pour obtenir le prochain numéro de document
CREATE OR REPLACE FUNCTION public.get_next_document_number()
RETURNS INTEGER AS $$
DECLARE
    v_next_number INTEGER;
BEGIN
    SELECT nextval('public.numero_document_seq') INTO v_next_number;
    RETURN v_next_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_next_document_number() IS 'Retourne le prochain numéro séquentiel pour les documents (factures d''acompte, factures clients, avoirs)';

-- Fonction pour formater le numéro selon le type de document
CREATE OR REPLACE FUNCTION public.format_document_number(
    p_type VARCHAR,
    p_number INTEGER,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VARCHAR AS $$
DECLARE
    v_prefix VARCHAR;
    v_year VARCHAR;
    v_month VARCHAR;
    v_formatted_number VARCHAR;
BEGIN
    -- Déterminer le préfixe selon le type
    CASE p_type
        WHEN 'acompte' THEN v_prefix := 'AC';
        WHEN 'facture' THEN v_prefix := 'F';
        WHEN 'avoir' THEN v_prefix := 'AV';
        ELSE v_prefix := 'DOC';
    END CASE;
    
    -- Extraire l'année et le mois
    v_year := EXTRACT(YEAR FROM p_date)::VARCHAR;
    v_month := LPAD(EXTRACT(MONTH FROM p_date)::VARCHAR, 2, '0');
    
    -- Formater : PREFIXE-ANNEE-MOIS-NUMERO (ex: AC-2026-01-001, F-2026-01-002, AV-2026-01-003)
    v_formatted_number := v_prefix || '-' || v_year || '-' || v_month || '-' || LPAD(p_number::VARCHAR, 3, '0');
    
    RETURN v_formatted_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.format_document_number(VARCHAR, INTEGER, DATE) IS 'Formate un numéro de document selon son type (acompte, facture, avoir)';

-- Fonction helper pour obtenir le prochain numéro formaté
CREATE OR REPLACE FUNCTION public.get_next_formatted_document_number(
    p_type VARCHAR,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VARCHAR AS $$
DECLARE
    v_next_number INTEGER;
    v_formatted_number VARCHAR;
BEGIN
    -- Obtenir le prochain numéro séquentiel
    v_next_number := public.get_next_document_number();
    
    -- Formater le numéro
    v_formatted_number := public.format_document_number(p_type, v_next_number, p_date);
    
    RETURN v_formatted_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_next_formatted_document_number(VARCHAR, DATE) IS 'Retourne le prochain numéro de document formaté selon le type (acompte, facture, avoir)';

-- Optionnel : Fonction pour réinitialiser la séquence (utile pour les tests ou changement d'année)
CREATE OR REPLACE FUNCTION public.reset_document_number_sequence(p_start_value INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    PERFORM setval('public.numero_document_seq', p_start_value, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.reset_document_number_sequence(INTEGER) IS 'Réinitialise la séquence de numérotation (à utiliser avec précaution)';
