import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AllocationEncaissement } from './use-encaissements';

// Type pour allocation d'une facture d'acompte
export interface AllocationFactureAcompte {
  facture_acompte_id: string;
  montant_alloue: number;
}

// Type combiné pour les allocations d'acomptes (encaissements ou factures d'acompte)
export interface AcomptesAllocations {
  encaissements: AllocationEncaissement[];
  factures_acompte: AllocationFactureAcompte[];
}
import { getNextDocumentNumber } from './use-document-numbering';

// Type pour une facture de vente
export interface FactureVente {
  id: string;
  numero: string;
  date_facture: string;
  date_echeance: string | null;
  client_id: string;
  type_facture?: 'standard' | 'acompte';
  statut: 'brouillon' | 'validee' | 'annulee' | 'payee';
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  montant_paye: number;
  montant_restant: number;
  remise_type?: 'percentage' | 'amount' | null;
  remise_valeur?: number;
  remise_montant?: number;
  conditions_paiement: string | null;
  notes: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Nouveaux champs pour workflow acompte
  acompte_valeur?: number;
  acompte_type?: 'amount' | 'percentage' | null;
  facture_parent_id?: string | null;
  devis_id?: string | null;
}

// Type pour une ligne de facture
export interface FactureVenteLigne {
  id: string;
  facture_vente_id: string;
  produit_id: string | null;
  description: string | null;
  quantite: number;
  prix_unitaire: number;
  taux_tva: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  ordre: number;
  created_at: string;
}

// Type pour créer une facture (sans lignes)
export interface CreateFactureVenteData {
  numero: string;
  date_facture: string;
  date_echeance?: string | null;
  client_id: string;
  type_facture?: 'standard' | 'acompte';
  statut?: 'brouillon' | 'validee' | 'annulee' | 'payee';
  montant_ht?: number;
  montant_tva?: number;
  montant_ttc?: number;
  montant_paye?: number;
  montant_restant?: number;
  remise_type?: 'percentage' | 'amount' | null;
  remise_valeur?: number;
  remise_montant?: number;
  conditions_paiement?: string | null;
  notes?: string | null;
  // Nouveaux champs pour workflow acompte
  acompte_valeur?: number;
  acompte_type?: 'amount' | 'percentage' | null;
  facture_parent_id?: string | null;
  devis_id?: string | null;
}

// Type pour créer une ligne
export interface CreateFactureVenteLigneData {
  produit_id?: string | null;
  description?: string | null;
  quantite: number;
  prix_unitaire: number;
  taux_tva?: number;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  ordre?: number;
}

