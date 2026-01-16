import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/use-currency';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

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
  // Relations
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
  // Relations
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

// ============================================
// HOOK
// ============================================

export function useFinance() {
  const { companyId, user, company } = useAuth();
  const { formatCurrency } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [previsions, setPrevisions] = useState<Prevision[]>([]);

  // ============================================
  // COMPTES
  // ============================================

  const fetchAccounts = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('type')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createAccount = useCallback(async (accountData: CreateAccountData) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...accountData,
          company_id: companyId,
          balance: accountData.balance || 0,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAccounts();
      toast.success('Compte créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
      throw error;
    }
  }, [companyId, fetchAccounts]);

  const updateAccount = useCallback(async (id: string, updates: Partial<FinanceAccount>) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchAccounts();
      toast.success('Compte modifié avec succès');
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.message || 'Erreur lors de la modification du compte');
      throw error;
    }
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      await fetchAccounts();
      toast.success('Compte supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Erreur lors de la suppression du compte');
      throw error;
    }
  }, [fetchAccounts]);

  // ============================================
  // MOUVEMENTS (TRANSACTIONS)
  // ============================================

  const fetchTransactions = useCallback(async (filters?: {
    account_id?: string;
    type?: 'income' | 'expense' | 'transfer';
    date_debut?: string;
    date_fin?: string;
  }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(*)
        `)
        .eq('company_id', companyId);

      if (filters?.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.date_debut) {
        query = query.gte('date', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date', filters.date_fin);
      }

      query = query.order('date', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createTransaction = useCallback(async (transactionData: CreateTransactionData) => {
    if (!companyId) return;

    try {
      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          company_id: companyId,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Mettre à jour le solde du compte
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transactionData.account_id)
        .single();

      if (account) {
        let newBalance = account.balance;
        if (transactionData.type === 'income') {
          newBalance += transactionData.amount;
        } else if (transactionData.type === 'expense') {
          newBalance -= transactionData.amount;
        } else if (transactionData.type === 'transfer') {
          // Pour les transferts, on gère les deux comptes
          // Ici on ne gère que le compte source, le compte destination sera géré séparément
          newBalance -= transactionData.amount;
        }

        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transactionData.account_id);
      }

      await fetchTransactions();
      await fetchAccounts(); // Rafraîchir les soldes
      toast.success('Mouvement enregistré avec succès');
      return transaction;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement du mouvement');
      throw error;
    }
  }, [companyId, fetchTransactions, fetchAccounts]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      // Récupérer la transaction pour inverser le solde
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (transaction) {
        // Inverser le solde du compte
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transaction.account_id)
          .single();

        if (account) {
          let newBalance = account.balance;
          if (transaction.type === 'income') {
            newBalance -= transaction.amount;
          } else if (transaction.type === 'expense') {
            newBalance += transaction.amount;
          } else if (transaction.type === 'transfer') {
            newBalance += transaction.amount;
          }

          await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', transaction.account_id);
        }
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTransactions();
      await fetchAccounts();
      toast.success('Mouvement supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Erreur lors de la suppression du mouvement');
      throw error;
    }
  }, [fetchTransactions, fetchAccounts]);

  // ============================================
  // PRÉVISIONS
  // ============================================

  const fetchPrevisions = useCallback(async (filters?: {
    type?: 'entree' | 'sortie';
    date_debut?: string;
    date_fin?: string;
    statut?: 'prevue' | 'realisee' | 'annulee';
  }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('previsions')
        .select(`
          *,
          account:accounts(*),
          transaction:transactions(*)
        `)
        .eq('company_id', companyId);

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.date_debut) {
        query = query.gte('date_prevue', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_prevue', filters.date_fin);
      }
      if (filters?.statut) {
        query = query.eq('statut', filters.statut);
      }

      query = query.order('date_prevue', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setPrevisions(data || []);
    } catch (error: any) {
      console.error('Error fetching previsions:', error);
      toast.error('Erreur lors du chargement des prévisions');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createPrevision = useCallback(async (previsionData: CreatePrevisionData) => {
    if (!companyId || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('previsions')
        .insert({
          ...previsionData,
          company_id: companyId,
          created_by: user.id,
          source_module: previsionData.source_module || 'manuel',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPrevisions();
      toast.success('Prévision créée avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating prevision:', error);
      toast.error(error.message || 'Erreur lors de la création de la prévision');
      throw error;
    }
  }, [companyId, user?.id, fetchPrevisions]);

  const updatePrevision = useCallback(async (id: string, updates: Partial<Prevision>) => {
    try {
      const { error } = await supabase
        .from('previsions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPrevisions();
      toast.success('Prévision modifiée avec succès');
    } catch (error: any) {
      console.error('Error updating prevision:', error);
      toast.error(error.message || 'Erreur lors de la modification de la prévision');
      throw error;
    }
  }, [fetchPrevisions]);

  const deletePrevision = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('previsions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPrevisions();
      toast.success('Prévision supprimée avec succès');
    } catch (error: any) {
      console.error('Error deleting prevision:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la prévision');
      throw error;
    }
  }, [fetchPrevisions]);

  // ============================================
  // FLUX DE TRÉSORERIE (CALCULS)
  // ============================================

  const calculateCashFlow = useCallback((dateDebut: string, dateFin: string) => {
    const previsionsFiltrees = previsions.filter(p => {
      const date = new Date(p.date_prevue);
      return date >= new Date(dateDebut) && date <= new Date(dateFin);
    });

    const entrees = previsionsFiltrees
      .filter(p => p.type === 'entree')
      .reduce((sum, p) => sum + (p.statut === 'prevue' ? p.montant : 0), 0);

    const sorties = previsionsFiltrees
      .filter(p => p.type === 'sortie')
      .reduce((sum, p) => sum + (p.statut === 'prevue' ? p.montant : 0), 0);

    const soldeInitial = accounts.reduce((sum, a) => sum + a.balance, 0);
    const fluxNet = entrees - sorties;
    const soldeFinal = soldeInitial + fluxNet;

    return {
      soldeInitial,
      entrees,
      sorties,
      fluxNet,
      soldeFinal,
    };
  }, [previsions, accounts]);

  // ============================================
  // INITIALISATION
  // ============================================

  useEffect(() => {
    if (companyId) {
      fetchAccounts();
      fetchTransactions();
      fetchPrevisions();
    }
  }, [companyId, fetchAccounts, fetchTransactions, fetchPrevisions]);

  return {
    // State
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

    // Calculs
    calculateCashFlow,

    // Utils
    formatCurrency,
  };
}
