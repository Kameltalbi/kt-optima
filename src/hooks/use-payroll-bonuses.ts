import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PayrollBonus {
  id: string;
  company_id: string;
  employe_id: string;
  date_bonus: string;
  amount: number;
  type: 'transport' | 'phone' | 'performance' | 'other';
  description?: string;
  taxable: boolean;
  subject_cnss: boolean;
  payslip_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function usePayrollBonuses() {
  const { companyId } = useAuth();
  const [bonuses, setBonuses] = useState<PayrollBonus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBonuses = useCallback(async () => {
    if (!companyId) {
      setBonuses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payroll_bonuses')
        .select('*')
        .eq('company_id', companyId)
        .order('date_bonus', { ascending: false });

      if (error) throw error;
      setBonuses(data || []);
    } catch (error: any) {
      console.error('Error loading bonuses:', error);
      toast.error('Erreur lors du chargement des primes');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadBonuses();
  }, [loadBonuses]);

  const createBonus = useCallback(async (bonusData: Omit<PayrollBonus, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast.error('Entreprise non sélectionnée');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('payroll_bonuses')
        .insert({
          ...bonusData,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Prime créée avec succès');
      await loadBonuses();
      return data;
    } catch (error: any) {
      console.error('Error creating bonus:', error);
      toast.error(error.message || 'Erreur lors de la création de la prime');
      return null;
    }
  }, [companyId, loadBonuses]);

  const updateBonus = useCallback(async (id: string, updates: Partial<PayrollBonus>) => {
    try {
      const { data, error } = await supabase
        .from('payroll_bonuses')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Prime mise à jour avec succès');
      await loadBonuses();
      return data;
    } catch (error: any) {
      console.error('Error updating bonus:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la prime');
      return null;
    }
  }, [companyId, loadBonuses]);

  const deleteBonus = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_bonuses')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Prime supprimée avec succès');
      await loadBonuses();
    } catch (error: any) {
      console.error('Error deleting bonus:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la prime');
    }
  }, [companyId, loadBonuses]);

  return {
    bonuses,
    loading,
    createBonus,
    updateBonus,
    deleteBonus,
    refreshBonuses: loadBonuses,
  };
}
