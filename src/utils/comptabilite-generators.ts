import { supabase } from '@/integrations/supabase/client';
import { EcritureLigne } from '@/hooks/use-comptabilite';
import { toast } from 'sonner';

/**
 * Génère les écritures comptables pour une facture client
 */
export async function generateEcrituresFromFacture(
  factureId: string,
  companyId: string,
  exerciceId: string,
  date: string,
  montantHT: number,
  montantTVA: number,
  montantTTC: number,
  clientId: string,
  numeroFacture: string
): Promise<void> {
  try {
    // Récupérer les comptes nécessaires
    const { data: compteClient } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '411')
      .single();

    const { data: compteVente } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '70')
      .single();

    const { data: compteTVA } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '445')
      .single();

    // Récupérer le journal VE (Ventes)
    const { data: journalVE } = await supabase
      .from('journaux')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_journal', 'VE')
      .single();

    if (!compteClient || !compteVente || !compteTVA || !journalVE) {
      throw new Error('Comptes ou journal manquants. Veuillez initialiser la comptabilité.');
    }

    // Créer les lignes d'écriture
    const lignes: EcritureLigne[] = [
      {
        compte_id: compteClient.id,
        debit: montantTTC,
        credit: 0,
        libelle: `Facture ${numeroFacture} - Client`,
      },
      {
        compte_id: compteVente.id,
        debit: 0,
        credit: montantHT,
        libelle: `Facture ${numeroFacture} - Ventes`,
      },
      {
        compte_id: compteTVA.id,
        debit: 0,
        credit: montantTVA,
        libelle: `Facture ${numeroFacture} - TVA collectée`,
      },
    ];

    // Insérer les écritures
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    const ecrituresToInsert = lignes.map(ligne => ({
      company_id: companyId,
      exercice_id: exerciceId,
      journal_id: journalVE.id,
      compte_id: ligne.compte_id,
      date,
      debit: ligne.debit || 0,
      credit: ligne.credit || 0,
      libelle: ligne.libelle,
      reference: numeroFacture,
      source_module: 'ventes' as const,
      source_id: factureId,
      is_validated: true,
      created_by: user.user.id,
    }));

    const { error } = await supabase
      .from('ecritures_comptables')
      .insert(ecrituresToInsert);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error generating ecritures from facture:', error);
    toast.error(error.message || 'Erreur lors de la génération des écritures');
    throw error;
  }
}

/**
 * Génère les écritures comptables pour un avoir client
 */
export async function generateEcrituresFromAvoir(
  avoirId: string,
  companyId: string,
  exerciceId: string,
  date: string,
  montantHT: number,
  montantTVA: number,
  montantTTC: number,
  clientId: string,
  numeroAvoir: string
): Promise<void> {
  try {
    // Récupérer les comptes nécessaires
    const { data: compteClient } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '411')
      .single();

    const { data: compteVente } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '70')
      .single();

    const { data: compteTVA } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '445')
      .single();

    // Récupérer le journal VE (Ventes)
    const { data: journalVE } = await supabase
      .from('journaux')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_journal', 'VE')
      .single();

    if (!compteClient || !compteVente || !compteTVA || !journalVE) {
      throw new Error('Comptes ou journal manquants. Veuillez initialiser la comptabilité.');
    }

    // Écritures inversées pour un avoir
    const lignes: EcritureLigne[] = [
      {
        compte_id: compteClient.id,
        debit: 0,
        credit: montantTTC,
        libelle: `Avoir ${numeroAvoir} - Client`,
      },
      {
        compte_id: compteVente.id,
        debit: montantHT,
        credit: 0,
        libelle: `Avoir ${numeroAvoir} - Ventes`,
      },
      {
        compte_id: compteTVA.id,
        debit: montantTVA,
        credit: 0,
        libelle: `Avoir ${numeroAvoir} - TVA collectée`,
      },
    ];

    // Insérer les écritures
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    const ecrituresToInsert = lignes.map(ligne => ({
      company_id: companyId,
      exercice_id: exerciceId,
      journal_id: journalVE.id,
      compte_id: ligne.compte_id,
      date,
      debit: ligne.debit || 0,
      credit: ligne.credit || 0,
      libelle: ligne.libelle,
      reference: numeroAvoir,
      source_module: 'ventes' as const,
      source_id: avoirId,
      is_validated: true,
      created_by: user.user.id,
    }));

    const { error } = await supabase
      .from('ecritures_comptables')
      .insert(ecrituresToInsert);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error generating ecritures from avoir:', error);
    toast.error(error.message || 'Erreur lors de la génération des écritures');
    throw error;
  }
}

