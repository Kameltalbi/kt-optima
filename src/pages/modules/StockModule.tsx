import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Inventory from "../Inventory";
import StockMovements from "../StockMovements";
import StockAlerts from "../StockAlerts";
import Warehouses from "../Warehouses";

const tabs: ModuleTab[] = [
  { id: "inventory", label: "Inventaire", path: "/stock/inventaire" },
  { id: "movements", label: "Mouvements", path: "/stock/mouvements" },
  { id: "alerts", label: "Alertes", path: "/stock/alertes" },
  { id: "warehouses", label: "Dépôts", path: "/stock/depots" },
];

export default function StockModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/stock/inventaire" replace />} />
      <Route
        path="inventaire"
        element={
          <MainLayout
            title="Stock"
            subtitle="Gestion des stocks et inventaires"
            moduleTabs={tabs}
            moduleName="Stock"
          >
            <Inventory />
          </MainLayout>
        }
      />
      <Route
        path="mouvements"
        element={
          <MainLayout
            title="Stock"
            subtitle="Gestion des stocks et inventaires"
            moduleTabs={tabs}
            moduleName="Stock"
          >
            <StockMovements />
          </MainLayout>
        }
      />
      <Route
        path="alertes"
        element={
          <MainLayout
            title="Stock"
            subtitle="Gestion des stocks et inventaires"
            moduleTabs={tabs}
            moduleName="Stock"
          >
            <StockAlerts />
          </MainLayout>
        }
      />
      <Route
        path="depots"
        element={
          <MainLayout
            title="Stock"
            subtitle="Gestion des stocks et inventaires"
            moduleTabs={tabs}
            moduleName="Stock"
          >
            <Warehouses />
          </MainLayout>
        }
      />
    </Routes>
  );
}
