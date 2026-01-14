import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Type pour un client (correspond à la table clients)
export interface Client {
  id: string;
  code: string | null;
  nom: string;
  type: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  pays: string | null;
  numero_fiscal: string | null;
  numero_registre_commerce: string | null;
  site_web: string | null;
  notes: string | null;
  solde_initial: number | null;
  solde_actuel: number | null;
  actif: boolean | null;
  company_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export function useClients() {
  const { companyId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les clients depuis Supabase
  const fetchClients = useCallback(async () => {
    if (!companyId) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setClients(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des clients');
      setError(error);
      toast.error('Erreur lors du chargement des clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Créer un client
  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          company_id: companyId,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Client créé avec succès');
      await fetchClients(); // Recharger la liste
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création du client');
      toast.error(error.message);
      console.error('Error creating client:', err);
      throw error;
    }
  }, [companyId, fetchClients]);

  // Mettre à jour un client
  const updateClient = useCallback(async (id: string, updates: Partial<Omit<Client, 'id' | 'created_at' | 'company_id'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Client mis à jour avec succès');
      await fetchClients(); // Recharger la liste
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour du client');
      toast.error(error.message);
      console.error('Error updating client:', err);
      throw error;
    }
  }, [companyId, fetchClients]);

  // Supprimer un client
  const deleteClient = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Client supprimé avec succès');
      await fetchClients(); // Recharger la liste
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression du client');
      toast.error(error.message);
      console.error('Error deleting client:', err);
      throw error;
    }
  }, [companyId, fetchClients]);

  // Obtenir un client par ID
  const getClientById = useCallback((id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  }, [clients]);

  // Filtrer les clients par type
  const getClientsByType = useCallback((type: 'prospect' | 'client'): Client[] => {
    return clients.filter(c => c.type === type);
  }, [clients]);

  // Filtrer les clients actifs
  const getActiveClients = useCallback((): Client[] => {
    return clients.filter(c => c.actif);
  }, [clients]);

  // Rechercher des clients
  const searchClients = useCallback((searchTerm: string): Client[] => {
    const term = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.nom.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.telephone?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term)
    );
  }, [clients]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientsByType,
    getActiveClients,
    searchClients,
    refreshClients: fetchClients,
  };
}
