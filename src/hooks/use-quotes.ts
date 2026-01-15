import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getNextDocumentNumber } from './use-document-numbering';

// Type pour un devis
export interface Quote {
  id: string;
  number: string;
  client_id: string;
  date: string;
  expires_at: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// Type pour une ligne de devis
export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
  created_at: string;
}

// Type pour créer un devis
export interface CreateQuoteData {
  number?: string;
  client_id: string;
  date: string;
  expires_at?: string | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string | null;
  items?: CreateQuoteItemData[];
}

// Type pour créer une ligne de devis
export interface CreateQuoteItemData {
  product_id?: string | null;
  service_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  total: number;
}

export function useQuotes() {
  const { companyId } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les devis depuis Supabase
  const fetchQuotes = useCallback(async () => {
    if (!companyId) {
      setQuotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setQuotes((data || []) as Quote[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des devis');
      setError(error);
      toast.error('Erreur lors du chargement des devis');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Créer un devis
  const createQuote = useCallback(async (quoteData: CreateQuoteData) => {
    if (!companyId) {
      toast.error('Aucune entreprise sélectionnée');
      return;
    }

    try {
      // Générer le numéro si non fourni
      let number = quoteData.number;
      if (!number) {
        number = await getNextDocumentNumber('devis', quoteData.date);
      }

      // Créer le devis
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          number,
          client_id: quoteData.client_id,
          date: quoteData.date,
          expires_at: quoteData.expires_at || null,
          subtotal: quoteData.subtotal || 0,
          tax: quoteData.tax || 0,
          total: quoteData.total || 0,
          status: quoteData.status || 'draft',
          notes: quoteData.notes || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      // Créer les lignes si fournies
      if (quoteData.items && quoteData.items.length > 0) {
        const items = quoteData.items.map((item, index) => ({
          quote_id: quote.id,
          product_id: item.product_id || null,
          service_id: item.service_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate || 0,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(items);

        if (itemsError) {
          throw itemsError;
        }
      }

      await fetchQuotes();
      toast.success('Devis créé avec succès');
      return quote;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création du devis');
      toast.error(error.message);
      console.error('Error creating quote:', err);
      throw error;
    }
  }, [companyId, fetchQuotes]);

  // Mettre à jour un devis
  const updateQuote = useCallback(async (quoteId: string, quoteData: Partial<CreateQuoteData>) => {
    try {
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          ...quoteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (updateError) {
        throw updateError;
      }

      await fetchQuotes();
      toast.success('Devis mis à jour avec succès');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour du devis');
      toast.error(error.message);
      console.error('Error updating quote:', err);
      throw error;
    }
  }, [fetchQuotes]);

  // Supprimer un devis
  const deleteQuote = useCallback(async (quoteId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (deleteError) {
        throw deleteError;
      }

      await fetchQuotes();
      toast.success('Devis supprimé avec succès');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression du devis');
      toast.error(error.message);
      console.error('Error deleting quote:', err);
      throw error;
    }
  }, [fetchQuotes]);

  // Obtenir les lignes d'un devis
  const getQuoteItems = useCallback(async (quoteId: string): Promise<QuoteItem[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return (data || []) as QuoteItem[];
    } catch (err) {
      console.error('Error fetching quote items:', err);
      return [];
    }
  }, []);

  // Obtenir un devis par ID
  const getQuoteById = useCallback((quoteId: string): Quote | undefined => {
    return quotes.find(q => q.id === quoteId);
  }, [quotes]);

  // Filtrer par statut
  const getQuotesByStatus = useCallback((status: Quote['status']): Quote[] => {
    return quotes.filter(q => q.status === status);
  }, [quotes]);

  // Filtrer par client
  const getQuotesByClient = useCallback((clientId: string): Quote[] => {
    return quotes.filter(q => q.client_id === clientId);
  }, [quotes]);

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuoteItems,
    getQuoteById,
    getQuotesByStatus,
    getQuotesByClient,
    refreshQuotes: fetchQuotes,
  };
}
