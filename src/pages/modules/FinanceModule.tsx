import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Treasury from "../Treasury";
import Banks from "../Banks";
import PaymentSchedules from "../PaymentSchedules";
import Reconciliations from "../Reconciliations";

const tabs: ModuleTab[] = [
  { id: "treasury", label: "Trésorerie", path: "/finance/tresorerie" },
  { id: "banks", label: "Banques", path: "/finance/banques" },
  { id: "schedules", label: "Échéanciers", path: "/finance/echeanciers" },
  { id: "reconciliations", label: "Rapprochements", path: "/finance/rapprochements" },
];

export default function FinanceModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/finance/tresorerie" replace />} />
      <Route
        path="tresorerie"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière et trésorerie"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Treasury />
          </MainLayout>
        }
      />
      <Route
        path="banques"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière et trésorerie"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Banks />
          </MainLayout>
        }
      />
      <Route
        path="echeanciers"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière et trésorerie"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <PaymentSchedules />
          </MainLayout>
        }
      />
      <Route
        path="rapprochements"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière et trésorerie"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Reconciliations />
          </MainLayout>
        }
      />
    </Routes>
  );
}
