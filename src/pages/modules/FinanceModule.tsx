import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Comptes from "../Comptes";
import Mouvements from "../Mouvements";
import Previsions from "../Previsions";
import FluxTresorerie from "../FluxTresorerie";

const tabs: ModuleTab[] = [
  { id: "comptes", label: "Comptes", path: "/finance/comptes" },
  { id: "mouvements", label: "Mouvements", path: "/finance/mouvements" },
  { id: "previsions", label: "Prévisions", path: "/finance/previsions" },
  { id: "flux", label: "Flux de trésorerie", path: "/finance/flux" },
];

export default function FinanceModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/finance/comptes" replace />} />
      <Route
        path="comptes"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière simple et fiable"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Comptes />
          </MainLayout>
        }
      />
      <Route
        path="mouvements"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière simple et fiable"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Mouvements />
          </MainLayout>
        }
      />
      <Route
        path="previsions"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière simple et fiable"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <Previsions />
          </MainLayout>
        }
      />
      <Route
        path="flux"
        element={
          <MainLayout
            title="Finance"
            subtitle="Gestion financière simple et fiable"
            moduleTabs={tabs}
            moduleName="Finance"
          >
            <FluxTresorerie />
          </MainLayout>
        }
      />
    </Routes>
  );
}
