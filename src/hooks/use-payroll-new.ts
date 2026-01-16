import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface PayrollSettings {
  id: string;
  company_id: string;
  // General settings
  pay_frequency: string;
  default_payment_method: string;
  currency: string;
  // CNSS settings
  cnss_rate_employee: number;
  cnss_ceiling: number | null;
  cnss_active: boolean;
  // IRPP settings
  irpp_professional_rate: number;
  irpp_professional_cap: number;
  family_deduction: number;
  child_deduction: number;
  // CSS settings
  css_rate: number;
  css_exemption_threshold: number;
  // Overtime settings
  overtime_rate_1: number;
  overtime_rate_2: number;
  overtime_threshold: number;
  // Bonus settings
  bonus_taxable: boolean;
  bonus_subject_cnss: boolean;
  // Employee default settings
  default_contract_type: string | null;
  default_fiscal_status: string | null;
  default_children_count: number;
  default_head_family: boolean;
  default_cnss_active: boolean;
  // Payslip format settings
  payslip_language: string;
  show_stamp: boolean;
  show_signature: boolean;
  confidential_label: boolean;
  // Storage settings
  archive_path: string | null;
  retention_period: number;
  secure_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface IRPPBracket {
  id: string;
  company_id: string;
  min_amount: number;
  max_amount: number | null;
  rate: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  bonuses: number;
  overtime: number;
  family_situation: string | null;
  number_of_children: number;
  cnss: number;
  irpp: number;
  css: number;
  net_salary: number;
  pdf_file_path: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: {
    id: string;
    nom: string;
    prenom: string;
    code: string | null;
    poste: string | null;
    departement: string | null;
  };
}

export interface PayrollCalculationInput {
  grossSalary: number;
  bonuses: number;
  overtime: number;
  familySituation: string;
  numberOfChildren: number;
}

export interface PayrollCalculationResult {
  grossSalary: number;
  cnss: number;
  annualTaxBase: number;
  professionalDeduction: number;
  taxableIncome: number;
  annualIRPP: number;
  monthlyIRPP: number;
  css: number;
  netSalary: number;
}

export function usePayrollNew() {
  const { companyId, user } = useAuth();
  const [settings, setSettings] = useState<PayrollSettings | null>(null);
  const [brackets, setBrackets] = useState<IRPPBracket[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les paramètres
  const loadSettings = useCallback(async () => {
    if (!companyId) return;

    const { data, error } = await supabase
      .from('payroll_settings')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      // PGRST116 = no rows returned (normal si pas encore initialisé)
      // PGRST205 = table doesn't exist (migration pas encore appliquée)
      if (error.code === 'PGRST116') {
        // Pas de paramètres, on va les initialiser
      } else if (error.code === 'PGRST205') {
        console.warn('Table payroll_settings n\'existe pas encore. Veuillez exécuter apply_payroll_module.sql dans Supabase SQL Editor.');
        return;
      } else {
        console.error('Erreur chargement paramètres:', error);
        return;
      }
    }

    if (!data) {
      // Initialiser les paramètres par défaut
      const { error: initError } = await supabase.rpc('init_default_payroll_settings', {
        _company_id: companyId
      });
      if (initError) {
        console.error('Erreur initialisation paramètres:', initError);
        return;
      }
      // Recharger
      const { data: newData } = await supabase
        .from('payroll_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();
      setSettings(newData);
    } else {
      setSettings(data);
    }
  }, [companyId]);

  // Charger les tranches IRPP
  const loadBrackets = useCallback(async () => {
    if (!companyId) return;

    const { data, error } = await supabase
      .from('irpp_brackets')
      .select('*')
      .eq('company_id', companyId)
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table irpp_brackets n\'existe pas encore. Veuillez exécuter apply_payroll_module.sql dans Supabase SQL Editor.');
        return;
      }
      console.error('Erreur chargement tranches:', error);
      return;
    }

    setBrackets(data || []);
  }, [companyId]);

  // Charger les bulletins de paie
  const loadPayslips = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('payslips')
      .select(`
        *,
        employee:employes(id, nom, prenom, code, poste, departement)
      `)
      .eq('company_id', companyId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn('Table payslips n\'existe pas encore. Veuillez exécuter apply_payroll_module.sql dans Supabase SQL Editor.');
        setLoading(false);
        return;
      }
      console.error('Erreur chargement bulletins:', error);
      setLoading(false);
      return;
    }

    setPayslips(data || []);
    setLoading(false);
  }, [companyId]);

  // Calculer le salaire selon les règles tunisiennes
  const calculatePayroll = useCallback((
    input: PayrollCalculationInput,
    settings: PayrollSettings,
    brackets: IRPPBracket[]
  ): PayrollCalculationResult => {
    const { grossSalary, bonuses, overtime, familySituation, numberOfChildren } = input;
    
    // 1. Total brut = Salaire de base + Primes + Heures supplémentaires
    const totalGross = grossSalary + bonuses + overtime;
    
    // 2. CNSS = Total brut * cnss_rate_employee (si CNSS active)
    const cnss = settings.cnss_active 
      ? totalGross * (settings.cnss_rate_employee / 100)
      : 0;

    // 3. AnnualTaxBase = (GrossSalary - CNSS) * 12
    const monthlyTaxBase = totalGross - cnss;
    const annualTaxBase = monthlyTaxBase * 12;

    // 4. ProfessionalDeduction = min(AnnualTaxBase * irpp_professional_rate, irpp_professional_cap)
    const professionalDeduction = Math.min(
      annualTaxBase * (settings.irpp_professional_rate / 100),
      settings.irpp_professional_cap
    );

    // 4. FamilyDeductions
    let familyDeductions = 0;
    if (familySituation === 'married') {
      familyDeductions += settings.family_deduction;
    }
    familyDeductions += numberOfChildren * settings.child_deduction;

    // 5. TaxableIncome = AnnualTaxBase - ProfessionalDeduction - FamilyDeductions
    const taxableIncome = Math.max(0, annualTaxBase - professionalDeduction - familyDeductions);

    // 6. AnnualIRPP = Apply progressive IRPP brackets
    // Calcul progressif : chaque tranche s'applique uniquement sur la partie du revenu dans cette tranche
    let annualIRPP = 0;
    const sortedBrackets = [...brackets].sort((a, b) => a.order_index - b.order_index);
    
    // Si le revenu imposable est 0 ou négatif, pas d'IRPP
    if (taxableIncome <= 0) {
      annualIRPP = 0;
    } else {
      // Parcourir les tranches dans l'ordre croissant
      // Pour chaque tranche, on calcule l'impôt uniquement sur la partie du revenu qui se trouve dans cette tranche
      for (let i = 0; i < sortedBrackets.length; i++) {
        const bracket = sortedBrackets[i];
        const minAmount = bracket.min_amount;
        const maxAmount = bracket.max_amount ?? Infinity;
        const rate = bracket.rate / 100;
        
        // Si le revenu n'atteint pas le minimum de cette tranche, on passe à la suivante
        if (taxableIncome <= minAmount) {
          continue;
        }
        
        // Calculer le montant imposable dans cette tranche
        // Le montant imposable dans la tranche = min(revenu, max_tranche) - min_tranche
        const bracketTop = maxAmount === Infinity ? taxableIncome : Math.min(taxableIncome, maxAmount);
        const taxableInBracket = bracketTop - minAmount;
        
        // Calculer l'impôt sur cette tranche uniquement
        if (taxableInBracket > 0) {
          annualIRPP += taxableInBracket * rate;
        }
      }
    }

    // 7. MonthlyIRPP = AnnualIRPP / 12
    const monthlyIRPP = annualIRPP / 12;
    
    // Validation : l'IRPP mensuel ne peut pas dépasser la base imposable mensuelle
    // (c'est une sécurité pour éviter les erreurs de calcul)
    const maxMonthlyIRPP = monthlyTaxBase;
    const finalMonthlyIRPP = Math.min(monthlyIRPP, maxMonthlyIRPP);

    // 8. CSS = MonthlyIRPP * css_rate (si IRPP > seuil d'exemption)
    const css = finalMonthlyIRPP > (settings.css_exemption_threshold / 12)
      ? finalMonthlyIRPP * (settings.css_rate / 100)
      : 0;

    // 9. NetSalary = GrossSalary - CNSS - MonthlyIRPP - CSS
    const netSalary = totalGross - cnss - finalMonthlyIRPP - css;

    return {
      grossSalary: totalGross,
      cnss,
      annualTaxBase,
      professionalDeduction,
      taxableIncome,
      annualIRPP,
      monthlyIRPP: finalMonthlyIRPP,
      css,
      netSalary: Math.max(0, netSalary)
    };
  }, []);

  // Créer un bulletin de paie
  const createPayslip = useCallback(async (
    employeeId: string,
    month: number,
    year: number,
    input: PayrollCalculationInput,
    pdfFilePath?: string
  ): Promise<Payslip | null> => {
    if (!companyId || !settings || brackets.length === 0) {
      toast.error('Paramètres de paie non chargés');
      return null;
    }

    const calculation = calculatePayroll(input, settings, brackets);

    const { data, error } = await supabase
      .from('payslips')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        month,
        year,
        gross_salary: calculation.grossSalary,
        bonuses: input.bonuses,
        overtime: input.overtime,
        family_situation: input.familySituation,
        number_of_children: input.numberOfChildren,
        cnss: calculation.cnss,
        irpp: calculation.monthlyIRPP,
        css: calculation.css,
        net_salary: calculation.netSalary,
        pdf_file_path: pdfFilePath || null,
        created_by: user?.id || null
      })
      .select(`
        *,
        employee:employes(id, nom, prenom, code, poste, departement)
      `)
      .single();

    if (error) {
      console.error('Erreur création bulletin:', error);
      toast.error('Erreur lors de la création du bulletin de paie');
      return null;
    }

    toast.success('Bulletin de paie créé avec succès');
    await loadPayslips();
    return data;
  }, [companyId, settings, brackets, calculatePayroll, user, loadPayslips]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback(async (updates: Partial<PayrollSettings>): Promise<boolean> => {
    if (!companyId || !settings) return false;

    const { error } = await supabase
      .from('payroll_settings')
      .update(updates)
      .eq('id', settings.id);

    if (error) {
      console.error('Erreur mise à jour paramètres:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }

    toast.success('Paramètres mis à jour');
    await loadSettings();
    return true;
  }, [companyId, settings, loadSettings]);

  // Mettre à jour une tranche IRPP
  const updateBracket = useCallback(async (
    id: string,
    updates: Partial<IRPPBracket>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('irpp_brackets')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Erreur mise à jour tranche:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }

    toast.success('Tranche mise à jour');
    await loadBrackets();
    return true;
  }, [loadBrackets]);

  // Créer une nouvelle tranche
  const createBracket = useCallback(async (
    bracket: Omit<IRPPBracket, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (!companyId) return false;

    const { error } = await supabase
      .from('irpp_brackets')
      .insert({
        ...bracket,
        company_id: companyId
      });

    if (error) {
      console.error('Erreur création tranche:', error);
      toast.error('Erreur lors de la création');
      return false;
    }

    toast.success('Tranche créée');
    await loadBrackets();
    return true;
  }, [companyId, loadBrackets]);

  // Supprimer une tranche
  const deleteBracket = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('irpp_brackets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression tranche:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }

    toast.success('Tranche supprimée');
    await loadBrackets();
    return true;
  }, [loadBrackets]);

  // Supprimer un bulletin de paie
  const deletePayslip = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('payslips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression bulletin:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }

    toast.success('Bulletin de paie supprimé');
    await loadPayslips();
    return true;
  }, [loadPayslips]);

  // Charger les données au montage
  useEffect(() => {
    if (companyId) {
      loadSettings();
      loadBrackets();
      loadPayslips();
    }
  }, [companyId, loadSettings, loadBrackets, loadPayslips]);

  return {
    // Data
    settings,
    brackets,
    payslips,
    loading,

    // Actions
    loadSettings,
    loadBrackets,
    loadPayslips,
    calculatePayroll,
    createPayslip,
    updateSettings,
    updateBracket,
    createBracket,
    deleteBracket,
    deletePayslip
  };
}