/**
 * Génère les écritures comptables pour un paiement client
 */
export async function generateEcrituresFromPaiement(
  paiementId: string,
  companyId: string,
  exerciceId: string,
  date: string,
  montant: number,
  clientId: string,
  modePaiement: 'banque' | 'caisse' | 'cheque' | 'virement' | 'autre',
  numeroPaiement: string
): Promise<void> {
  try {
    // Récupérer les comptes nécessaires
    const { data: compteClient } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '411')
      .single();

    // Déterminer le compte de trésorerie selon le mode de paiement
    let codeCompteTresorerie = '512'; // Banque par défaut
    if (modePaiement === 'caisse') {
      codeCompteTresorerie = '531';
    }

    const { data: compteTresorerie } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', codeCompteTresorerie)
      .single();

    // Récupérer le journal approprié
    const codeJournal = modePaiement === 'caisse' ? 'CA' : 'BN';
    const { data: journal } = await supabase
      .from('journaux')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_journal', codeJournal)
      .single();

    if (!compteClient || !compteTresorerie || !journal) {
      throw new Error('Comptes ou journal manquants. Veuillez initialiser la comptabilité.');
    }

    // Créer les lignes d'écriture
    const lignes: EcritureLigne[] = [
      {
        compte_id: compteTresorerie.id,
        debit: montant,
        credit: 0,
        libelle: `Paiement ${numeroPaiement} - ${modePaiement}`,
      },
      {
        compte_id: compteClient.id,
        debit: 0,
        credit: montant,
        libelle: `Paiement ${numeroPaiement} - Client`,
      },
    ];

    // Insérer les écritures
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    const ecrituresToInsert = lignes.map(ligne => ({
      company_id: companyId,
      exercice_id: exerciceId,
      journal_id: journal.id,
      compte_id: ligne.compte_id,
      date,
      debit: ligne.debit || 0,
      credit: ligne.credit || 0,
      libelle: ligne.libelle,
      reference: numeroPaiement,
      source_module: 'tresorerie' as const,
      source_id: paiementId,
      is_validated: true,
      created_by: user.user.id,
    }));

    const { error } = await supabase
      .from('ecritures_comptables')
      .insert(ecrituresToInsert);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error generating ecritures from paiement:', error);
    toast.error(error.message || 'Erreur lors de la génération des écritures');
    throw error;
  }
}

/**
 * Génère les écritures comptables pour une fiche de paie
 */
