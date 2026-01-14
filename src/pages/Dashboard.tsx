import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePlan } from "@/hooks/use-plan";
import { PeriodSelector, PeriodType } from "@/components/dashboard/PeriodSelector";
import { CoreKPIs } from "@/components/dashboard/CoreKPIs";
import { FactureEncaissementChart } from "@/components/dashboard/FactureEncaissementChart";
import { CoreVentesWidget } from "@/components/dashboard/CoreVentesWidget";
import { CoreCRMWidget } from "@/components/dashboard/CoreCRMWidget";
import { BusinessWidgets } from "@/components/dashboard/BusinessWidgets";
import { EnterpriseWidgets } from "@/components/dashboard/EnterpriseWidgets";

export default function Dashboard() {
  const { plan, isCore, isBusiness, isEnterprise } = usePlan();
  const [period, setPeriod] = useState<PeriodType>("month");

  return (
    <MainLayout 
      title="Tableau de bord" 
      subtitle="Vue d'ensemble de votre activité"
    >
      {/* Header avec sélecteur de période */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard {plan === "core" ? "Core" : plan === "business" ? "Business" : "Enterprise"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {plan === "core" && "Est-ce que je vends et est-ce que j'encaisse ?"}
            {plan === "business" && "Mon activité est-elle structurée et rentable ?"}
            {plan === "enterprise" && "Mon entreprise est-elle saine financièrement et bien pilotée ?"}
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ============================================
          PLAN CORE - KPIs PRINCIPAUX
          ============================================ */}
      <div className="mb-8">
        <CoreKPIs period={period} />
      </div>

      {/* ============================================
          PLAN CORE - GRAPHIQUE PRINCIPAL
          ============================================ */}
      <div className="mb-8">
        <FactureEncaissementChart period={period} />
      </div>

      {/* ============================================
          PLAN CORE - BLOCS VENTES ET CRM
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CoreVentesWidget />
        <CoreCRMWidget />
      </div>

      {/* ============================================
          PLAN BUSINESS - WIDGETS AJOUTÉS
          ============================================ */}
      {isBusiness && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Business</h3>
            <p className="text-sm text-muted-foreground">
              Achats, produits et stocks
            </p>
          </div>
          <BusinessWidgets />
        </div>
      )}

      {/* ============================================
          PLAN ENTERPRISE - WIDGETS AJOUTÉS
          ============================================ */}
      {isEnterprise && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <p className="text-sm text-muted-foreground">
              Comptabilité, RH, parc et trésorerie avancée
            </p>
          </div>
          <EnterpriseWidgets />
        </div>
      )}

      {/* État vide si aucune donnée */}
      {isCore && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">
            💡 <strong>Astuce :</strong> Le dashboard Core répond à la question essentielle : 
            "Est-ce que je vends et est-ce que j'encaisse ?"
          </p>
        </div>
      )}
    </MainLayout>
  );
}
