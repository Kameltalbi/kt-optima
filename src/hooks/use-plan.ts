import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export type PlanType = "depart" | "starter" | "business" | "enterprise";

interface PlanFeatures {
  crm: boolean;
  ventes: boolean;
  tresorerie: "basique" | "standard" | "avancee" | false;
  achats: boolean;
  produits: boolean;
  stocks: boolean;
  comptabilite: boolean;
  rh: boolean;
  parc: boolean;
}

export function usePlan() {
  const { company } = useAuth();

  const plan = useMemo<PlanType>(() => {
    // Récupérer le plan depuis la company, avec fallback sur "depart"
    return (company?.plan as PlanType) || "depart";
  }, [company]);

  const features = useMemo<PlanFeatures>(() => {
    switch (plan) {
      case "depart":
        return {
          crm: true,
          ventes: true,
          tresorerie: false,
          achats: false,
          produits: true,
          stocks: true, // Gestion produits/services et catégories uniquement
          comptabilite: false,
          rh: false,
          parc: false,
        };
      case "starter":
        return {
          crm: true,
          ventes: true,
          tresorerie: "basique",
          achats: false,
          produits: true,
          stocks: true, // + Mouvements de stock et inventaire
          comptabilite: false,
          rh: false,
          parc: false,
        };
      case "business":
        return {
          crm: true,
          ventes: true,
          tresorerie: "standard",
          achats: true,
          produits: true,
          stocks: true, // Gestion avancée du stock
          comptabilite: false,
          rh: true, // RH partiel
          parc: false,
        };
      case "enterprise":
        return {
          crm: true,
          ventes: true,
          tresorerie: "avancee",
          achats: true,
          produits: true,
          stocks: true,
          comptabilite: true,
          rh: true, // RH complet
          parc: true,
        };
      default:
        return {
          crm: true,
          ventes: true,
          tresorerie: false,
          achats: false,
          produits: true,
          stocks: true,
          comptabilite: false,
          rh: false,
          parc: false,
        };
    }
  }, [plan]);

  return {
    plan,
    features,
    isDepart: plan === "depart",
    isStarter: plan === "starter",
    isBusiness: plan === "business",
    isEnterprise: plan === "enterprise",
  };
}
