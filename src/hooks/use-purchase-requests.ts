import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface DemandeAchat {
  id: string;
  numero: string;
  date_demande: string;
  demandeur_id: string | null;
  departement: string | null;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'brouillon' | 'en_attente' | 'approuvee' | 'rejetee' | 'convertie' | 'annulee';
  approbateur_id: string | null;
  date_approbation: string | null;
  notes: string | null;
  bon_commande_id: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  demandeur?: {
    id: string;
    full_name: string | null;
  };
  approbateur?: {
    id: string;
    full_name: string | null;
  };
  lignes?: DemandeAchatLigne[];
}

export interface DemandeAchatLigne {
  id: string;
  demande_achat_id: string;
  produit_id: string | null;
  description: string;
  quantite: number;
  prix_unitaire_estime: number | null;
  montant_estime: number | null;
  unite: string | null;
  notes: string | null;
  ordre: number;
  created_at: string;
  // Relations
  produit?: {
    id: string;
    nom: string;
    code: string | null;
  };
}

export interface CreateDemandeAchatData {
  numero: string;
  date_demande: string;
  demandeur_id?: string | null;
  departement?: string;
  priorite?: 'basse' | 'normale' | 'haute' | 'urgente';
  notes?: string;
}

export interface CreateDemandeAchatLigneData {
  produit_id?: string | null;
  description: string;
  quantite: number;
  prix_unitaire_estime?: number;
  montant_estime?: number;
  unite?: string;
  notes?: string;
  ordre?: number;
}

// ============================================
// HOOK
// ============================================

export function usePurchaseRequests() {
  const { companyId, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [demandes, setDemandes] = useState<DemandeAchat[]>([]);

  // ============================================
  // CHARGEMENT DES DEMANDES
  // ============================================

  const fetchDemandes = useCallback(async (filters?: {
    statut?: string;
    priorite?: string;
    departement?: string;
  }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('demandes_achat')
        .select(`
          *,
          demandeur:profiles!demandes_achat_demandeur_id_fkey(id, full_name),
          approbateur:profiles!demandes_achat_approbateur_id_fkey(id, full_name)
        `)
        .eq('company_id', companyId);

      if (filters?.statut) {
        query = query.eq('statut', filters.statut);
      }
      if (filters?.priorite) {
        query = query.eq('priorite', filters.priorite);
      }
      if (filters?.departement) {
        query = query.eq('departement', filters.departement);
      }

      query = query.order('date_demande', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Charger les lignes pour chaque demande
      const demandesAvecLignes = await Promise.all(
        (data || []).map(async (demande) => {
          const { data: lignes } = await supabase
            .from('demande_achat_lignes')
            .select(`
              *,
              produit:produits(id, nom, code)
            `)
            .eq('demande_achat_id', demande.id)
            .order('ordre');

          return { ...demande, lignes: lignes || [] };
        })
      );

      setDemandes(demandesAvecLignes as DemandeAchat[]);
    } catch (error: any) {
      console.error('Error fetching demandes:', error);
      toast.error('Erreur lors du chargement des demandes d\'achat');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ============================================
  // CRÉATION
  // ============================================

  const createDemande = useCallback(async (
    demandeData: CreateDemandeAchatData,
    lignes: CreateDemandeAchatLigneData[]
  ) => {
    if (!companyId || !user?.id) return;

    try {
      // Créer la demande
      const { data: demande, error: demandeError } = await supabase
        .from('demandes_achat')
        .insert({
          ...demandeData,
          company_id: companyId,
          created_by: user.id,
          demandeur_id: demandeData.demandeur_id || user.id,
          statut: 'brouillon',
        })
        .select()
        .single();

      if (demandeError) throw demandeError;

      // Créer les lignes
      if (lignes.length > 0) {
        const lignesToInsert = lignes.map((ligne, index) => ({
          demande_achat_id: demande.id,
          produit_id: ligne.produit_id,
          description: ligne.description,
          quantite: ligne.quantite,
          prix_unitaire_estime: ligne.prix_unitaire_estime || null,
          montant_estime: ligne.montant_estime || (ligne.prix_unitaire_estime ? ligne.prix_unitaire_estime * ligne.quantite : null),
          unite: ligne.unite || null,
          notes: ligne.notes || null,
          ordre: ligne.ordre || index,
        }));

        const { error: lignesError } = await supabase
          .from('demande_achat_lignes')
          .insert(lignesToInsert);

        if (lignesError) throw lignesError;
      }

      await fetchDemandes();
      toast.success('Demande d\'achat créée avec succès');
      return demande;
    } catch (error: any) {
      console.error('Error creating demande:', error);
      toast.error(error.message || 'Erreur lors de la création de la demande d\'achat');
      throw error;
    }
  }, [companyId, user?.id, fetchDemandes]);

  // ============================================
  // MISE À JOUR
  // ============================================

  const updateDemande = useCallback(async (id: string, updates: Partial<DemandeAchat>) => {
    try {
      const { error } = await supabase
        .from('demandes_achat')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchDemandes();
      toast.success('Demande d\'achat modifiée avec succès');
    } catch (error: any) {
      console.error('Error updating demande:', error);
      toast.error(error.message || 'Erreur lors de la modification de la demande d\'achat');
      throw error;
    }
  }, [fetchDemandes]);

  // ============================================
  // APPROBATION
  // ============================================

  const approveDemande = useCallback(async (id: string, approbateurId: string) => {
    try {
      const { error } = await supabase
        .from('demandes_achat')
        .update({
          statut: 'approuvee',
          approbateur_id: approbateurId,
          date_approbation: new Date().toISOString().split('T')[0],
        })
        .eq('id', id);

      if (error) throw error;
      await fetchDemandes();
      toast.success('Demande d\'achat approuvée');
    } catch (error: any) {
      console.error('Error approving demande:', error);
      toast.error(error.message || 'Erreur lors de l\'approbation de la demande');
      throw error;
    }
  }, [fetchDemandes]);

  const rejectDemande = useCallback(async (id: string, approbateurId: string, reason?: string) => {
    try {
      const updates: any = {
        statut: 'rejetee',
        approbateur_id: approbateurId,
        date_approbation: new Date().toISOString().split('T')[0],
      };
      
      // Ajouter la raison du rejet dans les notes si fournie
      if (reason) {
        const { data: demande } = await supabase
          .from('demandes_achat')
          .select('notes')
          .eq('id', id)
          .single();
        
        const notesExistantes = demande?.notes || '';
        updates.notes = notesExistantes 
          ? `${notesExistantes}\n\n[REJET] ${reason}` 
          : `[REJET] ${reason}`;
      }

      const { error } = await supabase
        .from('demandes_achat')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchDemandes();
      toast.success('Demande d\'achat rejetée');
    } catch (error: any) {
      console.error('Error rejecting demande:', error);
      toast.error(error.message || 'Erreur lors du rejet de la demande');
      throw error;
    }
  }, [fetchDemandes]);

  // ============================================
  // SUPPRESSION
  // ============================================

  const deleteDemande = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('demandes_achat')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchDemandes();
      toast.success('Demande d\'achat supprimée avec succès');
    } catch (error: any) {
      console.error('Error deleting demande:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la demande d\'achat');
      throw error;
    }
  }, [fetchDemandes]);

  // ============================================
  // INITIALISATION
  // ============================================

  useEffect(() => {
    if (companyId) {
      fetchDemandes();
    }
  }, [companyId, fetchDemandes]);

  return {
    // State
    loading,
    demandes,

    // Actions
    fetchDemandes,
    createDemande,
    updateDemande,
    approveDemande,
    rejectDemande,
    deleteDemande,
  };
}
