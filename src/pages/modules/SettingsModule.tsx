import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Settings from "../Settings";
import ComingSoon from "../ComingSoon";

const tabs: ModuleTab[] = [
  { id: "company", label: "Société", path: "/parametres/societe" },
  { id: "users", label: "Utilisateurs", path: "/parametres/utilisateurs" },
  { id: "accounting", label: "Comptabilité", path: "/parametres/comptabilite" },
  { id: "numbering", label: "Numérotation", path: "/parametres/numerotation" },
];

export default function SettingsModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/parametres/societe" replace />} />
      <Route
        path="societe"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <Settings />
          </MainLayout>
        }
      />
      <Route
        path="utilisateurs"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <ComingSoon title="Utilisateurs" subtitle="Gestion des utilisateurs" />
          </MainLayout>
        }
      />
      <Route
        path="comptabilite"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <ComingSoon title="Comptabilité" subtitle="Configuration comptable" />
          </MainLayout>
        }
      />
      <Route
        path="numerotation"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <ComingSoon title="Numérotation" subtitle="Configuration des numéros de documents" />
          </MainLayout>
        }
      />
    </Routes>
  );
}
