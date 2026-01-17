import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { usePlan } from "@/hooks/use-plan";
import {
  PLAN_LABELS,
  PLAN_OBJECTIVES,
  DASHBOARD_TYPE_BY_PLAN,
  MIN_PLAN_FOR_UPGRADE,
  type PlanType,
} from "@/components/dashboard/dashboardConfig";
import { DashboardFilters, type PeriodType } from "@/components/dashboard/DashboardFilters";
import { LockedCard } from "@/components/dashboard/LockedCard";

// Départ
import { DepartKPIs } from "@/components/dashboard/DepartKPIs";
import { CaMensuelBarChart } from "@/components/dashboard/CaMensuelBarChart";

// Starter
import { StarterKPIs } from "@/components/dashboard/StarterKPIs";
import { CaPeriodeChart } from "@/components/dashboard/CaPeriodeChart";
import { FacturesPayeesImpayeesPie } from "@/components/dashboard/FacturesPayeesImpayeesPie";
import { CoreVentesWidget } from "@/components/dashboard/CoreVentesWidget";
import { CoreCRMWidget } from "@/components/dashboard/CoreCRMWidget";

// Business
import { BusinessKPIs } from "@/components/dashboard/BusinessKPIs";
import { EvolutionCAChart } from "@/components/dashboard/EvolutionCAChart";
import { TresoreriePrevisionnelleChart } from "@/components/dashboard/TresoreriePrevisionnelleChart";
import { VentesParProduitChart } from "@/components/dashboard/VentesParProduitChart";
import { StockCritiqueWidget } from "@/components/dashboard/StockCritiqueWidget";

// Enterprise
import { EnterpriseKPIs } from "@/components/dashboard/EnterpriseKPIs";
import { EnterpriseCharts } from "@/components/dashboard/EnterpriseCharts";

export default function Dashboard() {
  const { plan, isStarter, isBusiness, isEnterprise } = usePlan();
  const [period, setPeriod] = useState<PeriodType>("month");
  const [clientId, setClientId] = useState<string | null>(null);

  const planLabel = PLAN_LABELS[plan as PlanType] ?? plan;
  const objective = PLAN_OBJECTIVES[plan as PlanType] ?? "Vue d'ensemble de votre activité";
  const dashboardType = DASHBOARD_TYPE_BY_PLAN[plan as PlanType];
  const nextPlan = MIN_PLAN_FOR_UPGRADE[plan as PlanType];

  return (
    <MainLayout title="Tableau de bord" subtitle={`Dashboard ${dashboardType}`}>
      {/* Header : même layout pour tous les plans */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard {planLabel}</h2>
          <p className="text-sm text-muted-foreground mt-1">{objective}</p>
        </div>
        <DashboardFilters
          plan={plan as PlanType}
          period={period}
          onPeriodChange={setPeriod}
          clientId={clientId}
          onClientChange={setClientId}
        />
      </div>

      {/* ——— Plan Départ : Essentiel ——— */}
      {plan === "depart" && (
        <>
          <div className="mb-8">
            <DepartKPIs />
          </div>
          <div className="mb-8">
            <CaMensuelBarChart />
          </div>
          {nextPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <LockedCard minPlan={nextPlan} title="Suivi des encaissements" tooltip="Disponible à partir du plan Starter" showCta />
              <LockedCard minPlan={nextPlan} title="CA par période & factures payées/impayées" tooltip="Disponible à partir du plan Starter" showCta />
            </div>
          )}
        </>
      )}

      {/* ——— Plan Starter : Opérationnel ——— */}
      {plan === "starter" && (
        <>
          <div className="mb-8">
            <StarterKPIs period={period} clientId={clientId} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CaPeriodeChart period={period} clientId={clientId} />
            <FacturesPayeesImpayeesPie period={period} clientId={clientId} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CoreVentesWidget />
            <CoreCRMWidget />
          </div>
          {nextPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <LockedCard minPlan={nextPlan} title="Pilotage : CA, trésorerie, stock" tooltip="Disponible à partir du plan Business" showCta />
              <LockedCard minPlan={nextPlan} title="Indicateurs RH & notes de frais" tooltip="Disponible à partir du plan Business" showCta />
            </div>
          )}
        </>
      )}

      {/* ——— Plan Business : Pilotage ——— */}
      {(isBusiness || isEnterprise) && (
        <>
          <div className="mb-8">
            {isBusiness ? (
              <BusinessKPIs period={period} clientId={clientId} />
            ) : (
              <EnterpriseKPIs period={period} clientId={clientId} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <EvolutionCAChart period={period} clientId={clientId} />
            <TresoreriePrevisionnelleChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CoreVentesWidget />
            <CoreCRMWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <VentesParProduitChart />
            <StockCritiqueWidget />
          </div>

          {/* Enterprise uniquement : graphiques gouvernance */}
          {isEnterprise && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Gouvernance & performance</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Performance multi-périodes, analyse des coûts, répartition RH
              </p>
              <EnterpriseCharts period={period} clientId={clientId} />
            </div>
          )}

          {isBusiness && nextPlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <LockedCard minPlan={nextPlan} title="Comptabilité & TVA" tooltip="Disponible à partir du plan Enterprise" showCta />
              <LockedCard minPlan={nextPlan} title="Gouvernance & audit" tooltip="Disponible à partir du plan Enterprise" showCta />
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
