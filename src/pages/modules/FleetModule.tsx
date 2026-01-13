import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTabs } from "@/components/layout/ModuleTabs";
import Equipment from "../Equipment";
import Maintenance from "../Maintenance";
import FleetAlerts from "../FleetAlerts";

export default function FleetModule() {
  const moduleName = "Gestion de parc";
  const tabs = [
    { id: "equipment", label: "Équipements", path: "/parc/equipements" },
    { id: "maintenance", label: "Entretiens", path: "/parc/entretiens" },
    { id: "alerts", label: "Alertes", path: "/parc/alertes" },
  ];

  return (
    <MainLayout title={moduleName} subtitle="Suivi des équipements et entretiens">
      <ModuleTabs moduleName={moduleName} tabs={tabs} />
      <Routes>
        <Route path="equipements" element={<Equipment />} />
        <Route path="entretiens" element={<Maintenance />} />
        <Route path="alertes" element={<FleetAlerts />} />
        <Route path="" element={<Navigate to="equipements" replace />} />
      </Routes>
    </MainLayout>
  );
}
