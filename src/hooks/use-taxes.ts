import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tax {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // Pourcentage (ex: 19) ou montant fixe
  enabled: boolean;
  isDefault?: boolean;
  description?: string | null;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export function useTaxes() {
  const { companyId } = useAuth();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les taxes depuis Supabase
  const fetchTaxes = useCallback(async () => {
    if (!companyId) {
      setTaxes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('taxes')
        .select('*')
        .eq('company_id', companyId)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Convertir is_default en isDefault pour la compatibilité
      const formattedData = (data || []).map(tax => ({
        ...tax,
        isDefault: tax.is_default || false,
      }));

      setTaxes(formattedData);

      // Si aucune taxe n'existe, créer la taxe par défaut (TVA)
      if (formattedData.length === 0) {
        await createDefaultTax();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des taxes');
      setError(error);
      console.error('Error fetching taxes:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Créer la taxe par défaut (TVA)
  const createDefaultTax = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error: insertError } = await supabase
        .from('taxes')
        .insert({
          company_id: companyId,
          name: 'TVA',
          type: 'percentage',
          value: 19.00,
          enabled: true,
          is_default: true,
          description: 'Taxe sur la valeur ajoutée par défaut',
        })
        .select()
        .single();

      if (insertError) {
        // Si la taxe existe déjà (conflit unique), on ignore
        if (insertError.code !== '23505') {
          throw insertError;
        }
        // Recharger les taxes
        await fetchTaxes();
        return;
      }

      if (data) {
        setTaxes(prev => [...prev, { ...data, isDefault: data.is_default || false }]);
      }
    } catch (err) {
      console.error('Error creating default tax:', err);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  // Ajouter une taxe
  const addTax = useCallback(async (tax: Omit<Tax, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast.error('Aucune entreprise sélectionnée');
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('taxes')
        .insert({
          company_id: companyId,
          name: tax.name,
          type: tax.type,
          value: tax.value,
          enabled: tax.enabled ?? true,
          is_default: tax.isDefault ?? false,
          description: tax.description || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting tax:', insertError);
        if (insertError.code === '23505') {
          toast.error('Une taxe avec ce nom existe déjà');
        } else if (insertError.code === '42501') {
          toast.error('Permission refusée. Vérifiez vos droits d\'accès.');
        } else {
          toast.error(`Erreur: ${insertError.message || 'Erreur lors de la création de la taxe'}`);
        }
        return;
      }

      if (data) {
        const newTax = { ...data, isDefault: data.is_default || false };
        setTaxes(prev => [...prev, newTax]);
        toast.success('Taxe créée avec succès');
        return newTax;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création de la taxe');
      console.error('Error creating tax:', err);
      toast.error('Erreur lors de la création de la taxe');
    }
  }, [companyId]);

  // Mettre à jour une taxe
  const updateTax = useCallback(async (id: string, updates: Partial<Tax>) => {
    if (!companyId) {
      toast.error('Aucune entreprise sélectionnée');
      return;
    }

    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { data, error: updateError } = await supabase
        .from('taxes')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === '23505') {
          toast.error('Une taxe avec ce nom existe déjà');
        } else {
          throw updateError;
        }
        return;
      }

      if (data) {
        const updatedTax = { ...data, isDefault: data.is_default || false };
        setTaxes(prev => prev.map(t => t.id === id ? updatedTax : t));
        toast.success('Taxe mise à jour avec succès');
      }
    } catch (err) {
      console.error('Error updating tax:', err);
      toast.error('Erreur lors de la mise à jour de la taxe');
    }
  }, [companyId]);

  // Supprimer une taxe
  const deleteTax = useCallback(async (id: string) => {
    if (!companyId) {
      toast.error('Aucune entreprise sélectionnée');
      return;
    }

    try {
      // Vérifier si c'est une taxe par défaut
      const tax = taxes.find(t => t.id === id);
      if (tax?.isDefault) {
        toast.error('Impossible de supprimer une taxe par défaut');
        return;
      }

      const { error: deleteError } = await supabase
        .from('taxes')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      setTaxes(prev => prev.filter(t => t.id !== id));
      toast.success('Taxe supprimée avec succès');
    } catch (err) {
      console.error('Error deleting tax:', err);
      toast.error('Erreur lors de la suppression de la taxe');
    }
  }, [companyId, taxes]);

  // Activer/Désactiver une taxe
  const toggleTax = useCallback(async (id: string) => {
    const tax = taxes.find(t => t.id === id);
    if (!tax) return;

    await updateTax(id, { enabled: !tax.enabled });
  }, [taxes, updateTax]);

  // Obtenir les taxes activées
  const getEnabledTaxes = useCallback(() => {
    return taxes.filter(t => t.enabled);
  }, [taxes]);

  // Calculer le montant d'une taxe
  const calculateTax = useCallback((amount: number, tax: Tax): number => {
    if (tax.type === 'percentage') {
      return (amount * tax.value) / 100;
    }
    return tax.value;
  }, []);

  return {
    taxes,
    enabledTaxes: getEnabledTaxes(),
    loading,
    error,
    addTax,
    updateTax,
    deleteTax,
    toggleTax,
    calculateTax,
    refresh: fetchTaxes,
  };
}
