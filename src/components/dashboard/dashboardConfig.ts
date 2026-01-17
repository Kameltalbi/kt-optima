/**
 * Configuration des dashboards par plan.
 * Principe : plus le plan monte, plus la vision devient globale, prédictive et décisionnelle.
 *
 * Départ → visibilité basique
 * Starter → suivi opérationnel
 * Business → pilotage
 * Enterprise → gouvernance & performance
 */

export type PlanType = "depart" | "starter" | "business" | "enterprise";

export type DashboardType = "Essentiel" | "Opérationnel" | "Pilotage" | "Gouvernance";

export const DASHBOARD_TYPE_BY_PLAN: Record<PlanType, DashboardType> = {
  depart: "Essentiel",
  starter: "Opérationnel",
  business: "Pilotage",
  enterprise: "Gouvernance",
};

/** Filtres disponibles par plan. Départ : aucun. Starter+ : période + client. */
export const FILTERS_BY_PLAN: Record<PlanType, ("period" | "client")[]> = {
  depart: [],
  starter: ["period", "client"],
  business: ["period", "client"],
  enterprise: ["period", "client"],
};

/** Plan minimum pour débloquer un bloc (pour LockedCard) */
export const MIN_PLAN_FOR_UPGRADE: Record<PlanType, PlanType | null> = {
  depart: "starter",
  starter: "business",
  business: "enterprise",
  enterprise: null,
};

export const PLAN_LABELS: Record<PlanType, string> = {
  depart: "Départ",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

export const PLAN_OBJECTIVES: Record<PlanType, string> = {
  depart: "Voir ce qui a été facturé, simplement.",
  starter: "Suivre l'activité commerciale et les encaissements.",
  business: "Piloter l'entreprise et prendre des décisions.",
  enterprise: "Superviser, sécuriser et optimiser à grande échelle.",
};
