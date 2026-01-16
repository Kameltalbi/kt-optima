import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Note: Ce hook est un placeholder en attendant la création des tables de comptabilité
// Les tables comptes_comptables, journaux, exercices_comptables, ecritures_comptables
// doivent être créées via une migration Supabase

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
  const [loading] = useState(false);
  const [comptes] = useState<CompteComptable[]>([]);
  const [journaux] = useState<Journal[]>([]);
  const [exercices] = useState<ExerciceComptable[]>([]);
  const [ecritures] = useState<EcritureComptable[]>([]);

  // Placeholder functions - will be implemented when tables are created
  const fetchComptes = useCallback(async () => {
    console.log('Comptabilité: Tables not yet created');
  }, []);

  const createCompte = useCallback(async (_compte: Partial<CompteComptable>) => {
    toast.error('Module comptabilité non configuré');
    return null;
  }, []);

  const updateCompte = useCallback(async (_id: string, _updates: Partial<CompteComptable>) => {
    toast.error('Module comptabilité non configuré');
  }, []);

  const fetchJournaux = useCallback(async () => {
    console.log('Comptabilité: Tables not yet created');
  }, []);

  const createJournal = useCallback(async (_journal: Partial<Journal>) => {
    toast.error('Module comptabilité non configuré');
    return null;
  }, []);

  const fetchExercices = useCallback(async () => {
    console.log('Comptabilité: Tables not yet created');
  }, []);

  const getActiveExercice = useCallback((): ExerciceComptable | null => {
    return null;
  }, []);

  const createExercice = useCallback(async (_annee: number) => {
    toast.error('Module comptabilité non configuré');
    return null;
  }, []);

  const fetchEcritures = useCallback(async (_filters?: {
    exercice_id?: string;
    journal_id?: string;
    compte_id?: string;
    date_debut?: string;
    date_fin?: string;
    source_module?: string;
  }) => {
    console.log('Comptabilité: Tables not yet created');
  }, []);

  const createEcritures = useCallback(async (
    _exercice_id: string,
    _journal_id: string,
    _lignes: EcritureLigne[],
    _reference: string,
    _source_module: 'ventes' | 'paie' | 'tresorerie' | 'achats' | 'stock',
    _source_id: string,
    _date: string,
    _libelle?: string
  ) => {
    toast.error('Module comptabilité non configuré');
    return null;
  }, []);

  const initializeComptabilite = useCallback(async () => {
    console.log('Comptabilité: Tables not yet created');
  }, []);

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
