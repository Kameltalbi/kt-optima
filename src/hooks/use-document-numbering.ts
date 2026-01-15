import { supabase } from '@/integrations/supabase/client';

/**
 * Obtient le prochain numéro de document formaté selon le type
 * @param type - Type de document: 'acompte', 'facture', 'avoir', ou 'bon_livraison'
 * @param date - Date du document (optionnel, par défaut aujourd'hui)
 * @returns Le numéro formaté (ex: AC-2026-01-001, F-2026-01-002, AV-2026-01-003, BL-2026-01-001)
 */
export async function getNextDocumentNumber(
  type: 'acompte' | 'facture' | 'avoir' | 'bon_livraison',
  date?: string
): Promise<string> {
  try {
    const documentDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc('get_next_formatted_document_number' as any, {
      p_type: type,
      p_date: documentDate,
    });

    if (error) {
      throw error;
    }

    return data as string;
  } catch (err) {
    console.error('Error getting next document number:', err);
    // Fallback: générer un numéro basique si la fonction SQL échoue
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = type === 'acompte' ? 'AC' : type === 'avoir' ? 'AV' : type === 'bon_livraison' ? 'BL' : 'F';
    return `${prefix}-${year}-${month}-XXX`;
  }
}
