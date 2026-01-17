import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PayrollAdvance {
  id: string;
  company_id: string;
  employe_id: string;
  date_advance: string;
  amount: number;
  description?: string;
  status: 'pending' | 'reimbursed' | 'cancelled';
  reimbursement_date?: string;
  payslip_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function usePayrollAdvances() {
  const { companyId } = useAuth();
  const [advances, setAdvances] = useState<PayrollAdvance[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdvances = useCallback(async () => {
    if (!companyId) {
      setAdvances([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payroll_advances')
        .select('*')
        .eq('company_id', companyId)
        .order('date_advance', { ascending: false });

      if (error) throw error;
      setAdvances(data || []);
    } catch (error: any) {
      console.error('Error loading advances:', error);
      toast.error('Erreur lors du chargement des avances');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadAdvances();
  }, [loadAdvances]);

  const createAdvance = useCallback(async (advanceData: Omit<PayrollAdvance, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast.error('Entreprise non sélectionnée');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('payroll_advances')
        .insert({
          ...advanceData,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Avance créée avec succès');
      await loadAdvances();
      return data;
    } catch (error: any) {
      console.error('Error creating advance:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'avance');
      return null;
    }
  }, [companyId, loadAdvances]);

  const updateAdvance = useCallback(async (id: string, updates: Partial<PayrollAdvance>) => {
    try {
      const { data, error } = await supabase
        .from('payroll_advances')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Avance mise à jour avec succès');
      await loadAdvances();
      return data;
    } catch (error: any) {
      console.error('Error updating advance:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'avance');
      return null;
    }
  }, [companyId, loadAdvances]);

  const deleteAdvance = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_advances')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Avance supprimée avec succès');
      await loadAdvances();
    } catch (error: any) {
      console.error('Error deleting advance:', error);
      toast.error(error.message || 'Erreur lors de la suppression de l\'avance');
    }
  }, [companyId, loadAdvances]);

  return {
    advances,
    loading,
    createAdvance,
    updateAdvance,
    deleteAdvance,
    refreshAdvances: loadAdvances,
  };
}