export function useFacturesVentes() {
  const { companyId } = useAuth();
  const [factures, setFactures] = useState<FactureVente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les factures depuis Supabase
  const fetchFactures = useCallback(async () => {
    if (!companyId) {
      setFactures([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('factures_ventes')
        .select('*')
        .eq('company_id', companyId)
        .order('date_facture', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFactures((data || []) as unknown as FactureVente[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des factures');
      setError(error);
      toast.error('Erreur lors du chargement des factures');
      console.error('Error fetching factures:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger au montage et quand companyId change
  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  // Créer une facture
  const createFacture = useCallback(async (
    factureData: CreateFactureVenteData,
    lignes: CreateFactureVenteLigneData[] = [],
    acomptesAlloues: AcomptesAllocations = { encaissements: [], factures_acompte: [] }
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Générer le numéro automatiquement si non fourni
      // Les factures d'acompte utilisent la même numérotation séquentielle que les factures standard
      let numero = factureData.numero;
      if (!numero || numero.trim() === '') {
        // Utiliser 'facture' pour toutes les factures (standard et acompte) pour avoir la même séquence
        numero = await getNextDocumentNumber('facture', factureData.date_facture);
      }

      // Calculer les montants si non fournis
      let montant_ht = factureData.montant_ht || 0;
      let montant_tva = factureData.montant_tva || 0;
      let montant_ttc = factureData.montant_ttc || 0;

      if (lignes.length > 0) {
        montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
        montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
        montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);
      }

      // Calculer le montant de l'acompte si défini
      let montantAcompte = 0;
      if (factureData.acompte_valeur && factureData.acompte_type && factureData.type_facture !== 'acompte') {
        if (factureData.acompte_type === 'percentage') {
          montantAcompte = (montant_ttc * factureData.acompte_valeur) / 100;
        } else {
          montantAcompte = Math.min(factureData.acompte_valeur, montant_ttc); // Ne pas dépasser le total
        }
      }

      // Calculer le montant payé via les acomptes (encaissements + factures d'acompte)
      // S'assurer que acomptesAlloues et ses propriétés sont définis
      const encaissements = acomptesAlloues?.encaissements || [];
      const facturesAcompte = acomptesAlloues?.factures_acompte || [];
      const montantAcomptesEncaissements = encaissements.reduce((sum, acc) => sum + (acc.montant_alloue || 0), 0);
      const montantAcomptesFactures = facturesAcompte.reduce((sum, acc) => sum + (acc.montant_alloue || 0), 0);
      const montantAcomptesTotal = montantAcomptesEncaissements + montantAcomptesFactures;
      const montant_paye = (factureData.montant_paye || 0) + montantAcomptesTotal;
      const montant_restant = montant_ttc - montant_paye;

      // Filtrer factureData pour ne garder que les champs qui existent dans la table
      // Exclure les champs qui pourraient ne pas exister (facture_parent_id, devis_id, etc.)
      const { facture_parent_id, devis_id, ...factureDataFiltered } = factureData;
      
      const { data: facture, error: insertError } = await supabase
        .from('factures_ventes')
        .insert({
          ...factureDataFiltered,
          numero,
          company_id: companyId,
          type_facture: factureData.type_facture || 'standard',
          montant_ht,
          montant_tva,
          montant_ttc,
          montant_paye,
          montant_restant,
          statut: montant_restant <= 0 ? 'payee' : (factureData.statut || 'brouillon'),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Créer les lignes si fournies
      if (lignes.length > 0 && facture) {
        const lignesToInsert = lignes.map((ligne, index) => ({
          ...ligne,
          facture_vente_id: facture.id,
          ordre: ligne.ordre || index,
        }));

        const { error: lignesError } = await supabase
          .from('facture_vente_lignes')
          .insert(lignesToInsert);

        if (lignesError) {
          throw lignesError;
        }
      }

      // Allouer les encaissements si fournis
      if (encaissements.length > 0 && facture) {
        const factureEncaissements = encaissements.map(allocation => ({
          facture_id: facture.id, // La table facture_encaissements utilise facture_id
          encaissement_id: allocation.encaissement_id,
          montant_alloue: allocation.montant_alloue,
        }));

        const { error: allocationError } = await supabase
          .from('facture_encaissements' as any)
          .insert(factureEncaissements as any);

        if (allocationError) {
          throw allocationError;
        }
      }

      // Allouer les factures d'acompte si fournies
      if (facturesAcompte.length > 0 && facture) {
        const factureAcompteAllocations = facturesAcompte.map(allocation => ({
          facture_finale_id: facture.id,
          facture_acompte_id: allocation.facture_acompte_id,
          montant_alloue: allocation.montant_alloue,
        }));

        const { error: allocationError } = await supabase
          .from('facture_acompte_allocations')
          .insert(factureAcompteAllocations);

        if (allocationError) {
          throw allocationError;
        }
      }

      // Gérer le solde client si les acomptes dépassent le montant de la facture
      if (montantAcomptesTotal > montant_ttc && facture) {
        const soldeClient = montantAcomptesTotal - montant_ttc;
        
        // Créer un encaissement de type acompte avec le solde restant
        // Ce solde pourra être utilisé pour de futures factures ou remboursé
        const { error: soldeError } = await supabase
          .from('encaissements')
          .insert({
            client_id: factureData.client_id,
            date: factureData.date_facture,
            montant: soldeClient,
            mode_paiement: 'autre',
            reference: `Solde facture ${facture.numero}`,
            type_encaissement: 'acompte',
            allocated_amount: 0,
            remaining_amount: soldeClient,
            status: 'disponible',
            notes: `Solde restant de la facture ${facture.numero} - Montant des acomptes: ${montantAcomptesTotal}, Montant facture: ${montant_ttc}`,
            company_id: companyId,
          });

        if (soldeError) {
          console.error('Error creating client balance encaissement:', soldeError);
          // Ne pas bloquer la création de la facture si l'encaissement échoue
        }
      }

      // WORKFLOW ACOMPTE : Générer automatiquement la facture d'acompte si un acompte est défini
      let factureAcompteId: string | null = null;
      if (montantAcompte > 0 && facture && factureData.type_facture !== 'acompte') {
        try {
          // Générer le numéro de la facture d'acompte (même séquence que les factures standard)
          const numeroAcompte = await getNextDocumentNumber('facture', factureData.date_facture);
          
          // Créer la facture d'acompte
          const { data: factureAcompte, error: acompteError } = await supabase
            .from('factures_ventes')
            .insert({
              numero: numeroAcompte,
              company_id: companyId,
              client_id: factureData.client_id,
              date_facture: factureData.date_facture,
              type_facture: 'acompte',
              statut: 'brouillon',
              montant_ht: 0,
              montant_tva: 0,
              montant_ttc: montantAcompte,
              montant_paye: 0,
              montant_restant: montantAcompte,
              notes: `Facture d'acompte pour la facture ${facture.numero}`,
              facture_parent_id: facture.id, // Lier à la facture finale
              devis_id: factureData.devis_id || null,
              acompte_valeur: factureData.acompte_valeur || 0,
              acompte_type: factureData.acompte_type || null,
            })
            .select()
            .single();

          if (acompteError) {
            console.error('Error creating facture acompte:', acompteError);
            toast.warning('Facture créée mais erreur lors de la génération de la facture d\'acompte');
          } else {
            factureAcompteId = factureAcompte.id;
            console.log('✅ Facture d\'acompte générée:', factureAcompte.numero);
            toast.success(`Facture créée - Facture d'acompte ${factureAcompte.numero} générée automatiquement`);
          }
        } catch (err) {
          console.error('Error in workflow acompte:', err);
          // Ne pas bloquer la création de la facture principale
        }
      }

      toast.success('Facture créée avec succès' + (factureAcompteId ? ' - Facture d\'acompte générée' : ''));
      await fetchFactures();
      return facture;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la création de la facture');
      toast.error(error.message);
      console.error('Error creating facture:', err);
      throw error;
    }
  }, [companyId, fetchFactures]);

  // Mettre à jour une facture
  const updateFacture = useCallback(async (
    id: string,
    updates: Partial<Omit<FactureVente, 'id' | 'created_at' | 'company_id'>>
  ) => {
    try {
      const currentFacture = factures.find(f => f.id === id);
      if (!currentFacture) {
        throw new Error('Facture introuvable');
      }

      // Recalculer montant_restant si montant_ttc ou montant_paye changent
      if (updates.montant_ttc !== undefined || updates.montant_paye !== undefined) {
        const montant_ttc = updates.montant_ttc ?? currentFacture.montant_ttc;
        const montant_paye = updates.montant_paye ?? currentFacture.montant_paye;
        updates.montant_restant = montant_ttc - montant_paye;
        
        // Mettre à jour le statut si payé
        if (updates.montant_restant === 0 && montant_ttc > 0) {
          updates.statut = 'payee';
        } else if (updates.statut !== 'annulee' && updates.montant_restant !== undefined) {
          if (updates.statut === 'validee' || currentFacture.statut === 'validee') {
            updates.statut = 'validee';
          }
        }
      }

      // Vérifier si la facture passe à "payee" et si c'est une facture d'acompte
      const devientPayee = (updates.statut === 'payee' && currentFacture.statut !== 'payee') ||
                          (updates.montant_restant === 0 && currentFacture.montant_restant > 0);
      const estFactureAcompte = currentFacture.type_facture === 'acompte';

      const { data, error: updateError } = await supabase
        .from('factures_ventes')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Si la facture d'acompte devient payée, créer automatiquement un encaissement de type acompte
      if (devientPayee && estFactureAcompte && data) {
        try {
          const montantPaye = updates.montant_paye ?? currentFacture.montant_paye;
          
          // Vérifier qu'un encaissement n'existe pas déjà pour cette facture
          const { data: existingEncaissement } = await supabase
            .from('encaissements')
            .select('id')
            .eq('client_id', data.client_id)
            .eq('type_encaissement', 'acompte')
            .eq('montant', montantPaye)
            .eq('date', data.date_facture)
            .limit(1)
            .single();

          if (!existingEncaissement) {
            // Créer l'encaissement de type acompte
            const { error: encaissementError } = await supabase
              .from('encaissements')
              .insert({
                client_id: data.client_id,
                date: data.date_facture,
                montant: montantPaye,
                mode_paiement: 'virement', // Par défaut, peut être modifié plus tard
                reference: `Facture d'acompte ${data.numero}`,
                type_encaissement: 'acompte',
                allocated_amount: 0,
                remaining_amount: montantPaye,
                status: 'disponible',
                notes: `Encaissement automatique - Facture d'acompte ${data.numero}`,
                company_id: companyId,
              });

            if (encaissementError) {
              console.error('Error creating encaissement for facture acompte:', encaissementError);
              // Ne pas bloquer la mise à jour de la facture si l'encaissement échoue
            }
          }
        } catch (err) {
          console.error('Error creating encaissement for facture acompte:', err);
          // Ne pas bloquer la mise à jour de la facture
        }
      }

      toast.success('Facture mise à jour avec succès');
      await fetchFactures();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour de la facture');
      toast.error(error.message);
      console.error('Error updating facture:', err);
      throw error;
    }
  }, [companyId, factures, fetchFactures]);

  // Supprimer une facture
  const deleteFacture = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('factures_ventes')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Facture supprimée avec succès');
      await fetchFactures();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de la facture');
      toast.error(error.message);
      console.error('Error deleting facture:', err);
      throw error;
    }
  }, [companyId, fetchFactures]);

  // Obtenir les lignes d'une facture
  const getLignes = useCallback(async (factureId: string): Promise<FactureVenteLigne[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('facture_vente_lignes')
        .select('*')
        .eq('facture_vente_id', factureId)
        .order('ordre', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching lignes:', err);
      return [];
    }
  }, []);

  // Ajouter une ligne à une facture
  const addLigne = useCallback(async (
    factureId: string,
    ligneData: CreateFactureVenteLigneData
  ) => {
    try {
      const { data, error: insertError } = await supabase
        .from('facture_vente_lignes')
        .insert({
          ...ligneData,
          facture_vente_id: factureId,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Recalculer les totaux de la facture
      const lignes = await getLignes(factureId);
      const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
      const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
      const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

      await updateFacture(factureId, {
        montant_ht,
        montant_tva,
        montant_ttc,
        montant_restant: montant_ttc - (factures.find(f => f.id === factureId)?.montant_paye || 0),
      });

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'ajout de la ligne');
      toast.error(error.message);
      console.error('Error adding ligne:', err);
      throw error;
    }
  }, [getLignes, updateFacture, factures]);

  // Supprimer une ligne
  const deleteLigne = useCallback(async (ligneId: string, factureId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('facture_vente_lignes')
        .delete()
        .eq('id', ligneId);

      if (deleteError) {
        throw deleteError;
      }

      // Recalculer les totaux de la facture
      const lignes = await getLignes(factureId);
      const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
      const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
      const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

      await updateFacture(factureId, {
        montant_ht,
        montant_tva,
        montant_ttc,
        montant_restant: montant_ttc - (factures.find(f => f.id === factureId)?.montant_paye || 0),
      });

      toast.success('Ligne supprimée');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de la ligne');
      toast.error(error.message);
      console.error('Error deleting ligne:', err);
      throw error;
    }
  }, [getLignes, updateFacture, factures]);

  // Valider une facture (brouillon → validée)
  const validerFacture = useCallback(async (id: string) => {
    return updateFacture(id, { statut: 'validee' });
  }, [updateFacture]);

  // Annuler une facture
  const annulerFacture = useCallback(async (id: string) => {
    return updateFacture(id, { statut: 'annulee' });
  }, [updateFacture]);

  // Obtenir une facture par ID
  const getFactureById = useCallback((id: string): FactureVente | undefined => {
    return factures.find(f => f.id === id);
  }, [factures]);

  // Filtrer par statut
  const getFacturesByStatut = useCallback((statut: FactureVente['statut']): FactureVente[] => {
    return factures.filter(f => f.statut === statut);
  }, [factures]);

  // Filtrer par client
  const getFacturesByClient = useCallback((clientId: string): FactureVente[] => {
    return factures.filter(f => f.client_id === clientId);
  }, [factures]);

  // Rechercher des factures
  const searchFactures = useCallback((searchTerm: string): FactureVente[] => {
    const term = searchTerm.toLowerCase();
    return factures.filter(f =>
      f.numero.toLowerCase().includes(term) ||
      f.notes?.toLowerCase().includes(term)
    );
  }, [factures]);

  // Obtenir les factures d'acompte payées pour un client (disponibles pour déduction)
  // Retourne les factures avec leur montant disponible (montant_ttc - montant déjà alloué)
  const getFacturesAcomptePayees = useCallback(async (clientId: string): Promise<(FactureVente & { montant_disponible: number })[]> => {
    try {
      console.log('🔍 Recherche factures d\'acompte pour client:', clientId, 'company:', companyId);
      
      // D'abord, récupérer toutes les factures d'acompte pour ce client (sans filtre sur statut)
      const { data: allFacturesAcompte, error: allError } = await supabase
        .from('factures_ventes')
        .select('*')
        .eq('company_id', companyId)
        .eq('client_id', clientId)
        .eq('type_facture', 'acompte')
        .order('date_facture', { ascending: false });

      if (allError) {
        console.error('❌ Error fetching all factures acompte:', allError);
        throw allError;
      }

      console.log('📋 Toutes les factures d\'acompte (tous statuts):', allFacturesAcompte?.length || 0, allFacturesAcompte);

      // Filtrer pour ne garder que celles avec statut 'payee'
      const facturesPayees = (allFacturesAcompte || []).filter(f => f.statut === 'payee');
      console.log('✅ Factures d\'acompte payées:', facturesPayees.length, facturesPayees);

      if (facturesPayees.length === 0) {
        console.log('⚠️ Aucune facture d\'acompte payée trouvée pour ce client');
        return [];
      }

      // Pour chaque facture d'acompte payée, calculer le montant disponible
      const facturesAvecMontantDisponible = await Promise.all(
        facturesPayees.map(async (facture: FactureVente) => {
          console.log(`🔎 Traitement facture ${facture.numero}:`, {
            id: facture.id,
            numero: facture.numero,
            statut: facture.statut,
            type_facture: facture.type_facture,
            montant_ttc: facture.montant_ttc,
          });
          // Récupérer le montant déjà alloué
          const { data: allocations, error: allocError } = await supabase
            .from('facture_acompte_allocations')
            .select('montant_alloue')
            .eq('facture_acompte_id', facture.id);

          if (allocError) {
            // Si la table n'existe pas encore, considérer que rien n'est alloué
            if (allocError.code === 'PGRST116' || allocError.code === '42P01' || allocError.message?.includes('does not exist')) {
              console.warn(`⚠️ Table facture_acompte_allocations n'existe pas encore pour facture ${facture.numero}. Montant disponible = montant TTC complet.`);
              return { ...facture, montant_disponible: facture.montant_ttc };
            }
            console.error(`❌ Error fetching allocations pour facture ${facture.numero}:`, allocError);
            return { ...facture, montant_disponible: facture.montant_ttc };
          }

          const montantAlloue = (allocations || []).reduce((sum, a) => sum + (a.montant_alloue || 0), 0);
          const montantDisponible = facture.montant_ttc - montantAlloue;

          console.log(`📊 Facture ${facture.numero}: TTC=${facture.montant_ttc}, Alloué=${montantAlloue}, Disponible=${montantDisponible}`);

          return {
            ...facture,
            montant_disponible: Math.max(0, montantDisponible), // Ne pas retourner de montant négatif
          };
        })
      );

      // Filtrer pour ne garder que celles avec un montant disponible > 0
      const facturesDisponibles = facturesAvecMontantDisponible.filter(f => f.montant_disponible > 0);
      console.log('✅ Factures d\'acompte disponibles (montant > 0):', facturesDisponibles.length, facturesDisponibles);
      
      return facturesDisponibles;
    } catch (err) {
      console.error('Error fetching factures acompte payees:', err);
      return [];
    }
  }, [companyId]);

  // Générer la facture finale depuis une facture d'acompte
  const generateFactureFinaleFromAcompte = useCallback(async (factureAcompteId: string) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      // Récupérer la facture d'acompte
      const factureAcompte = factures.find(f => f.id === factureAcompteId);
      if (!factureAcompte) {
        throw new Error('Facture d\'acompte introuvable');
      }

      if (factureAcompte.type_facture !== 'acompte') {
        throw new Error('Cette facture n\'est pas une facture d\'acompte');
      }

      // Vérifier si une facture finale existe déjà
      if (factureAcompte.facture_parent_id) {
        const factureFinale = factures.find(f => f.id === factureAcompte.facture_parent_id);
        if (factureFinale) {
          toast.info(`La facture finale ${factureFinale.numero} existe déjà`);
          return factureFinale;
        }
      }

      // Récupérer les lignes depuis la facture d'acompte ou depuis le devis source
      // La facture finale doit avoir les mêmes lignes que la facture d'acompte ou le devis
      let lignesFinale: CreateFactureVenteLigneData[] = [];
      
      // D'abord, essayer depuis la facture d'acompte
      const { data: lignesAcompte, error: lignesError } = await supabase
        .from('facture_vente_lignes')
        .select('*')
        .eq('facture_vente_id', factureAcompteId)
        .order('ordre', { ascending: true });

      if (lignesError) {
        console.error('❌ Error fetching lignes from facture acompte:', lignesError);
      }

      if (!lignesError && lignesAcompte && lignesAcompte.length > 0) {
        console.log(`✅ Found ${lignesAcompte.length} lignes in facture acompte`);
        lignesFinale = lignesAcompte.map(ligne => ({
          description: ligne.description || '',
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          taux_tva: ligne.taux_tva,
          montant_ht: ligne.montant_ht,
          montant_tva: ligne.montant_tva,
          montant_ttc: ligne.montant_ttc,
          ordre: ligne.ordre,
        }));
      } else {
        console.log(`⚠️ No lignes found in facture acompte (${factureAcompteId})`);
      }

      // Si pas de lignes dans la facture d'acompte, essayer depuis le devis source
      if (lignesFinale.length === 0 && factureAcompte.devis_id) {
        console.log(`🔍 Trying to fetch lignes from devis ${factureAcompte.devis_id}`);
        const { data: quoteItems, error: quoteError } = await supabase
          .from('quote_items')
          .select('*')
          .eq('quote_id', factureAcompte.devis_id)
          .order('created_at', { ascending: true });

        if (quoteError) {
          console.error('❌ Error fetching quote items:', quoteError);
        }

        if (!quoteError && quoteItems && quoteItems.length > 0) {
          console.log(`✅ Found ${quoteItems.length} items in quote`);
          lignesFinale = quoteItems.map(item => ({
            description: item.description,
            quantite: item.quantity,
            prix_unitaire: item.unit_price,
            taux_tva: item.tax_rate || 0,
            montant_ht: item.quantity * item.unit_price,
            montant_tva: (item.quantity * item.unit_price * (item.tax_rate || 0)) / 100,
            montant_ttc: item.total,
            ordre: 0,
          }));
        } else {
          console.log(`⚠️ No items found in quote (${factureAcompte.devis_id})`);
        }
      }

      // Si toujours aucune ligne, on ne peut pas créer une facture finale valide
      if (lignesFinale.length === 0) {
        throw new Error('Impossible de générer la facture finale : aucune ligne trouvée dans la facture d\'acompte ni dans le devis source. Veuillez d\'abord ajouter des lignes à la facture d\'acompte.');
      }

      // Calculer les totaux avec protection contre les valeurs null/undefined
      const montant_ht = lignesFinale.reduce((sum, l) => sum + (Number(l.montant_ht) || 0), 0);
      const montant_tva = lignesFinale.reduce((sum, l) => sum + (Number(l.montant_tva) || 0), 0);
      const montant_ttc = lignesFinale.reduce((sum, l) => sum + (Number(l.montant_ttc) || 0), 0);

      // Le montant de l'acompte est déjà payé
      const montant_paye = Number(factureAcompte.montant_ttc) || 0;
      const montant_restant = Math.max(0, montant_ttc - montant_paye);

      // Vérifier que la date est valide
      if (!factureAcompte.date_facture) {
        throw new Error('La date de la facture d\'acompte est manquante');
      }

      // Vérifier que le client existe
      if (!factureAcompte.client_id) {
        throw new Error('Le client de la facture d\'acompte est manquant');
      }

      // Générer le numéro de la facture finale
      const numeroFinale = await getNextDocumentNumber('facture', factureAcompte.date_facture);

      // Créer la facture finale
      const factureFinaleData: any = {
        numero: numeroFinale,
        company_id: companyId,
        client_id: factureAcompte.client_id,
        date_facture: factureAcompte.date_facture,
        type_facture: 'standard',
        statut: montant_restant <= 0 ? 'payee' : 'brouillon',
        montant_ht: montant_ht || 0,
        montant_tva: montant_tva || 0,
        montant_ttc: montant_ttc || 0,
        montant_paye: montant_paye || 0,
        montant_restant: montant_restant || 0,
        notes: `Facture finale - Acompte: ${factureAcompte.numero}`,
        remise_type: null,
        remise_valeur: 0,
        remise_montant: 0,
        conditions_paiement: null,
      };

      // Ne pas ajouter devis_id ni facture_parent_id si les colonnes n'existent pas encore
      // Ces champs seront ajoutés après la migration SQL

      const { data: factureFinale, error: finalError } = await supabase
        .from('factures_ventes')
        .insert(factureFinaleData)
        .select()
        .single();

      if (finalError) {
        console.error('❌ Error creating facture finale:', finalError);
        console.error('📋 Data attempted:', factureFinaleData);
        console.error('📋 Facture acompte:', {
          id: factureAcompte.id,
          numero: factureAcompte.numero,
          date_facture: factureAcompte.date_facture,
          client_id: factureAcompte.client_id,
          montant_ttc: factureAcompte.montant_ttc,
        });
        
        // Si l'erreur concerne des colonnes manquantes, suggérer d'appliquer la migration
        if (finalError.message?.includes('facture_parent_id') || 
            finalError.message?.includes('devis_id') || 
            finalError.message?.includes('discount_amount')) {
          throw new Error(`Erreur: Certaines colonnes n'existent pas encore. Veuillez exécuter la migration SQL: supabase/migrations/20260125000000_add_workflow_acompte_fields.sql dans Supabase SQL Editor.`);
        }
        
        throw new Error(`Erreur lors de la création de la facture finale: ${finalError.message || JSON.stringify(finalError)}`);
      }

      if (!factureFinale) {
        throw new Error('La facture finale n\'a pas été créée (aucune donnée retournée)');
      }

      // Note: facture_parent_id et devis_id seront liés après l'application de la migration SQL
      // Pour l'instant, le lien est fait via les notes de la facture

      // Créer les lignes de la facture finale
      if (lignesFinale.length > 0 && factureFinale) {
        const lignesToInsert = lignesFinale.map((ligne, index) => ({
          facture_vente_id: factureFinale.id,
          description: ligne.description || '',
          quantite: Number(ligne.quantite) || 1,
          prix_unitaire: Number(ligne.prix_unitaire) || 0,
          taux_tva: Number(ligne.taux_tva) || 0,
          montant_ht: Number(ligne.montant_ht) || 0,
          montant_tva: Number(ligne.montant_tva) || 0,
          montant_ttc: Number(ligne.montant_ttc) || 0,
          ordre: ligne.ordre || index,
        }));

        const { error: lignesError } = await supabase
          .from('facture_vente_lignes')
          .insert(lignesToInsert);

        if (lignesError) {
          console.error('❌ Error inserting lignes:', lignesError);
          console.error('📋 Lignes attempted:', lignesToInsert);
          throw new Error(`Erreur lors de la création des lignes: ${lignesError.message || JSON.stringify(lignesError)}`);
        }
      }

      // Allouer la facture d'acompte à la facture finale
      if (factureFinale && factureAcompte.statut === 'payee') {
        const { error: allocError } = await supabase
          .from('facture_acompte_allocations')
          .insert({
            facture_finale_id: factureFinale.id,
            facture_acompte_id: factureAcompteId,
            montant_alloue: factureAcompte.montant_ttc,
          });

        if (allocError) {
          console.error('Error allocating acompte to final invoice:', allocError);
          // Ne pas bloquer la création de la facture finale
        }
      }

      await fetchFactures();
      toast.success(`Facture finale ${factureFinale.numero} générée avec succès`);
      return factureFinale;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la génération de la facture finale');
      console.error('❌ Error generating facture finale:', err);
      console.error('❌ Error details:', {
        factureAcompteId,
        factureAcompte: factures.find(f => f.id === factureAcompteId),
        errorMessage: error.message,
        errorStack: err instanceof Error ? err.stack : undefined,
      });
      toast.error(`Erreur: ${error.message}`);
      throw error;
    }
  }, [companyId, factures, fetchFactures]);

  return {
    factures,
    loading,
    error,
    createFacture,
    updateFacture,
    deleteFacture,
    getLignes,
    addLigne,
    deleteLigne,
    validerFacture,
    annulerFacture,
    getFactureById,
    getFacturesByStatut,
    getFacturesByClient,
    searchFactures,
    getFacturesAcomptePayees,
    generateFactureFinaleFromAcompte,
    refreshFactures: fetchFactures,
  };
}
