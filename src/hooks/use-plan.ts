import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export type PlanType = "core" | "business" | "enterprise";

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
    // Récupérer le plan depuis la company, avec fallback sur "core"
    return (company?.plan as PlanType) || "core";
  }, [company]);

  const features = useMemo<PlanFeatures>(() => {
    switch (plan) {
      case "core":
        return {
          crm: true,
          ventes: true,
          tresorerie: "basique",
          achats: false,
          produits: false,
          stocks: false,
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
          stocks: true, // Optionnel, mais disponible
          comptabilite: false,
          rh: false,
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
          rh: true,
          parc: true,
        };
      default:
        return {
          crm: true,
          ventes: true,
          tresorerie: "basique",
          achats: false,
          produits: false,
          stocks: false,
          comptabilite: false,
          rh: false,
          parc: false,
        };
    }
  }, [plan]);

  return {
    plan,
    features,
    isCore: plan === "core",
    isBusiness: plan === "business",
    isEnterprise: plan === "enterprise",
  };
}
