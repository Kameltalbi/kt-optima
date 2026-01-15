import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface ParametrePaie {
  id: string;
  company_id: string;
  code: string;
  libelle: string;
  valeur: number;
  type: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrancheIRPP {
  id: string;
  company_id: string;
  tranche_min: number;
  tranche_max: number | null;
  taux: number;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface FichePaie {
  id: string;
  company_id: string;
  employe_id: string;
  numero: string | null;
  periode: string;
  date_paiement: string;
  salaire_base: number;
  primes: number;
  indemnites: number;
  heures_sup: number;
  brut: number;
  cnss_salarie: number;
  cnss_employeur: number;
  taux_cnss_salarie: number;
  taux_cnss_employeur: number;
  base_imposable: number;
  irpp_annuel: number;
  irpp_mensuel: number;
  autres_retenues: number;
  net_a_payer: number;
  statut: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employe?: {
    id: string;
    nom: string;
    prenom: string;
    code: string | null;
    poste: string | null;
    departement: string | null;
    numero_cnss: string | null;
  };
}

export interface CalculPaieInput {
  salaire_base: number;
  primes?: number;
  indemnites?: number;
  heures_sup?: number;
  autres_retenues?: number;
}

export interface CalculPaieResult {
  brut: number;
  cnss_salarie: number;
  cnss_employeur: number;
  taux_cnss_salarie: number;
  taux_cnss_employeur: number;
  base_imposable: number;
  irpp_annuel: number;
  irpp_mensuel: number;
  autres_retenues: number;
  net_a_payer: number;
  details_irpp: {
    tranche: string;
    montant_tranche: number;
    taux: number;
    impot: number;
  }[];
}

export function usePayroll() {
  const { companyId } = useAuth();
  const [parametres, setParametres] = useState<ParametrePaie[]>([]);
  const [tranches, setTranches] = useState<TrancheIRPP[]>([]);
  const [fichesPaie, setFichesPaie] = useState<FichePaie[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les paramètres de paie
  const loadParametres = useCallback(async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('parametres_paie')
      .select('*')
      .eq('company_id', companyId)
      .eq('actif', true);
    
    if (error) {
      console.error('Erreur chargement paramètres:', error);
      return;
    }
    
    setParametres(data || []);
  }, [companyId]);

  // Charger les tranches IRPP
  const loadTranches = useCallback(async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('tranches_irpp')
      .select('*')
      .eq('company_id', companyId)
      .eq('actif', true)
      .order('ordre');
    
    if (error) {
      console.error('Erreur chargement tranches:', error);
      return;
    }
    
    setTranches(data || []);
  }, [companyId]);

  // Charger les fiches de paie
  const loadFichesPaie = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('fiches_paie')
      .select(`
        *,
        employe:employes(id, nom, prenom, code, poste, departement, numero_cnss)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur chargement fiches paie:', error);
      setLoading(false);
      return;
    }
    
    setFichesPaie(data || []);
    setLoading(false);
  }, [companyId]);

  // Initialiser les paramètres par défaut
  const initDefaultParams = useCallback(async () => {
    if (!companyId) return;
    
    const { error } = await supabase.rpc('create_default_payroll_params', {
      _company_id: companyId
    });
    
    if (error) {
      console.error('Erreur initialisation paramètres:', error);
      return;
    }
    
    await Promise.all([loadParametres(), loadTranches()]);
  }, [companyId, loadParametres, loadTranches]);

  // Obtenir un paramètre par code
  const getParametre = useCallback((code: string): number => {
    const param = parametres.find(p => p.code === code);
    return param ? param.valeur : 0;
  }, [parametres]);

  // Calculer l'IRPP annuel par tranches (seulement les tranches réellement utilisées)
  const calculerIRPPAnnuel = useCallback((baseImposableAnnuelle: number): { 
    irpp: number; 
    details: { tranche: string; montant_tranche: number; taux: number; impot: number }[] 
  } => {
    if (baseImposableAnnuelle <= 0 || tranches.length === 0) {
      return { irpp: 0, details: [] };
    }

    let irppTotal = 0;
    const details: { tranche: string; montant_tranche: number; taux: number; impot: number }[] = [];
    
    // Trier les tranches par ordre croissant
    const tranchesTriees = [...tranches].sort((a, b) => a.ordre - b.ordre);
    
    // Calculer uniquement les tranches réellement atteintes
    // Les tranches sont calculées par accumulation : chaque tranche s'applique sur la partie qui dépasse son minimum
    let resteAImposer = baseImposableAnnuelle;
    
    for (let i = 0; i < tranchesTriees.length && resteAImposer > 0; i++) {
      const tranche = tranchesTriees[i];
      const min = tranche.tranche_min;
      const max = tranche.tranche_max ?? Infinity;
      const taux = tranche.taux / 100;
      
      // Si la base imposable n'atteint pas le minimum de cette tranche, on passe à la suivante
      if (baseImposableAnnuelle <= min) {
        continue;
      }
      
      // Calculer le montant réellement imposé dans cette tranche
      // Le plafond est soit la base imposable, soit le max de la tranche
      const plafondTranche = max === Infinity ? baseImposableAnnuelle : Math.min(baseImposableAnnuelle, max);
      
      // Le montant dans cette tranche = plafond - minimum
      const montantDansTranche = Math.max(0, plafondTranche - min);
      
      // Ne garder que les tranches avec un montant > 0
      if (montantDansTranche > 0) {
        const impotTranche = montantDansTranche * taux;
        irppTotal += impotTranche;
        
        // Format de la tranche : "0 – 5 000 TND" ou "5 000 – 20 000 TND"
        // Pour la première tranche, on affiche "0 – 5 000" même si min > 0
        const minDisplay = i === 0 ? 0 : Math.ceil(min);
        const maxDisplay = max === Infinity 
          ? baseImposableAnnuelle 
          : Math.floor(max);
        const trancheLabel = max === Infinity 
          ? `${minDisplay.toLocaleString('fr-FR')} – ${baseImposableAnnuelle.toLocaleString('fr-FR')} TND`
          : `${minDisplay.toLocaleString('fr-FR')} – ${maxDisplay.toLocaleString('fr-FR')} TND`;
        
        details.push({
          tranche: trancheLabel,
          montant_tranche: montantDansTranche,
          taux: tranche.taux,
          impot: impotTranche
        });
      }
    }
    
    return { irpp: irppTotal, details };
  }, [tranches]);

  // Calculer la paie complète
  const calculerPaie = useCallback((input: CalculPaieInput): CalculPaieResult => {
    const { salaire_base, primes = 0, indemnites = 0, heures_sup = 0, autres_retenues = 0 } = input;
    
    // 1. Calculer le brut
    const brut = salaire_base + primes + indemnites + heures_sup;
    
    // 2. Taux CNSS
    const taux_cnss_salarie = getParametre('CNSS_SALARIE') / 100;
    const taux_cnss_employeur = getParametre('CNSS_EMPLOYEUR') / 100;
    
    // 3. Cotisations CNSS
    const cnss_salarie = brut * taux_cnss_salarie;
    const cnss_employeur = brut * taux_cnss_employeur;
    
    // 4. Base imposable mensuelle
    const base_imposable = brut - cnss_salarie;
    
    // 5. Base imposable annualisée
    const base_imposable_annuelle = base_imposable * 12;
    
    // 6. Calcul IRPP annuel par tranches
    const { irpp, details } = calculerIRPPAnnuel(base_imposable_annuelle);
    const irpp_annuel = irpp;
    
    // 7. IRPP mensuel
    const irpp_mensuel = irpp_annuel / 12;
    
    // 8. Net à payer
    const net_a_payer = brut - cnss_salarie - irpp_mensuel - autres_retenues;
    
    return {
      brut,
      cnss_salarie,
      cnss_employeur,
      taux_cnss_salarie: taux_cnss_salarie * 100,
      taux_cnss_employeur: taux_cnss_employeur * 100,
      base_imposable,
      irpp_annuel,
      irpp_mensuel,
      autres_retenues,
      net_a_payer,
      details_irpp: details
    };
  }, [getParametre, calculerIRPPAnnuel]);

  // Créer une fiche de paie
  const creerFichePaie = useCallback(async (
    employe_id: string,
    periode: string,
    date_paiement: string,
    input: CalculPaieInput,
    notes?: string
  ): Promise<FichePaie | null> => {
    if (!companyId) return null;
    
    const calcul = calculerPaie(input);
    
    const { data, error } = await supabase
      .from('fiches_paie')
      .insert({
        company_id: companyId,
        employe_id,
        periode,
        date_paiement,
        salaire_base: input.salaire_base,
        primes: input.primes || 0,
        indemnites: input.indemnites || 0,
        heures_sup: input.heures_sup || 0,
        brut: calcul.brut,
        cnss_salarie: calcul.cnss_salarie,
        cnss_employeur: calcul.cnss_employeur,
        taux_cnss_salarie: calcul.taux_cnss_salarie,
        taux_cnss_employeur: calcul.taux_cnss_employeur,
        base_imposable: calcul.base_imposable,
        irpp_annuel: calcul.irpp_annuel,
        irpp_mensuel: calcul.irpp_mensuel,
        autres_retenues: calcul.autres_retenues,
        net_a_payer: calcul.net_a_payer,
        statut: 'brouillon',
        notes
      })
      .select(`
        *,
        employe:employes(id, nom, prenom, code, poste, departement, numero_cnss)
      `)
      .single();
    
    if (error) {
      console.error('Erreur création fiche paie:', error);
      toast.error('Erreur lors de la création de la fiche de paie');
      return null;
    }
    
    toast.success('Fiche de paie créée avec succès');
    await loadFichesPaie();
    return data;
  }, [companyId, calculerPaie, loadFichesPaie]);

  // Valider une fiche de paie
  const validerFichePaie = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('fiches_paie')
      .update({ statut: 'validee' })
      .eq('id', id);
    
    if (error) {
      console.error('Erreur validation fiche paie:', error);
      toast.error('Erreur lors de la validation');
      return false;
    }
    
    toast.success('Fiche de paie validée');
    await loadFichesPaie();
    return true;
  }, [loadFichesPaie]);

  // Marquer comme payée
  const marquerPayee = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('fiches_paie')
      .update({ statut: 'payee' })
      .eq('id', id);
    
    if (error) {
      console.error('Erreur marquage payée:', error);
      toast.error('Erreur lors du marquage');
      return false;
    }
    
    toast.success('Fiche de paie marquée comme payée');
    await loadFichesPaie();
    return true;
  }, [loadFichesPaie]);

  // Supprimer une fiche de paie
  const supprimerFichePaie = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('fiches_paie')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur suppression fiche paie:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
    
    toast.success('Fiche de paie supprimée');
    await loadFichesPaie();
    return true;
  }, [loadFichesPaie]);

  // Mettre à jour un paramètre
  const updateParametre = useCallback(async (id: string, valeur: number): Promise<boolean> => {
    const { error } = await supabase
      .from('parametres_paie')
      .update({ valeur })
      .eq('id', id);
    
    if (error) {
      console.error('Erreur mise à jour paramètre:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
    
    toast.success('Paramètre mis à jour');
    await loadParametres();
    return true;
  }, [loadParametres]);

  // Mettre à jour une tranche IRPP
  const updateTranche = useCallback(async (
    id: string, 
    data: Partial<Pick<TrancheIRPP, 'tranche_min' | 'tranche_max' | 'taux'>>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('tranches_irpp')
      .update(data)
      .eq('id', id);
    
    if (error) {
      console.error('Erreur mise à jour tranche:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
    
    toast.success('Tranche mise à jour');
    await loadTranches();
    return true;
  }, [loadTranches]);

  // Charger les données au montage
  useEffect(() => {
    if (companyId) {
      Promise.all([loadParametres(), loadTranches(), loadFichesPaie()]);
    }
  }, [companyId, loadParametres, loadTranches, loadFichesPaie]);

  return {
    // Data
    parametres,
    tranches,
    fichesPaie,
    loading,
    
    // Actions
    initDefaultParams,
    loadParametres,
    loadTranches,
    loadFichesPaie,
    
    // Calculs
    getParametre,
    calculerPaie,
    calculerIRPPAnnuel,
    
    // CRUD
    creerFichePaie,
    validerFichePaie,
    marquerPayee,
    supprimerFichePaie,
    updateParametre,
    updateTranche
  };
}
