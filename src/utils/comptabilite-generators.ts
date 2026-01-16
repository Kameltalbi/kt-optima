// Note: Ces fonctions sont des placeholders en attendant la création des tables de comptabilité
// Les tables comptes_comptables, journaux, exercices_comptables, ecritures_comptables
// doivent être créées via une migration Supabase

import { toast } from 'sonner';

/**
 * Génère les écritures comptables pour une facture client
 * PLACEHOLDER - Tables non créées
 */
export async function generateEcrituresFromFacture(
  _factureId: string,
  _companyId: string,
  _exerciceId: string,
  _date: string,
  _montantHT: number,
  _montantTVA: number,
  _montantTTC: number,
  _clientId: string,
  _numeroFacture: string
): Promise<void> {
  console.log('Comptabilité: Tables non créées - écritures non générées');
}

/**
 * Génère les écritures comptables pour un avoir client
 * PLACEHOLDER - Tables non créées
 */
export async function generateEcrituresFromAvoir(
  _avoirId: string,
  _companyId: string,
  _exerciceId: string,
  _date: string,
  _montantHT: number,
  _montantTVA: number,
  _montantTTC: number,
  _clientId: string,
  _numeroAvoir: string
): Promise<void> {
  console.log('Comptabilité: Tables non créées - écritures non générées');
}

/**
 * Génère les écritures comptables pour un paiement client
 * PLACEHOLDER - Tables non créées
 */
export async function generateEcrituresFromPaiement(
  _paiementId: string,
  _companyId: string,
  _exerciceId: string,
  _date: string,
  _montant: number,
  _clientId: string,
  _modePaiement: 'banque' | 'caisse' | 'cheque' | 'virement' | 'autre',
  _numeroPaiement: string
): Promise<void> {
  console.log('Comptabilité: Tables non créées - écritures non générées');
}

/**
 * Génère les écritures comptables pour une fiche de paie
 * PLACEHOLDER - Tables non créées
 */
export async function generateEcrituresFromPaie(
  _fichePaieId: string,
  _companyId: string,
  _exerciceId: string,
  _date: string,
  _salaireBrut: number,
  _retenuesCNSS: number,
  _retenuesIRPP: number,
  _chargesEmployeur: number,
  _salaireNet: number,
  _numeroFichePaie: string
): Promise<void> {
  console.log('Comptabilité: Tables non créées - écritures non générées');
}

/**
 * Génère les écritures comptables pour un paiement de salaire
 * PLACEHOLDER - Tables non créées
 */
export async function generateEcrituresFromPaiementSalaire(
  _paiementId: string,
  _companyId: string,
  _exerciceId: string,
  _date: string,
  _montant: number,
  _modePaiement: 'banque' | 'caisse' | 'cheque' | 'virement' | 'autre',
  _numeroPaiement: string
): Promise<void> {
  console.log('Comptabilité: Tables non créées - écritures non générées');
}
