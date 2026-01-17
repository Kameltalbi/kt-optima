import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AllocationEncaissement } from './use-encaissements';
import { getNextDocumentNumber } from './use-document-numbering';

// Type pour une facture de vente
export interface FactureVente {
  id: string;
  numero: string;
  date_facture: string;
  date_echeance: string | null;
  client_id: string;
  type_facture?: 'standard' | 'acompte';
  statut: 'brouillon' | 'validee' | 'annulee' | 'payee';
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_paye: number;
  montant_restant: number;
  remise_type?: 'percentage' | 'amount' | null;
  remise_valeur?: number;
  remise_montant?: number;
  conditions_paiement: string | null;
  notes: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour une ligne de facture
export interface FactureVenteLigne {
  id: string;
  facture_vente_id: string;
  produit_id: string | null;
  description: string | null;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  ordre: number;
  created_at: string;
}

// Type pour créer une facture (sans lignes)
export interface CreateFactureVenteData {
  numero: string;
  date_facture: string;
  date_echeance?: string | null;
  client_id: string;
  type_facture?: 'standard' | 'acompte';
  statut?: 'brouillon' | 'validee' | 'annulee' | 'payee';
  montant_ht?: number;
  montant_tva?: number;
  montant_ttc?: number;
  montant_paye?: number;
  montant_restant?: number;
  remise_type?: 'percentage' | 'amount' | null;
  remise_valeur?: number;
  remise_montant?: number;
  conditions_paiement?: string | null;
  notes?: string | null;
}

// Type pour créer une ligne
export interface CreateFactureVenteLigneData {
  produit_id?: string | null;
  description?: string | null;
  quantite: number;
  prix_unitaire: number;
  taux_tva?: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  ordre?: number;
}

export function useFacturesVentes() {
  const { companyId } = useAuth();
  const [factures, setFactures] = useState<FactureVente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les factures depuis Supabase
  const fetchFactures = useCallback(async () => {
    if (!companyId) {
      setFactures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('factures_ventes')
        .select('*')
        .eq('company_id', companyId)
        .order('date_facture', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFactures((data || []) as unknown as FactureVente[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des factures');
      setError(error);
      toast.error('Erreur lors du chargement des factures');
      console.error('Error fetching factures:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  // Créer une facture
  const createFacture = useCallback(async (
    factureData: CreateFactureVenteData,
    lignes: CreateFactureVenteLigneData[] = [],
    acomptesAlloues: AllocationEncaissement[] = []
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Générer le numéro automatiquement si non fourni
      let numero = factureData.numero;
      if (!numero || numero.trim() === '') {
        const type = factureData.type_facture === 'acompte' ? 'acompte' : 'facture';
        numero = await getNextDocumentNumber(type, factureData.date_facture);
      }

      // Calculer les montants si non fournis
      let montant_ht = factureData.montant_ht || 0;
      let montant_tva = factureData.montant_tva || 0;
      let montant_ttc = factureData.montant_ttc || 0;

      if (lignes.length > 0) {
        montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
        montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
        montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);
      }

      // Calculer le montant payé via les acomptes
      const montantAcomptes = acomptesAlloues.reduce((sum, acc) => sum + acc.montant_alloue, 0);
      const montant_paye = (factureData.montant_paye || 0) + montantAcomptes;
      const montant_restant = montant_ttc - montant_paye;

      const { data: facture, error: insertError } = await supabase
        .from('factures_ventes')
        .insert({
          ...factureData,
          numero,
          company_id: companyId,
          type_facture: factureData.type_facture || 'standard',
          montant_ht,
          montant_tva,
          montant_ttc,
          montant_paye,
          montant_restant,
          statut: montant_restant <= 0 ? 'payee' : (factureData.statut || 'brouillon'),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Créer les lignes si fournies
      if (lignes.length > 0 && facture) {
        const lignesToInsert = lignes.map((ligne, index) => ({
          ...ligne,
          facture_vente_id: facture.id,
          ordre: ligne.ordre || index,
        }));

        const { error: lignesError } = await supabase
          .from('facture_vente_lignes')
          .insert(lignesToInsert);

        if (lignesError) {
          throw lignesError;
        }
      }

      // Allouer les acomptes si fournis
      if (acomptesAlloues.length > 0 && facture) {
        const factureEncaissements = acomptesAlloues.map(allocation => ({
          facture_id: facture.id,
          encaissement_id: allocation.encaissement_id,
          montant_alloue: allocation.montant_alloue,
        }));

        const { error: allocationError } = await supabase
          .from('facture_encaissements' as any)
          .insert(factureEncaissements as any);

        if (allocationError) {
          throw allocationError;
        }
      }

      toast.success('Facture créée avec succès');
      await fetchFactures();
      return facture;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création de la facture');
      toast.error(error.message);
      console.error('Error creating facture:', err);
      throw error;
    }
  }, [companyId, fetchFactures]);

  // Mettre à jour une facture
  const updateFacture = useCallback(async (
    id: string,
    updates: Partial<Omit<FactureVente, 'id' | 'created_at' | 'company_id'>>
  ) => {
    try {
      const currentFacture = factures.find(f => f.id === id);
      if (!currentFacture) {
        throw new Error('Facture introuvable');
      }

      // Recalculer montant_restant si montant_ttc ou montant_paye changent
      if (updates.montant_ttc !== undefined || updates.montant_paye !== undefined) {
        const montant_ttc = updates.montant_ttc ?? currentFacture.montant_ttc;
        const montant_paye = updates.montant_paye ?? currentFacture.montant_paye;
        updates.montant_restant = montant_ttc - montant_paye;
        
        // Mettre à jour le statut si payé
        if (updates.montant_restant === 0 && montant_ttc > 0) {
          updates.statut = 'payee';
        } else if (updates.statut !== 'annulee' && updates.montant_restant !== undefined) {
          if (updates.statut === 'validee' || currentFacture.statut === 'validee') {
            updates.statut = 'validee';
          }
        }
      }

      // Vérifier si la facture passe à "payee" et si c'est une facture d'acompte
      const devientPayee = (updates.statut === 'payee' && currentFacture.statut !== 'payee') ||
                          (updates.montant_restant === 0 && currentFacture.montant_restant > 0);
      const estFactureAcompte = currentFacture.type_facture === 'acompte';

      const { data, error: updateError } = await supabase
        .from('factures_ventes')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Si la facture d'acompte devient payée, créer automatiquement un encaissement de type acompte
      if (devientPayee && estFactureAcompte && data) {
        try {
          const montantPaye = updates.montant_paye ?? currentFacture.montant_paye;
          
          // Vérifier qu'un encaissement n'existe pas déjà pour cette facture
          const { data: existingEncaissement } = await supabase
            .from('encaissements')
            .select('id')
            .eq('client_id', data.client_id)
            .eq('type_encaissement', 'acompte')
            .eq('montant', montantPaye)
            .eq('date', data.date_facture)
            .limit(1)
            .single();

          if (!existingEncaissement) {
            // Créer l'encaissement de type acompte
            const { error: encaissementError } = await supabase
              .from('encaissements')
              .insert({
                client_id: data.client_id,
                date: data.date_facture,
                montant: montantPaye,
                mode_paiement: 'virement', // Par défaut, peut être modifié plus tard
                reference: `Facture d'acompte ${data.numero}`,
                type_encaissement: 'acompte',
                allocated_amount: 0,
                remaining_amount: montantPaye,
                status: 'disponible',
                notes: `Encaissement automatique - Facture d'acompte ${data.numero}`,
                company_id: companyId,
              });

            if (encaissementError) {
              console.error('Error creating encaissement for facture acompte:', encaissementError);
              // Ne pas bloquer la mise à jour de la facture si l'encaissement échoue
            }
          }
        } catch (err) {
          console.error('Error creating encaissement for facture acompte:', err);
          // Ne pas bloquer la mise à jour de la facture
        }
      }

      toast.success('Facture mise à jour avec succès');
      await fetchFactures();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour de la facture');
      toast.error(error.message);
      console.error('Error updating facture:', err);
      throw error;
    }
  }, [companyId, factures, fetchFactures]);

  // Supprimer une facture
  const deleteFacture = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('factures_ventes')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Facture supprimée avec succès');
      await fetchFactures();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de la facture');
      toast.error(error.message);
      console.error('Error deleting facture:', err);
      throw error;
    }
  }, [companyId, fetchFactures]);

  // Obtenir les lignes d'une facture
  const getLignes = useCallback(async (factureId: string): Promise<FactureVenteLigne[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('facture_vente_lignes')
        .select('*')
        .eq('facture_vente_id', factureId)
        .order('ordre', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching lignes:', err);
      return [];
    }
  }, []);

  // Ajouter une ligne à une facture
  const addLigne = useCallback(async (
    factureId: string,
    ligneData: CreateFactureVenteLigneData
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from('facture_vente_lignes')
        .insert({
          ...ligneData,
          facture_vente_id: factureId,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Recalculer les totaux de la facture
      const lignes = await getLignes(factureId);
      const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
      const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
      const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

      await updateFacture(factureId, {
        montant_ht,
        montant_tva,
        montant_ttc,
        montant_restant: montant_ttc - (factures.find(f => f.id === factureId)?.montant_paye || 0),
      });

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'ajout de la ligne');
      toast.error(error.message);
      console.error('Error adding ligne:', err);
      throw error;
    }
  }, [getLignes, updateFacture, factures]);

  // Supprimer une ligne
  const deleteLigne = useCallback(async (ligneId: string, factureId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('facture_vente_lignes')
        .delete()
        .eq('id', ligneId);

      if (deleteError) {
        throw deleteError;
      }

      // Recalculer les totaux de la facture
      const lignes = await getLignes(factureId);
      const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
      const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
      const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

      await updateFacture(factureId, {
        montant_ht,
        montant_tva,
        montant_ttc,
        montant_restant: montant_ttc - (factures.find(f => f.id === factureId)?.montant_paye || 0),
      });

      toast.success('Ligne supprimée');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de la ligne');
      toast.error(error.message);
      console.error('Error deleting ligne:', err);
      throw error;
    }
  }, [getLignes, updateFacture, factures]);

  // Valider une facture (brouillon → validée)
  const validerFacture = useCallback(async (id: string) => {
    return updateFacture(id, { statut: 'validee' });
  }, [updateFacture]);

  // Annuler une facture
  const annulerFacture = useCallback(async (id: string) => {
    return updateFacture(id, { statut: 'annulee' });
  }, [updateFacture]);

  // Obtenir une facture par ID
  const getFactureById = useCallback((id: string): FactureVente | undefined => {
    return factures.find(f => f.id === id);
  }, [factures]);

  // Filtrer par statut
  const getFacturesByStatut = useCallback((statut: FactureVente['statut']): FactureVente[] => {
    return factures.filter(f => f.statut === statut);
  }, [factures]);

  // Filtrer par client
  const getFacturesByClient = useCallback((clientId: string): FactureVente[] => {
    return factures.filter(f => f.client_id === clientId);
  }, [factures]);

  // Rechercher des factures
  const searchFactures = useCallback((searchTerm: string): FactureVente[] => {
    const term = searchTerm.toLowerCase();
    return factures.filter(f =>
      f.numero.toLowerCase().includes(term) ||
      f.notes?.toLowerCase().includes(term)
    );
  }, [factures]);

  // Obtenir les factures d'acompte payées pour un client (disponibles pour déduction)
  const getFacturesAcomptePayees = useCallback(async (clientId: string): Promise<FactureVente[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('factures_ventes')
        .select('*')
        .eq('company_id', companyId)
        .eq('client_id', clientId)
        .eq('type_facture', 'acompte')
        .eq('statut', 'payee')
        .order('date_facture', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return (data || []) as FactureVente[];
    } catch (err) {
      console.error('Error fetching factures acompte payees:', err);
      return [];
    }
  }, [companyId]);

  return {
    factures,
    loading,
    error,
    createFacture,
    updateFacture,
    deleteFacture,
    getLignes,
    addLigne,
    deleteLigne,
    validerFacture,
    annulerFacture,
    getFactureById,
    getFacturesByStatut,
    getFacturesByClient,
    searchFactures,
    getFacturesAcomptePayees,
    refreshFactures: fetchFactures,
  };
}
