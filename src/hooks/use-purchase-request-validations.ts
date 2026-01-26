import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface BudgetTier {
  id: string;
  company_id: string;
  montant_min: number;
  montant_max: number | null; // null = infini
  nombre_validations: number;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
  validators?: TierValidator[];
}

export interface TierValidator {
  id: string;
  tier_id: string;
  niveau_validation: number; // 1 = premier, 2 = deuxième, etc.
  validator_type: 'role' | 'user';
  role_name: string | null;
  user_id: string | null;
  created_at: string;
  // Relations
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface PurchaseRequestValidation {
  id: string;
  demande_achat_id: string;
  niveau_validation: number;
  validateur_id: string | null;
  statut: 'en_attente' | 'valide' | 'rejete';
  commentaire: string | null;
  validated_at: string | null;
  created_at: string;
  // Relations
  validateur?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface ValidationSettings {
  id: string;
  company_id: string;
  enabled: boolean;
  require_exception_approval: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// LOGIQUE MÉTIER
// ============================================

/**
 * Identifie le palier budgétaire correspondant à un montant
 */
export async function getBudgetTierForAmount(
  companyId: string,
  amount: number
): Promise<BudgetTier | null> {
  try {
    // Récupérer le palier correspondant au montant
    const { data: tiers, error } = await supabase
      .from('purchase_request_budget_tiers')
      .select('*')
      .eq('company_id', companyId)
      .eq('actif', true)
      .lte('montant_min', amount)
      .order('ordre', { ascending: true });

    if (error) throw error;
    if (!tiers || tiers.length === 0) return null;

    // Trouver le palier qui correspond (montant_min <= amount <= montant_max ou montant_max IS NULL)
    const tier = tiers.find(
      t => t.montant_min <= amount && (t.montant_max === null || t.montant_max >= amount)
    );

    if (!tier) return null;

    // Récupérer les validateurs du palier
    const { data: validators, error: validatorsError } = await supabase
      .from('purchase_request_tier_validators')
      .select(`
        *,
        user:user_id(
          id,
          full_name,
          email
        )
      `)
      .eq('tier_id', tier.id)
      .order('niveau_validation', { ascending: true });

    if (validatorsError) throw validatorsError;

    return {
      ...tier,
      validators: validators || [],
    } as BudgetTier;
  } catch (error: any) {
    console.error('Error getting budget tier:', error);
    return null;
  }
}

/**
 * Génère les validations requises pour une demande selon son palier
 */
export async function generateValidationsForRequest(
  demandeId: string,
  tier: BudgetTier
): Promise<PurchaseRequestValidation[]> {
  if (!tier.validators || tier.validators.length === 0) {
    throw new Error('Le palier n\'a pas de validateurs configurés');
  }

  // Trier les validateurs par niveau
  const sortedValidators = [...tier.validators].sort(
    (a, b) => a.niveau_validation - b.niveau_validation
  );

  // Pour chaque validateur, déterminer l'utilisateur réel
  const validations: Omit<PurchaseRequestValidation, 'id' | 'created_at'>[] = [];

  for (const validator of sortedValidators) {
    let validateurId: string | null = null;

    if (validator.validator_type === 'user') {
      validateurId = validator.user_id;
    } else if (validator.validator_type === 'role' && validator.role_name) {
      // Trouver un utilisateur avec ce rôle dans l'entreprise
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('company_id', tier.company_id)
        .eq('role', validator.role_name)
        .limit(1);

      if (userRoles && userRoles.length > 0) {
        validateurId = userRoles[0].user_id;
      } else {
        console.warn(`Aucun utilisateur trouvé avec le rôle ${validator.role_name}`);
      }
    }

    if (validateurId) {
      validations.push({
        demande_achat_id: demandeId,
        niveau_validation: validator.niveau_validation,
        validateur_id: validateurId,
        statut: 'en_attente',
        commentaire: null,
        validated_at: null,
      });
    }
  }

  // Insérer les validations dans la base de données
  if (validations.length > 0) {
    const { data, error } = await supabase
      .from('purchase_request_validations')
      .insert(validations)
      .select();

    if (error) throw error;
    return data as PurchaseRequestValidation[];
  }

  return [];
}

/**
 * Valide ou rejette une étape de validation
 */
export async function validateStep(
  validationId: string,
  action: 'valide' | 'rejete',
  commentaire?: string
): Promise<boolean> {
  try {
    const { data: validation, error: fetchError } = await supabase
      .from('purchase_request_validations')
      .select('*, demande_achat_id')
      .eq('id', validationId)
      .single();

    if (fetchError) throw fetchError;
    if (!validation) throw new Error('Validation introuvable');
    if (validation.statut !== 'en_attente') {
      throw new Error('Cette validation a déjà été traitée');
    }

    // Mettre à jour la validation
    const { error: updateError } = await supabase
      .from('purchase_request_validations')
      .update({
        statut: action,
        commentaire: commentaire || null,
        validated_at: new Date().toISOString(),
      })
      .eq('id', validationId);

    if (updateError) throw updateError;

    // Si rejeté, mettre à jour le statut de la demande
    if (action === 'rejete') {
      await supabase
        .from('demandes_achat')
        .update({
          statut_validation: 'rejetee',
          statut: 'rejetee',
        })
        .eq('id', validation.demande_achat_id);
    } else {
      // Si validé, vérifier s'il y a une validation suivante
      const { data: nextValidation } = await supabase
        .from('purchase_request_validations')
        .select('id')
        .eq('demande_achat_id', validation.demande_achat_id)
        .eq('niveau_validation', validation.niveau_validation + 1)
        .eq('statut', 'en_attente')
        .single();

      if (!nextValidation) {
        // Toutes les validations sont terminées
        await supabase
          .from('demandes_achat')
          .update({
            statut_validation: 'validee',
            statut: 'approuvee',
          })
          .eq('id', validation.demande_achat_id);
      }
    }

    return true;
  } catch (error: any) {
    console.error('Error validating step:', error);
    toast.error(error.message || 'Erreur lors de la validation');
    return false;
  }
}

// ============================================
// HOOK
// ============================================

export function usePurchaseRequestValidations() {
  const { companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ValidationSettings | null>(null);
  const [tiers, setTiers] = useState<BudgetTier[]>([]);
  const [validations, setValidations] = useState<PurchaseRequestValidation[]>([]);

  // Charger les paramètres de validation
  const loadSettings = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('purchase_request_validation_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      setSettings(data || null);
    } catch (error: any) {
      console.error('Error loading validation settings:', error);
    }
  }, [companyId]);

  // Charger les paliers budgétaires
  const loadTiers = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_request_budget_tiers')
        .select(`
          *,
          validators:purchase_request_tier_validators(
            *,
            user:user_id(
              id,
              full_name,
              email
            )
          )
        `)
        .eq('company_id', companyId)
        .order('ordre', { ascending: true });

      if (error) throw error;
      setTiers((data || []) as BudgetTier[]);
    } catch (error: any) {
      console.error('Error loading budget tiers:', error);
      toast.error('Erreur lors du chargement des paliers');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger les validations d'une demande
  const loadValidations = useCallback(async (demandeId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_request_validations')
        .select(`
          *,
          validateur:validateur_id(
            id,
            full_name,
            email
          )
        `)
        .eq('demande_achat_id', demandeId)
        .order('niveau_validation', { ascending: true });

      if (error) throw error;
      setValidations((data || []) as PurchaseRequestValidation[]);
      return data as PurchaseRequestValidation[];
    } catch (error: any) {
      console.error('Error loading validations:', error);
      return [];
    }
  }, []);

  // Soumettre une demande (calculer palier et générer validations)
  const submitRequest = useCallback(async (
    demandeId: string,
    montantTotal?: number
  ): Promise<boolean> => {
    if (!companyId || !settings?.enabled) {
      // Si la validation n'est pas activée, approuver directement
      await supabase
        .from('demandes_achat')
        .update({
          statut_validation: 'validee',
          statut: 'approuvee',
        })
        .eq('id', demandeId);
      return true;
    }

    try {
      // Calculer le montant total si non fourni
      let total = montantTotal || 0;
      if (!montantTotal) {
        const { data: lignes } = await supabase
          .from('demande_achat_lignes')
          .select('montant_estime')
          .eq('demande_achat_id', demandeId);

        total = lignes?.reduce((sum, l) => sum + (l.montant_estime || 0), 0) || 0;
      }

      // Identifier le palier
      const tier = await getBudgetTierForAmount(companyId, total);

      if (!tier) {
        // Montant dépasse le palier maximum
        if (settings.require_exception_approval) {
          toast.error('Le montant dépasse le palier maximum. Une validation exceptionnelle est requise.');
          return false;
        } else {
          // Approuver directement si pas de validation exceptionnelle requise
          await supabase
            .from('demandes_achat')
            .update({
              statut_validation: 'validee',
              statut: 'approuvee',
            })
            .eq('id', demandeId);
          return true;
        }
      }

      // Mettre à jour la demande avec le palier et le montant
      await supabase
        .from('demandes_achat')
        .update({
          montant_total: total,
          palier_id: tier.id,
          statut_validation: 'en_validation',
          statut: 'en_attente',
        })
        .eq('id', demandeId);

      // Générer les validations
      await generateValidationsForRequest(demandeId, tier);

      toast.success('Demande soumise. Les validations ont été générées.');
      return true;
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Erreur lors de la soumission');
      return false;
    }
  }, [companyId, settings]);

  // Valider une étape
  const validateValidationStep = useCallback(async (
    validationId: string,
    action: 'valide' | 'rejete',
    commentaire?: string
  ) => {
    const success = await validateStep(validationId, action, commentaire);
    if (success) {
      // Recharger les validations si nécessaire
      const validation = validations.find(v => v.id === validationId);
      if (validation) {
        await loadValidations(validation.demande_achat_id);
      }
    }
    return success;
  }, [validations, loadValidations]);

  return {
    loading,
    settings,
    tiers,
    validations,
    loadSettings,
    loadTiers,
    loadValidations,
    submitRequest,
    validateValidationStep,
    getBudgetTierForAmount: useCallback(
      (amount: number) => getBudgetTierForAmount(companyId!, amount),
      [companyId]
    ),
  };
}
