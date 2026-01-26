import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

// Types
export interface BudgetPalier {
  id: string;
  company_id: string;
  montant_min: number;
  montant_max: number;
  nombre_validations: number;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetPalierValidateur {
  id: string;
  palier_id: string;
  niveau_validation: number;
  type_validateur: "role" | "user";
  validateur_role: string | null;
  validateur_user_id: string | null;
  ordre: number;
  created_at: string;
}

export interface PurchaseRequestSettings {
  id: string;
  company_id: string;
  enabled: boolean;
  require_exception_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestValidation {
  id: string;
  demande_id: string;
  niveau_validation: number;
  validateur_id: string | null;
  statut: "en_attente" | "valide" | "rejete";
  commentaire: string | null;
  validated_at: string | null;
  created_at: string;
  validateur?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface PurchaseRequest {
  id: string;
  numero: string; // Correspond à "number" dans purchase_requests mais "numero" dans demandes_achat
  company_id: string;
  demandeur_id: string | null;
  objet?: string; // Peut être null si pas encore défini
  categorie?: string | null;
  montant_total?: number;
  statut: "brouillon" | "en_attente" | "en_validation" | "approuvee" | "validee" | "rejetee" | "convertie" | "annulee";
  palier_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  validated_at?: string | null;
  rejected_at?: string | null;
  validations?: PurchaseRequestValidation[];
  palier?: BudgetPalier;
}

/**
 * Fonction utilitaire : Obtenir le palier selon le montant
 */
export async function getBudgetPalier(
  companyId: string,
  montant: number
): Promise<BudgetPalier | null> {
  try {
    // Utiliser la fonction SQL pour obtenir le palier
    const { data, error } = await supabase.rpc("get_budget_palier", {
      p_company_id: companyId,
      p_montant: montant,
    });

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("no rows")) {
        // Aucun palier trouvé
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Récupérer les détails du palier
    const { data: palierData, error: palierError } = await supabase
      .from("budget_paliers")
      .select("*")
      .eq("id", data)
      .single();

    if (palierError) throw palierError;
    return palierData;
  } catch (error: any) {
    console.error("Erreur lors de la récupération du palier:", error);
    return null;
  }
}

/**
 * Fonction utilitaire : Générer les validations pour une demande
 */
export async function generateValidations(
  demandeId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("generate_purchase_request_validations", {
      p_demande_id: demandeId,
    });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la génération des validations:", error);
    toast.error(`Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Fonction utilitaire : Valider ou rejeter une étape de validation
 */
export async function validateStep(
  validationId: string,
  action: "valide" | "rejete",
  commentaire?: string
): Promise<boolean> {
  try {
    const updates: any = {
      statut: action,
      validated_at: new Date().toISOString(),
    };

    if (commentaire) {
      updates.commentaire = commentaire;
    }

    const { error } = await supabase
      .from("purchase_request_validations")
      .update(updates)
      .eq("id", validationId);

    if (error) throw error;

    // Si validé, déclencher la validation suivante ou finaliser
    if (action === "valide") {
      await processNextValidation(validationId);
    } else if (action === "rejete") {
      await rejectRequest(validationId);
    }

    return true;
  } catch (error: any) {
    console.error("Erreur lors de la validation:", error);
    toast.error(`Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Traiter la validation suivante ou finaliser
 */
async function processNextValidation(validationId: string): Promise<void> {
  try {
    // Récupérer la validation actuelle
    const { data: currentValidation, error: fetchError } = await supabase
      .from("purchase_request_validations")
      .select("demande_id, niveau_validation")
      .eq("id", validationId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentValidation) return;

    // Vérifier s'il y a une validation suivante
    const { data: nextValidation, error: nextError } = await supabase
      .from("purchase_request_validations")
      .select("id")
      .eq("demande_id", currentValidation.demande_id)
      .eq("niveau_validation", currentValidation.niveau_validation + 1)
      .eq("statut", "en_attente")
      .limit(1)
      .single();

    if (nextError && nextError.code !== "PGRST116") {
      throw nextError;
    }

    // Si pas de validation suivante, toutes les validations sont terminées
    if (!nextValidation) {
      // Vérifier que toutes les validations sont validées
      const { data: allValidations, error: allError } = await supabase
        .from("purchase_request_validations")
        .select("statut")
        .eq("demande_id", currentValidation.demande_id);

      if (allError) throw allError;

      const allValidated =
        allValidations?.every((v) => v.statut === "valide") ?? false;

      if (allValidated) {
        // Finaliser la demande
        await supabase
          .from("demandes_achat")
          .update({
            statut: "validee",
            validated_at: new Date().toISOString(),
          })
          .eq("id", currentValidation.demande_id);
      }
    }
  } catch (error: any) {
    console.error("Erreur lors du traitement de la validation suivante:", error);
  }
}

/**
 * Rejeter une demande
 */
async function rejectRequest(validationId: string): Promise<void> {
  try {
    const { data: validation, error: fetchError } = await supabase
      .from("purchase_request_validations")
      .select("demande_id")
      .eq("id", validationId)
      .single();

    if (fetchError) throw fetchError;
    if (!validation) return;

    await supabase
      .from("demandes_achat")
      .update({
        statut: "rejetee",
        rejected_at: new Date().toISOString(),
      })
      .eq("id", validation.demande_id);
  } catch (error: any) {
    console.error("Erreur lors du rejet de la demande:", error);
  }
}

/**
 * Hook principal pour la gestion des validations de demandes d'achat
 */
export function usePurchaseRequestValidation() {
  const { company } = useApp();
  const [settings, setSettings] = useState<PurchaseRequestSettings | null>(null);
  const [paliers, setPaliers] = useState<BudgetPalier[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les paramètres
  const loadSettings = useCallback(async () => {
    if (!company?.id) return;

    try {
      const { data, error } = await supabase
        .from("purchase_request_settings")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data || null);
    } catch (error: any) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }
  }, [company?.id]);

  // Charger les paliers
  const loadPaliers = useCallback(async () => {
    if (!company?.id) return;

    try {
      const { data, error } = await supabase
        .from("budget_paliers")
        .select("*")
        .eq("company_id", company.id)
        .order("ordre", { ascending: true });

      if (error) throw error;
      setPaliers(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des paliers:", error);
    }
  }, [company?.id]);

  // Charger les validateurs d'un palier
  const loadValidateurs = useCallback(
    async (palierId: string): Promise<BudgetPalierValidateur[]> => {
      try {
        const { data, error } = await supabase
          .from("budget_palier_validateurs")
          .select("*")
          .eq("palier_id", palierId)
          .order("niveau_validation", { ascending: true })
          .order("ordre", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error("Erreur lors du chargement des validateurs:", error);
        return [];
      }
    },
    []
  );

  // Soumettre une demande (calculer palier et générer validations)
  const submitRequest = useCallback(
    async (
      demandeId: string,
      montantTotal: number
    ): Promise<{ success: boolean; palierId: string | null }> => {
      if (!company?.id) {
        toast.error("Entreprise non trouvée");
        return { success: false, palierId: null };
      }

      setLoading(true);
      try {
        // Vérifier les paramètres
        if (!settings?.enabled) {
          // Pas de validation par paliers, soumettre directement
          await supabase
            .from("demandes_achat")
            .update({
              statut: "validee",
              submitted_at: new Date().toISOString(),
              validated_at: new Date().toISOString(),
              montant_total: montantTotal,
            })
            .eq("id", demandeId);

          return { success: true, palierId: null };
        }

        // Obtenir le palier
        const palier = await getBudgetPalier(company.id, montantTotal);

        if (!palier) {
          // Aucun palier trouvé - vérifier si validation exceptionnelle requise
          if (settings.require_exception_approval) {
            toast.error(
              "Le montant dépasse tous les paliers configurés. Une validation exceptionnelle est requise."
            );
            return { success: false, palierId: null };
          } else {
            // Pas de validation exceptionnelle requise, approuver directement
            await supabase
              .from("demandes_achat")
              .update({
                statut: "validee",
                submitted_at: new Date().toISOString(),
                validated_at: new Date().toISOString(),
                montant_total: montantTotal,
              })
              .eq("id", demandeId);
            return { success: true, palierId: null };
          }
        }

        // Mettre à jour la demande avec le palier
        const { error: updateError } = await supabase
          .from("demandes_achat")
          .update({
            palier_id: palier.id,
            statut: "en_validation",
            submitted_at: new Date().toISOString(),
            montant_total: montantTotal,
          })
          .eq("id", demandeId);

        if (updateError) throw updateError;

        // Générer les validations
        const validationsGenerated = await generateValidations(demandeId);

        if (!validationsGenerated) {
          return { success: false, palierId: palier.id };
        }

        toast.success("Demande soumise avec succès. Validations générées.");
        return { success: true, palierId: palier.id };
      } catch (error: any) {
        console.error("Erreur lors de la soumission:", error);
        toast.error(`Erreur: ${error.message}`);
        return { success: false, palierId: null };
      } finally {
        setLoading(false);
      }
    },
    [company?.id, settings]
  );

  // Recalculer le palier si le montant change
  const recalculatePalier = useCallback(
    async (demandeId: string, nouveauMontant: number): Promise<boolean> => {
      if (!company?.id) return false;

      try {
        // Vérifier que la demande est en brouillon ou en validation
        const { data: demande, error: fetchError } = await supabase
          .from("demandes_achat")
          .select("statut")
          .eq("id", demandeId)
          .single();

        if (fetchError) throw fetchError;

        if (demande.statut === "validee" || demande.statut === "rejetee") {
          toast.error(
            "Impossible de modifier une demande validée ou rejetée"
          );
          return false;
        }

        // Obtenir le nouveau palier
        const nouveauPalier = await getBudgetPalier(company.id, nouveauMontant);

        // Mettre à jour la demande
        const updates: any = {
          montant_total: nouveauMontant,
          palier_id: nouveauPalier?.id || null,
        };

        // Si en validation, réinitialiser
        if (demande.statut === "en_validation") {
          updates.statut = "brouillon";
          // Supprimer les validations existantes
          await supabase
            .from("purchase_request_validations")
            .delete()
            .eq("demande_id", demandeId);
        }

        const { error: updateError } = await supabase
          .from("demandes_achat")
          .update(updates)
          .eq("id", demandeId);

        if (updateError) throw updateError;

        if (nouveauPalier) {
          toast.success("Palier recalculé. Soumettez à nouveau la demande.");
        } else {
          toast.warning("Aucun palier trouvé pour ce montant.");
        }

        return true;
      } catch (error: any) {
        console.error("Erreur lors du recalcul:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [company?.id]
  );

  useEffect(() => {
    loadSettings();
    loadPaliers();
  }, [loadSettings, loadPaliers]);

  return {
    settings,
    paliers,
    loading,
    loadSettings,
    loadPaliers,
    loadValidateurs,
    submitRequest,
    recalculatePalier,
    validateStep,
    getBudgetPalier,
    generateValidations,
  };
}
