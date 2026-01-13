import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Quotes from "../Quotes";
import Invoices from "../Invoices";
import ComingSoon from "../ComingSoon";

const tabs: ModuleTab[] = [
  { id: "quotes", label: "Devis", path: "/ventes/devis" },
  { id: "invoices", label: "Factures clients", path: "/ventes/factures" },
  { id: "payments", label: "Encaissements", path: "/ventes/encaissements" },
];

export default function VentesModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ventes/devis" replace />} />
      <Route
        path="devis"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Quotes />
          </MainLayout>
        }
      />
      <Route
        path="factures"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Invoices />
          </MainLayout>
        }
      />
      <Route
        path="encaissements"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <ComingSoon title="Encaissements" subtitle="Gestion des encaissements clients" />
          </MainLayout>
        }
      />
    </Routes>
  );
}