export async function generateEcrituresFromPaie(
  fichePaieId: string,
  companyId: string,
  exerciceId: string,
  date: string,
  salaireBrut: number,
  retenuesCNSS: number,
  retenuesIRPP: number,
  chargesEmployeur: number,
  salaireNet: number,
  numeroFichePaie: string
): Promise<void> {
  try {
    // Récupérer les comptes nécessaires
    const { data: compteSalaires } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '641')
      .single();

    const { data: comptePersonnel } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '421')
      .single();

    const { data: compteCNSS } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '431')
      .single();

    const { data: compteIRPP } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '442')
      .single();

    const { data: compteCharges } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '645')
      .single();

    // Récupérer le journal PA (Paie)
    const { data: journalPA } = await supabase
      .from('journaux')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_journal', 'PA')
      .single();

    if (!compteSalaires || !comptePersonnel || !compteCNSS || !compteIRPP || !compteCharges || !journalPA) {
      throw new Error('Comptes ou journal manquants. Veuillez initialiser la comptabilité.');
    }

    // Créer les lignes d'écriture
    const lignes: EcritureLigne[] = [
      // Salaires bruts
      {
        compte_id: compteSalaires.id,
        debit: salaireBrut,
        credit: 0,
        libelle: `Fiche paie ${numeroFichePaie} - Salaires`,
      },
      // Retenues CNSS
      {
        compte_id: compteCNSS.id,
        debit: 0,
        credit: retenuesCNSS,
        libelle: `Fiche paie ${numeroFichePaie} - CNSS`,
      },
      // Retenues IRPP
      {
        compte_id: compteIRPP.id,
        debit: 0,
        credit: retenuesIRPP,
        libelle: `Fiche paie ${numeroFichePaie} - IRPP`,
      },
      // Charges employeur
      {
        compte_id: compteCharges.id,
        debit: chargesEmployeur,
        credit: 0,
        libelle: `Fiche paie ${numeroFichePaie} - Charges employeur`,
      },
      // Personnel (salaire net + retenues)
      {
        compte_id: comptePersonnel.id,
        debit: 0,
        credit: salaireBrut + chargesEmployeur,
        libelle: `Fiche paie ${numeroFichePaie} - Personnel`,
      },
    ];

    // Insérer les écritures
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    const ecrituresToInsert = lignes.map(ligne => ({
      company_id: companyId,
      exercice_id: exerciceId,
      journal_id: journalPA.id,
      compte_id: ligne.compte_id,
      date,
      debit: ligne.debit || 0,
      credit: ligne.credit || 0,
      libelle: ligne.libelle,
      reference: numeroFichePaie,
      source_module: 'paie' as const,
      source_id: fichePaieId,
      is_validated: true,
      created_by: user.user.id,
    }));

    const { error } = await supabase
      .from('ecritures_comptables')
      .insert(ecrituresToInsert);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error generating ecritures from paie:', error);
    toast.error(error.message || 'Erreur lors de la génération des écritures');
    throw error;
  }
}

/**
 * Génère les écritures comptables pour un paiement de salaire
 */
export async function generateEcrituresFromPaiementSalaire(
  paiementId: string,
  companyId: string,
  exerciceId: string,
  date: string,
  montant: number,
  modePaiement: 'banque' | 'caisse' | 'cheque' | 'virement' | 'autre',
  numeroPaiement: string
): Promise<void> {
  try {
    // Récupérer les comptes nécessaires
    const { data: comptePersonnel } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', '421')
      .single();

    // Déterminer le compte de trésorerie selon le mode de paiement
    let codeCompteTresorerie = '512'; // Banque par défaut
    if (modePaiement === 'caisse') {
      codeCompteTresorerie = '531';
    }

    const { data: compteTresorerie } = await supabase
      .from('comptes_comptables')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_compte', codeCompteTresorerie)
      .single();

    // Récupérer le journal approprié
    const codeJournal = modePaiement === 'caisse' ? 'CA' : 'BN';
    const { data: journal } = await supabase
      .from('journaux')
      .select('id')
      .eq('company_id', companyId)
      .eq('code_journal', codeJournal)
      .single();

    if (!comptePersonnel || !compteTresorerie || !journal) {
      throw new Error('Comptes ou journal manquants. Veuillez initialiser la comptabilité.');
    }

    // Créer les lignes d'écriture
    const lignes: EcritureLigne[] = [
      {
        compte_id: comptePersonnel.id,
        debit: montant,
        credit: 0,
        libelle: `Paiement salaire ${numeroPaiement}`,
      },
      {
        compte_id: compteTresorerie.id,
        debit: 0,
        credit: montant,
        libelle: `Paiement salaire ${numeroPaiement} - ${modePaiement}`,
      },
    ];

    // Insérer les écritures
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    const ecrituresToInsert = lignes.map(ligne => ({
      company_id: companyId,
      exercice_id: exerciceId,
      journal_id: journal.id,
      compte_id: ligne.compte_id,
      date,
      debit: ligne.debit || 0,
      credit: ligne.credit || 0,
      libelle: ligne.libelle,
      reference: numeroPaiement,
      source_module: 'paie' as const,
      source_id: paiementId,
      is_validated: true,
      created_by: user.user.id,
    }));

    const { error } = await supabase
      .from('ecritures_comptables')
      .insert(ecrituresToInsert);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error generating ecritures from paiement salaire:', error);
    toast.error(error.message || 'Erreur lors de la génération des écritures');
    throw error;
  }
}
