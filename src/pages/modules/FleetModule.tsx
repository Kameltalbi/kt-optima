import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Equipment from "../Equipment";
import Maintenance from "../Maintenance";
import FleetAlerts from "../FleetAlerts";

export default function FleetModule() {
  const moduleName = "Gestion de parc";
  const tabs: ModuleTab[] = [
    { id: "equipment", label: "Équipements", path: "/parc/equipements" },
    { id: "maintenance", label: "Entretiens", path: "/parc/entretiens" },
    { id: "alerts", label: "Alertes", path: "/parc/alertes" },
  ];

  return (
    <Routes>
      <Route path="equipements" element={
        <MainLayout
          title={moduleName}
          subtitle="Suivi des équipements et entretiens"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <Equipment />
        </MainLayout>
      } />
      <Route path="entretiens" element={
        <MainLayout
          title={moduleName}
          subtitle="Suivi des équipements et entretiens"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <Maintenance />
        </MainLayout>
      } />
      <Route path="alertes" element={
        <MainLayout
          title={moduleName}
          subtitle="Suivi des équipements et entretiens"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <FleetAlerts />
        </MainLayout>
      } />
      <Route path="" element={<Navigate to="equipements" replace />} />
    </Routes>
  );
}
