import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import PurchaseOrders from "../PurchaseOrders";
import Receptions from "../Receptions";
import ComingSoon from "../ComingSoon";

const tabs: ModuleTab[] = [
  { id: "purchase-orders", label: "Bons de commande", path: "/achats/bons-de-commande" },
  { id: "receptions", label: "Réceptions", path: "/achats/receptions" },
  { id: "supplier-invoices", label: "Factures fournisseurs", path: "/achats/factures-fournisseurs" },
];

export default function AchatsModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/achats/bons-de-commande" replace />} />
      <Route
        path="bons-de-commande"
        element={
          <MainLayout
            title="Achats"
            subtitle="Gestion des achats et fournisseurs"
            moduleTabs={tabs}
            moduleName="Achats"
          >
            <PurchaseOrders />
          </MainLayout>
        }
      />
      <Route
        path="receptions"
        element={
          <MainLayout
            title="Achats"
            subtitle="Gestion des achats et fournisseurs"
            moduleTabs={tabs}
            moduleName="Achats"
          >
            <Receptions />
          </MainLayout>
        }
      />
      <Route
        path="factures-fournisseurs"
        element={
          <MainLayout
            title="Achats"
            subtitle="Gestion des achats et fournisseurs"
            moduleTabs={tabs}
            moduleName="Achats"
          >
            <ComingSoon title="Factures fournisseurs" subtitle="Factures reçues des fournisseurs" />
          </MainLayout>
        }
      />
    </Routes>
  );
}
