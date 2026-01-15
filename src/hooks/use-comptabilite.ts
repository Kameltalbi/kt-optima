import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AppContext';
import { toast } from 'sonner';

export interface CompteComptable {
  id: string;
  company_id: string;
  code_compte: string;
  libelle: string;
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie';
  is_system: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Journal {
  id: string;
  company_id: string;
  code_journal: string;
  libelle: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciceComptable {
  id: string;
  company_id: string;
  annee: number;
  date_debut: string;
  date_fin: string;
  is_active: boolean;
  is_cloture: boolean;
  created_at: string;
  updated_at: string;
}

export interface EcritureComptable {
  id: string;
  company_id: string;
  exercice_id: string;
  journal_id: string;
  compte_id: string;
  date: string;
  debit: number;
  credit: number;
  libelle?: string;
  reference?: string;
  source_module: 'ventes' | 'paie' | 'tresorerie' | 'achats' | 'stock';
  source_id: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EcritureLigne {
  compte_id: string;
  debit: number;
  credit: number;
  libelle?: string;
}

export function useComptabilite() {
  const { company, user, companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comptes, setComptes] = useState<CompteComptable[]>([]);
  const [journaux, setJournaux] = useState<Journal[]>([]);
  const [exercices, setExercices] = useState<ExerciceComptable[]>([]);
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);

  // ============================================
  // COMPTES COMPTABLES
  // ============================================

  const fetchComptes = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comptes_comptables')
        .select('*')
        .eq('company_id', companyId)
        .order('code_compte');

      if (error) throw error;
      setComptes(data || []);
    } catch (error: any) {
      console.error('Error fetching comptes:', error);
      toast.error('Erreur lors du chargement du plan comptable');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createCompte = useCallback(async (compte: Partial<CompteComptable>) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('comptes_comptables')
        .insert({
          ...compte,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchComptes();
      toast.success('Compte créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating compte:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
      throw error;
    }
  }, [companyId, fetchComptes]);

  const updateCompte = useCallback(async (id: string, updates: Partial<CompteComptable>) => {
    try {
      const { error } = await supabase
        .from('comptes_comptables')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchComptes();
      toast.success('Compte modifié avec succès');
    } catch (error: any) {
      console.error('Error updating compte:', error);
      toast.error(error.message || 'Erreur lors de la modification du compte');
      throw error;
    }
  }, [fetchComptes]);

  // ============================================
  // JOURNAUX
  // ============================================

  const fetchJournaux = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('journaux')
        .select('*')
        .eq('company_id', companyId)
        .order('code_journal');

      if (error) throw error;
      setJournaux(data || []);
    } catch (error: any) {
      console.error('Error fetching journaux:', error);
      toast.error('Erreur lors du chargement des journaux');
    }
  }, [companyId]);

  const createJournal = useCallback(async (journal: Partial<Journal>) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('journaux')
        .insert({
          ...journal,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchJournaux();
      toast.success('Journal créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating journal:', error);
      toast.error(error.message || 'Erreur lors de la création du journal');
      throw error;
    }
  }, [companyId, fetchJournaux]);

  // ============================================
  // EXERCICES
  // ============================================

  const fetchExercices = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('exercices_comptables')
        .select('*')
        .eq('company_id', companyId)
        .order('annee', { ascending: false });

