import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import ChartOfAccounts from "../ChartOfAccounts";
import JournalEntries from "../JournalEntries";
import GeneralLedger from "../GeneralLedger";
import TrialBalance from "../TrialBalance";

const tabs: ModuleTab[] = [
  { id: "chart", label: "Plan comptable", path: "/comptabilite/plan-comptable" },
  { id: "entries", label: "Écritures", path: "/comptabilite/ecritures" },
  { id: "ledger", label: "Grand livre", path: "/comptabilite/grand-livre" },
  { id: "balance", label: "Balance", path: "/comptabilite/balance" },
];

export default function ComptabiliteModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/comptabilite/plan-comptable" replace />} />
      <Route
        path="plan-comptable"
        element={
          <MainLayout
            title="Comptabilité"
            subtitle="Gestion comptable et écritures"
            moduleTabs={tabs}
            moduleName="Comptabilité"
          >
            <ChartOfAccounts />
          </MainLayout>
        }
      />
      <Route
        path="ecritures"
        element={
          <MainLayout
            title="Comptabilité"
            subtitle="Gestion comptable et écritures"
            moduleTabs={tabs}
            moduleName="Comptabilité"
          >
            <JournalEntries />
          </MainLayout>
        }
      />
      <Route
        path="grand-livre"
        element={
          <MainLayout
            title="Comptabilité"
            subtitle="Gestion comptable et écritures"
            moduleTabs={tabs}
            moduleName="Comptabilité"
          >
            <GeneralLedger />
          </MainLayout>
        }
      />
      <Route
        path="balance"
        element={
          <MainLayout
            title="Comptabilité"
            subtitle="Gestion comptable et écritures"
            moduleTabs={tabs}
            moduleName="Comptabilité"
          >
            <TrialBalance />
          </MainLayout>
        }
      />
    </Routes>
  );
}
