import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import PurchaseOrders from "../PurchaseOrders";
import Receptions from "../Receptions";
import Suppliers from "../Suppliers";
import SupplierCredits from "../SupplierCredits";
import ComingSoon from "../ComingSoon";

const tabs: ModuleTab[] = [
  { id: "suppliers", label: "Fournisseurs", path: "/achats/fournisseurs" },
  { id: "purchase-orders", label: "Bons de commande", path: "/achats/bons-de-commande" },
  { id: "receptions", label: "Réceptions", path: "/achats/receptions" },
  { id: "supplier-invoices", label: "Factures fournisseurs", path: "/achats/factures-fournisseurs" },
  { id: "supplier-credits", label: "Avoirs fournisseurs", path: "/achats/avoirs-fournisseurs" },
];

export default function AchatsModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/achats/fournisseurs" replace />} />
      <Route
        path="fournisseurs"
        element={
          <MainLayout
            title="Achats"
            subtitle="Gestion des achats et fournisseurs"
            moduleTabs={tabs}
            moduleName="Achats"
          >
            <Suppliers />
          </MainLayout>
        }
      />
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
      <Route
        path="avoirs-fournisseurs"
        element={
          <MainLayout
            title="Achats"
            subtitle="Gestion des achats et fournisseurs"
            moduleTabs={tabs}
            moduleName="Achats"
          >
            <SupplierCredits />
          </MainLayout>
        }
      />
    </Routes>
  );
}
