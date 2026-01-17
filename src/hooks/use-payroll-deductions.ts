import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PayrollDeduction {
  id: string;
  company_id: string;
  employe_id: string;
  date_deduction: string;
  amount: number;
  type: 'disciplinary' | 'loan' | 'other';
  description: string;
  status: 'pending' | 'applied' | 'cancelled';
  payslip_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function usePayrollDeductions() {
  const { companyId } = useAuth();
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeductions = useCallback(async () => {
    if (!companyId) {
      setDeductions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payroll_deductions')
        .select('*')
        .eq('company_id', companyId)
        .order('date_deduction', { ascending: false });

      if (error) throw error;
      setDeductions(data || []);
    } catch (error: any) {
      console.error('Error loading deductions:', error);
      toast.error('Erreur lors du chargement des retenues');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadDeductions();
  }, [loadDeductions]);

  const createDeduction = useCallback(async (deductionData: Omit<PayrollDeduction, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast.error('Entreprise non sélectionnée');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('payroll_deductions')
        .insert({
          ...deductionData,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Retenue créée avec succès');
      await loadDeductions();
      return data;
    } catch (error: any) {
      console.error('Error creating deduction:', error);
      toast.error(error.message || 'Erreur lors de la création de la retenue');
      return null;
    }
  }, [companyId, loadDeductions]);

  const updateDeduction = useCallback(async (id: string, updates: Partial<PayrollDeduction>) => {
    try {
      const { data, error } = await supabase
        .from('payroll_deductions')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Retenue mise à jour avec succès');
      await loadDeductions();
      return data;
    } catch (error: any) {
      console.error('Error updating deduction:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la retenue');
      return null;
    }
  }, [companyId, loadDeductions]);

  const deleteDeduction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_deductions')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Retenue supprimée avec succès');
      await loadDeductions();
    } catch (error: any) {
      console.error('Error deleting deduction:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la retenue');
    }
  }, [companyId, loadDeductions]);

  return {
    deductions,
    loading,
    createDeduction,
    updateDeduction,
    deleteDeduction,
    refreshDeductions: loadDeductions,
  };
}
