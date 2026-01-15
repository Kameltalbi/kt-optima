import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getNextDocumentNumber } from './use-document-numbering';

// Type pour un bon de livraison
export interface BonLivraison {
  id: string;
  numero: string;
  date_livraison: string;
  client_id: string;
  facture_vente_id: string | null;
  adresse_livraison: string | null;
  statut: 'brouillon' | 'valide' | 'livre' | 'annule';
  notes: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour une ligne de bon de livraison
export interface BonLivraisonLigne {
  id: string;
  bon_livraison_id: string;
  produit_id: string | null;
  description: string | null;
  quantite: number;
  unite: string;
  ordre: number;
  created_at: string;
}

// Type pour créer un bon de livraison (sans lignes)
export interface CreateBonLivraisonData {
  numero: string;
  date_livraison: string;
  client_id: string;
  facture_vente_id?: string | null;
  adresse_livraison?: string | null;
  statut?: 'brouillon' | 'valide' | 'livre' | 'annule';
  notes?: string | null;
}

// Type pour créer une ligne
export interface CreateBonLivraisonLigneData {
  produit_id?: string | null;
  description?: string | null;
  quantite: number;
  unite?: string;
  ordre?: number;
}

export function useDeliveryNotes() {
  const { companyId } = useAuth();
  const [bonsLivraison, setBonsLivraison] = useState<BonLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les bons de livraison depuis Supabase
  const fetchBonsLivraison = useCallback(async () => {
    if (!companyId) {
      setBonsLivraison([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bons_livraison')
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .eq('company_id', companyId)
        .order('date_livraison', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBonsLivraison((data || []) as unknown as BonLivraison[]);
    } catch (err) {
      const error = err instanceof Error ? new Error('Erreur lors du chargement des bons de livraison') : new Error('Erreur lors du chargement des bons de livraison');
      setError(error);
      toast.error('Erreur lors du chargement des bons de livraison');
      console.error('Error fetching bons livraison:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchBonsLivraison();
  }, [fetchBonsLivraison]);

  // Créer un bon de livraison
  const createBonLivraison = useCallback(async (
    bonLivraisonData: CreateBonLivraisonData,
    lignes: CreateBonLivraisonLigneData[] = []
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Générer le numéro automatiquement si non fourni
      let numero = bonLivraisonData.numero;
      if (!numero || numero.trim() === '') {
        numero = await getNextDocumentNumber('bon_livraison', bonLivraisonData.date_livraison);
      }

      const { data: bonLivraison, error: insertError } = await supabase
        .from('bons_livraison')
        .insert({
          ...bonLivraisonData,
          numero,
          company_id: companyId,
          statut: bonLivraisonData.statut || 'brouillon',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Créer les lignes si fournies
      if (lignes.length > 0 && bonLivraison) {
        const lignesToInsert = lignes.map((ligne, index) => ({
          ...ligne,
          bon_livraison_id: bonLivraison.id,
          ordre: ligne.ordre || index,
          unite: ligne.unite || 'unité',
        }));

        const { error: lignesError } = await supabase
          .from('bon_livraison_lignes')
          .insert(lignesToInsert);

        if (lignesError) {
          throw lignesError;
        }
      }

      await fetchBonsLivraison();
      toast.success('Bon de livraison créé avec succès');
      return bonLivraison;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création du bon de livraison');
      toast.error(error.message);
      console.error('Error creating bon livraison:', err);
      throw error;
    }
  }, [companyId, fetchBonsLivraison]);

  // Obtenir les lignes d'un bon de livraison
  const getLignes = useCallback(async (bonLivraisonId: string): Promise<BonLivraisonLigne[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bon_livraison_lignes')
        .select('*')
        .eq('bon_livraison_id', bonLivraisonId)
        .order('ordre', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return (data || []) as BonLivraisonLigne[];
    } catch (err) {
      console.error('Error fetching lignes:', err);
      return [];
    }
  }, []);

  return {
    bonsLivraison,
    loading,
    error,
    fetchBonsLivraison,
    createBonLivraison,
    getLignes,
    refreshBonsLivraison: fetchBonsLivraison,
  };
}
