import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Type pour un encaissement
export interface Encaissement {
  id: string;
  client_id: string;
  date: string;
  montant: number;
  mode_paiement: string;
  reference: string | null;
  type_encaissement: 'standard' | 'acompte';
  allocated_amount: number;
  remaining_amount: number;
  status: 'disponible' | 'partiellement alloué' | 'totalement alloué';
  notes: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  client?: {
    id: string;
    nom: string;
    code: string | null;
  };
}

// Type pour créer un encaissement
export interface CreateEncaissementData {
  client_id: string;
  date: string;
  montant: number;
  mode_paiement: string;
  reference?: string | null;
  type_encaissement: 'standard' | 'acompte';
  notes?: string | null;
}

// Type pour l'allocation d'un encaissement à une facture
export interface AllocationEncaissement {
  encaissement_id: string;
  montant_alloue: number;
}

// Type pour la liaison facture-encaissement
export interface FactureEncaissement {
  id: string;
  facture_id: string;
  encaissement_id: string;
  montant_alloue: number;
  created_at: string;
}

export function useEncaissements() {
  const { companyId } = useAuth();
  const [encaissements, setEncaissements] = useState<Encaissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les encaissements depuis Supabase
  const fetchEncaissements = useCallback(async () => {
    if (!companyId) {
      setEncaissements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('encaissements' as any)
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setEncaissements((data || []) as unknown as Encaissement[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des encaissements');
      setError(error);
      toast.error('Erreur lors du chargement des encaissements');
      console.error('Error fetching encaissements:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchEncaissements();
  }, [fetchEncaissements]);

  // Créer un encaissement
  const createEncaissement = useCallback(async (encaissementData: CreateEncaissementData) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Pour un acompte, initialiser allocated_amount et remaining_amount
      const isAcompte = encaissementData.type_encaissement === 'acompte';
      const allocated_amount = isAcompte ? 0 : encaissementData.montant;
      const remaining_amount = isAcompte ? encaissementData.montant : 0;
      const status = isAcompte ? 'disponible' : 'totalement alloué';

      const { data, error: insertError } = await supabase
        .from('encaissements' as any)
        .insert({
          ...encaissementData,
          company_id: companyId,
          allocated_amount,
          remaining_amount,
          status,
        } as any)
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Encaissement créé avec succès');
      await fetchEncaissements();
      return data as unknown as Encaissement;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création de l\'encaissement');
      toast.error(error.message);
      console.error('Error creating encaissement:', err);
      throw error;
    }
  }, [companyId, fetchEncaissements]);

  // Mettre à jour un encaissement
  const updateEncaissement = useCallback(async (
    id: string,
    updates: Partial<Omit<Encaissement, 'id' | 'created_at' | 'company_id' | 'allocated_amount' | 'remaining_amount' | 'status'>>
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from('encaissements' as any)
        .update(updates as any)
        .eq('id', id)
        .eq('company_id', companyId)
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Encaissement mis à jour avec succès');
      await fetchEncaissements();
      return data as unknown as Encaissement;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour de l\'encaissement');
      toast.error(error.message);
      console.error('Error updating encaissement:', err);
      throw error;
    }
  }, [companyId, fetchEncaissements]);

  // Supprimer un encaissement
  const deleteEncaissement = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('encaissements' as any)
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Encaissement supprimé avec succès');
      await fetchEncaissements();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de l\'encaissement');
      toast.error(error.message);
      console.error('Error deleting encaissement:', err);
      throw error;
    }
  }, [companyId, fetchEncaissements]);

  // Obtenir les acomptes disponibles pour un client
  const getAcomptesDisponibles = useCallback(async (clientId: string): Promise<Encaissement[]> => {
    try {
      console.log('🔍 Recherche encaissements pour client:', clientId, 'company:', companyId);
      
      const { data: encaissementsData, error: fetchError } = await supabase
        .from('encaissements' as any)
        .select(`
          *,
          client:clients(id, nom, code)
        `)
        .eq('company_id', companyId)
        .eq('client_id', clientId)
        .eq('type_encaissement', 'acompte')
        .gt('remaining_amount', 0)
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching encaissements:', fetchError);
        throw fetchError;
      }

      console.log('💰 Encaissements trouvés:', encaissementsData?.length || 0, encaissementsData);
      return (encaissementsData || []) as unknown as Encaissement[];
    } catch (err) {
      console.error('❌ Error fetching acomptes disponibles:', err);
      return [];
    }
  }, [companyId]);

  // Allouer des encaissements à une facture
  const allocateEncaissementsToFacture = useCallback(async (
    factureId: string,
    allocations: AllocationEncaissement[]
  ) => {
    try {
      // Vérifier que les montants alloués ne dépassent pas les montants disponibles
      for (const allocation of allocations) {
        const encaissement = encaissements.find(e => e.id === allocation.encaissement_id);
        if (!encaissement) {
          throw new Error(`Encaissement ${allocation.encaissement_id} introuvable`);
        }
        if (allocation.montant_alloue > encaissement.remaining_amount) {
          throw new Error(`Montant alloué (${allocation.montant_alloue}) supérieur au montant disponible (${encaissement.remaining_amount})`);
        }
      }

      // Créer les liaisons facture-encaissement
      const factureEncaissements = allocations.map(allocation => ({
        facture_id: factureId,
        encaissement_id: allocation.encaissement_id,
        montant_alloue: allocation.montant_alloue,
      }));

      const { error: insertError } = await supabase
        .from('facture_encaissements' as any)
        .insert(factureEncaissements as any);

      if (insertError) {
        throw insertError;
      }

      // Mettre à jour le montant_paye de la facture
      const totalAlloue = allocations.reduce((sum, a) => sum + a.montant_alloue, 0);
      const { data: facture } = await supabase
        .from('factures_ventes')
        .select('montant_ttc, montant_paye')
        .eq('id', factureId)
        .single();

      if (facture) {
        const nouveauMontantPaye = (facture.montant_paye || 0) + totalAlloue;
        const nouveauMontantRestant = facture.montant_ttc - nouveauMontantPaye;

        await supabase
          .from('factures_ventes')
          .update({
            montant_paye: nouveauMontantPaye,
            montant_restant: nouveauMontantRestant,
            statut: nouveauMontantRestant <= 0 ? 'payee' : 'validee',
          })
          .eq('id', factureId);
      }

      toast.success('Acomptes alloués avec succès');
      await fetchEncaissements();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'allocation des acomptes');
      toast.error(error.message);
      console.error('Error allocating encaissements:', err);
      throw error;
    }
  }, [encaissements, fetchEncaissements]);

  // Obtenir les encaissements alloués à une facture
  const getEncaissementsByFacture = useCallback(async (factureId: string): Promise<FactureEncaissement[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('facture_encaissements' as any)
        .select('*')
        .eq('facture_id', factureId);

      if (fetchError) {
        throw fetchError;
      }

      return (data || []) as unknown as FactureEncaissement[];
    } catch (err) {
      console.error('Error fetching encaissements by facture:', err);
      return [];
    }
  }, []);

  // Obtenir un encaissement par ID
  const getEncaissementById = useCallback((id: string): Encaissement | undefined => {
    return encaissements.find(e => e.id === id);
  }, [encaissements]);

  // Filtrer par type
  const getEncaissementsByType = useCallback((type: 'standard' | 'acompte'): Encaissement[] => {
    return encaissements.filter(e => e.type_encaissement === type);
  }, [encaissements]);

  // Filtrer par client
  const getEncaissementsByClient = useCallback((clientId: string): Encaissement[] => {
    return encaissements.filter(e => e.client_id === clientId);
  }, [encaissements]);

  // Filtrer par statut
  const getEncaissementsByStatus = useCallback((status: Encaissement['status']): Encaissement[] => {
    return encaissements.filter(e => e.status === status);
  }, [encaissements]);

  return {
    encaissements,
    loading,
    error,
    createEncaissement,
    updateEncaissement,
    deleteEncaissement,
    getAcomptesDisponibles,
    allocateEncaissementsToFacture,
    getEncaissementsByFacture,
    getEncaissementById,
    getEncaissementsByType,
    getEncaissementsByClient,
    getEncaissementsByStatus,
    refreshEncaissements: fetchEncaissements,
  };
}