      if (error) throw error;
      setExercices(data || []);
    } catch (error: any) {
      console.error('Error fetching exercices:', error);
      toast.error('Erreur lors du chargement des exercices');
    }
  }, [companyId]);

  const getActiveExercice = useCallback((): ExerciceComptable | null => {
    return exercices.find(e => e.is_active && !e.is_cloture) || null;
  }, [exercices]);

  const createExercice = useCallback(async (annee: number) => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase.rpc('create_default_exercice', {
        p_company_id: companyId,
        p_annee: annee,
      });

      if (error) throw error;
      await fetchExercices();
      toast.success('Exercice créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating exercice:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'exercice');
      throw error;
    }
  }, [companyId, fetchExercices]);

  // ============================================
  // ÉCRITURES
  // ============================================

  const fetchEcritures = useCallback(async (filters?: {
    exercice_id?: string;
    journal_id?: string;
    compte_id?: string;
    date_debut?: string;
    date_fin?: string;
    source_module?: string;
  }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('ecritures_comptables')
        .select(`
          *,
          journal:journaux(*),
          compte:comptes_comptables(*),
          exercice:exercices_comptables(*)
        `)
        .eq('company_id', companyId);

      if (filters?.exercice_id) {
        query = query.eq('exercice_id', filters.exercice_id);
      }
      if (filters?.journal_id) {
        query = query.eq('journal_id', filters.journal_id);
      }
      if (filters?.compte_id) {
        query = query.eq('compte_id', filters.compte_id);
      }
      if (filters?.date_debut) {
        query = query.gte('date', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date', filters.date_fin);
      }
      if (filters?.source_module) {
        query = query.eq('source_module', filters.source_module);
      }

      query = query.order('date', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setEcritures(data || []);
    } catch (error: any) {
      console.error('Error fetching ecritures:', error);
      toast.error('Erreur lors du chargement des écritures');
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  // ============================================
  // GÉNÉRATION AUTOMATIQUE D'ÉCRITURES
  // ============================================

  const createEcritures = useCallback(async (
    exercice_id: string,
    journal_id: string,
    lignes: EcritureLigne[],
    reference: string,
    source_module: 'ventes' | 'paie' | 'tresorerie' | 'achats' | 'stock',
    source_id: string,
    date: string,
    libelle?: string
  ) => {
    if (!companyId || !user?.id) {
      throw new Error('Company or user not found');
    }

    // Vérifier l'équilibre
    const totalDebit = lignes.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lignes.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Écriture non équilibrée: Débit ${totalDebit} ≠ Crédit ${totalCredit}`);
    }

    try {
      const ecrituresToInsert = lignes.map(ligne => ({
        company_id: companyId,
        exercice_id,
        journal_id,
        compte_id: ligne.compte_id,
        date,
        debit: ligne.debit || 0,
        credit: ligne.credit || 0,
        libelle: ligne.libelle || libelle,
        reference,
        source_module,
        source_id,
        is_validated: true,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from('ecritures_comptables')
        .insert(ecrituresToInsert)
        .select();

      if (error) throw error;

      // Vérifier l'équilibre après insertion
      const { data: verification, error: verifError } = await supabase.rpc(
        'verifier_equilibre_ecriture',
        {
          p_reference: reference,
          p_company_id: companyId,
        }
      );

      if (verifError) {
        console.warn('Erreur lors de la vérification:', verifError);
      }

      await fetchEcritures();
      return data;
    } catch (error: any) {
      console.error('Error creating ecritures:', error);
      toast.error(error.message || 'Erreur lors de la création des écritures');
      throw error;
    }
  }, [companyId, user?.id, fetchEcritures]);

  // ============================================
  // INITIALISATION
  // ============================================

  const initializeComptabilite = useCallback(async () => {
    if (!companyId) return;

    try {
      // Précharger le plan comptable si nécessaire
      const { data: existingComptes } = await supabase
        .from('comptes_comptables')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);

      if (!existingComptes || existingComptes.length === 0) {
        await supabase.rpc('preload_plan_comptable_tunisien', {
          p_company_id: companyId,
        });
      }

      // Précharger les journaux si nécessaire
      const { data: existingJournaux } = await supabase
        .from('journaux')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);

      if (!existingJournaux || existingJournaux.length === 0) {
        await supabase.rpc('preload_journaux_comptables', {
          p_company_id: companyId,
        });
      }

      // Créer l'exercice de l'année en cours si nécessaire
      const currentYear = new Date().getFullYear();
      const { data: existingExercice } = await supabase
        .from('exercices_comptables')
        .select('id')
        .eq('company_id', companyId)
        .eq('annee', currentYear)
        .limit(1);

      if (!existingExercice || existingExercice.length === 0) {
        await createExercice(currentYear);
      }

      // Charger les données
      await Promise.all([
        fetchComptes(),
        fetchJournaux(),
        fetchExercices(),
      ]);
    } catch (error: any) {
      console.error('Error initializing comptabilite:', error);
      toast.error('Erreur lors de l\'initialisation de la comptabilité');
    }
  }, [companyId, fetchComptes, fetchJournaux, fetchExercices, createExercice]);

  useEffect(() => {
    if (companyId) {
      initializeComptabilite();
    }
  }, [companyId, initializeComptabilite]);

  return {
    // State
    loading,
    comptes,
    journaux,
    exercices,
    ecritures,
    activeExercice: getActiveExercice(),

    // Comptes
    fetchComptes,
    createCompte,
    updateCompte,

    // Journaux
    fetchJournaux,
    createJournal,

    // Exercices
    fetchExercices,
    createExercice,
    getActiveExercice,

    // Écritures
    fetchEcritures,
    createEcritures,

    // Utils
    initializeComptabilite,
  };
}
