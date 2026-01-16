import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/use-currency';
import { toast } from 'sonner';

// Note: Ce hook est un placeholder en attendant la création des tables de finance
// Les tables accounts, transactions, previsions doivent être créées via une migration Supabase

export interface FinanceAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'savings';
  balance: number;
  account_number: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string | null;
  date: string;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  company_id: string;
  created_at: string;
  account?: FinanceAccount;
}

export interface Prevision {
  id: string;
  account_id: string | null;
  type: 'entree' | 'sortie';
  date_prevue: string;
  montant: number;
  description: string;
  source_module: 'ventes' | 'achats' | 'paie' | 'manuel' | null;
  source_id: string | null;
  source_reference: string | null;
  statut: 'prevue' | 'realisee' | 'annulee';
  transaction_id: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  account?: FinanceAccount;
  transaction?: FinanceTransaction;
}

export interface CreateAccountData {
  name: string;
  type: 'bank' | 'cash' | 'savings';
  account_number?: string;
  bank_name?: string;
  iban?: string;
  bic?: string;
  balance?: number;
}

export interface CreateTransactionData {
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  date: string;
  description?: string;
  reference_type?: string;
  reference_id?: string;
}

export interface CreatePrevisionData {
  account_id?: string;
  type: 'entree' | 'sortie';
  date_prevue: string;
  montant: number;
  description: string;
  source_module?: 'ventes' | 'achats' | 'paie' | 'manuel';
  source_id?: string;
  source_reference?: string;
}

export function useFinance() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const [loading] = useState(false);
  const [accounts] = useState<FinanceAccount[]>([]);
  const [transactions] = useState<FinanceTransaction[]>([]);
  const [previsions] = useState<Prevision[]>([]);

  // Placeholder functions
  const fetchAccounts = useCallback(async () => {
    console.log('Finance: Tables not yet created');
  }, []);

  const createAccount = useCallback(async (_accountData: CreateAccountData) => {
    toast.error('Module finance non configuré');
    return null;
  }, []);

  const updateAccount = useCallback(async (_id: string, _updates: Partial<FinanceAccount>) => {
    toast.error('Module finance non configuré');
  }, []);

  const deleteAccount = useCallback(async (_id: string) => {
    toast.error('Module finance non configuré');
  }, []);

  const fetchTransactions = useCallback(async (_filters?: {
    account_id?: string;
    type?: 'income' | 'expense' | 'transfer';
    date_debut?: string;
    date_fin?: string;
  }) => {
    console.log('Finance: Tables not yet created');
  }, []);

  const createTransaction = useCallback(async (_transactionData: CreateTransactionData) => {
    toast.error('Module finance non configuré');
    return null;
  }, []);

  const deleteTransaction = useCallback(async (_id: string) => {
    toast.error('Module finance non configuré');
  }, []);

  const fetchPrevisions = useCallback(async (_filters?: {
    type?: 'entree' | 'sortie';
    date_debut?: string;
    date_fin?: string;
    statut?: 'prevue' | 'realisee' | 'annulee';
  }) => {
    console.log('Finance: Tables not yet created');
  }, []);

  const createPrevision = useCallback(async (_previsionData: CreatePrevisionData) => {
    toast.error('Module finance non configuré');
    return null;
  }, []);

  const updatePrevision = useCallback(async (_id: string, _updates: Partial<Prevision>) => {
    toast.error('Module finance non configuré');
  }, []);

  const deletePrevision = useCallback(async (_id: string) => {
    toast.error('Module finance non configuré');
  }, []);

  const calculateCashFlow = useCallback((_dateDebut: string, _dateFin: string) => {
    return {
      soldeInitial: 0,
      entrees: 0,
      sorties: 0,
      fluxNet: 0,
      soldeFinal: 0,
    };
  }, []);

  return {
    loading,
    accounts,
    transactions,
    previsions,

    // Comptes
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,

    // Mouvements
    fetchTransactions,
    createTransaction,
    deleteTransaction,

    // Prévisions
    fetchPrevisions,
    createPrevision,
    updatePrevision,
    deletePrevision,

    // Utils
    calculateCashFlow,
    formatCurrency,
  };
}
