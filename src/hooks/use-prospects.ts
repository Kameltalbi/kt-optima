import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { CRMProspect } from '@/types/database';

// Helper function to map database fields to interface aliases
const mapProspectFromDB = (db: any): CRMProspect => ({
  ...db,
  firstName: db.first_name,
  lastName: db.last_name,
  companyName: db.company_name,
  convertedToCompanyId: db.converted_to_company_id,
  convertedAt: db.converted_at,
  salesRepId: db.sales_rep_id,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export function useProspects() {
  const { companyId } = useAuth();
  const [prospects, setProspects] = useState<CRMProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les prospects
  const fetchProspects = useCallback(async () => {
    if (!companyId) {
      setProspects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('crm_prospects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProspects((data || []).map(mapProspectFromDB));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des prospects');
      setError(error);
      toast.error('Erreur lors du chargement des prospects');
      console.error('Error fetching prospects:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  // Créer un prospect
  const createProspect = useCallback(async (prospectData: Omit<CRMProspect, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('crm_prospects')
        .insert({
          first_name: prospectData.first_name || prospectData.firstName || '',
          last_name: prospectData.last_name || prospectData.lastName || '',
          company_name: prospectData.company_name || prospectData.companyName || null,
          phone: prospectData.phone || null,
          email: prospectData.email || null,
          city: prospectData.city || null,
          sector: prospectData.sector || null,
          source: prospectData.source || null,
          status: prospectData.status || 'new',
          notes: prospectData.notes || null,
          sales_rep_id: prospectData.sales_rep_id || prospectData.salesRepId || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Prospect créé avec succès');
      await fetchProspects();
      return mapProspectFromDB(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création du prospect');
      toast.error(error.message);
      console.error('Error creating prospect:', err);
      throw error;
    }
  }, [companyId, fetchProspects]);

  // Mettre à jour un prospect
  const updateProspect = useCallback(async (id: string, updates: Partial<CRMProspect>) => {
    try {
      const updateData: any = {};
      if (updates.first_name !== undefined) updateData.first_name = updates.first_name;
      if (updates.last_name !== undefined) updateData.last_name = updates.last_name;
      if (updates.company_name !== undefined) updateData.company_name = updates.company_name || null;
      if (updates.phone !== undefined) updateData.phone = updates.phone || null;
      if (updates.email !== undefined) updateData.email = updates.email || null;
      if (updates.city !== undefined) updateData.city = updates.city || null;
      if (updates.sector !== undefined) updateData.sector = updates.sector || null;
      if (updates.source !== undefined) updateData.source = updates.source || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.sales_rep_id !== undefined) updateData.sales_rep_id = updates.sales_rep_id || null;

      // Handle aliases
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.companyName !== undefined) updateData.company_name = updates.companyName || null;
      if (updates.salesRepId !== undefined) updateData.sales_rep_id = updates.salesRepId || null;

      const { data, error: updateError } = await supabase
        .from('crm_prospects')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Prospect mis à jour avec succès');
      await fetchProspects();
      return mapProspectFromDB(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour du prospect');
      toast.error(error.message);
      console.error('Error updating prospect:', err);
      throw error;
    }
  }, [companyId, fetchProspects]);

  // Supprimer un prospect
  const deleteProspect = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('crm_prospects')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Prospect supprimé avec succès');
      await fetchProspects();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression du prospect');
      toast.error(error.message);
      console.error('Error deleting prospect:', err);
      throw error;
    }
  }, [companyId, fetchProspects]);

  // Convertir un prospect en société
  const convertToCompany = useCallback(async (prospectId: string, companyData: any) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Récupérer le prospect
      const prospect = prospects.find(p => p.id === prospectId);
      if (!prospect) {
        throw new Error('Prospect introuvable');
      }

      // Créer la société
      const { data: company, error: companyError } = await supabase
        .from('crm_companies')
        .insert({
          name: companyData.name || prospect.company_name || `${prospect.first_name} ${prospect.last_name}`,
          tax_number: companyData.tax_number || null,
          address: companyData.address || null,
          phone: prospect.phone || null,
          email: prospect.email || null,
          sector: prospect.sector || companyData.sector || null,
          website: companyData.website || null,
          sales_rep_id: prospect.sales_rep_id || companyData.sales_rep_id || null,
          status: 'prospect',
          notes: companyData.notes || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // Mettre à jour le prospect avec la référence à la société
      const { error: updateError } = await supabase
        .from('crm_prospects')
        .update({
          converted_to_company_id: company.id,
          converted_at: new Date().toISOString(),
          status: 'qualified',
        })
        .eq('id', prospectId)
        .eq('company_id', companyId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Prospect converti en société avec succès');
      await fetchProspects();
      return company;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la conversion du prospect');
      toast.error(error.message);
      console.error('Error converting prospect:', err);
      throw error;
    }
  }, [companyId, prospects, fetchProspects]);

  // Filtrer les prospects par statut
  const getProspectsByStatus = useCallback((status: CRMProspect['status']): CRMProspect[] => {
    return prospects.filter(p => p.status === status);
  }, [prospects]);

  // Filtrer les prospects par source
  const getProspectsBySource = useCallback((source: string): CRMProspect[] => {
    return prospects.filter(p => p.source === source);
  }, [prospects]);

  // Rechercher des prospects
  const searchProspects = useCallback((searchTerm: string): CRMProspect[] => {
    const term = searchTerm.toLowerCase();
    return prospects.filter(p =>
      p.first_name?.toLowerCase().includes(term) ||
      p.last_name?.toLowerCase().includes(term) ||
      p.company_name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  }, [prospects]);

  return {
    prospects,
    loading,
    error,
    createProspect,
    updateProspect,
    deleteProspect,
    convertToCompany,
    getProspectsByStatus,
    getProspectsBySource,
    searchProspects,
    refreshProspects: fetchProspects,
  };
}
