import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import SettingsGeneral from "../SettingsGeneral";
import SettingsUsersSecurity from "../SettingsUsersSecurity";
import SettingsModulesPage from "../SettingsModulesPage";
import SettingsSystem from "../SettingsSystem";
import SettingsModules from "../SettingsModules";
import ProductsServicesModule from "./ProductsServicesModule";
import SettingsDocuments from "../SettingsDocuments";
import SettingsPurchaseValidation from "../SettingsPurchaseValidation";

const tabs: ModuleTab[] = [
  { id: "general", label: "Général", path: "/parametres/general" },
  { id: "users-security", label: "Utilisateurs & Sécurité", path: "/parametres/utilisateurs-securite" },
  { id: "modules", label: "Modules", path: "/parametres/modules" },
  { id: "system", label: "Système", path: "/parametres/systeme" },
];

export default function SettingsModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/parametres/general" replace />} />
      
      {/* Section Général */}
      <Route
        path="general"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsGeneral />
          </MainLayout>
        }
      />

      {/* Section Utilisateurs & Sécurité */}
      <Route
        path="utilisateurs-securite"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsUsersSecurity />
          </MainLayout>
        }
      />

      {/* Section Modules */}
      <Route
        path="modules"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsModulesPage />
          </MainLayout>
        }
      />

      {/* Section Système */}
      <Route
        path="systeme"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsSystem />
          </MainLayout>
        }
      />

      {/* Routes de compatibilité pour les anciens liens */}
      <Route
        path="societe"
        element={<Navigate to="/parametres/general" replace />}
      />
      <Route
        path="utilisateurs"
        element={<Navigate to="/parametres/utilisateurs-securite" replace />}
      />
      <Route
        path="roles"
        element={<Navigate to="/parametres/utilisateurs-securite" replace />}
      />
      <Route
        path="permissions"
        element={<Navigate to="/parametres/utilisateurs-securite" replace />}
      />
      <Route
        path="taxes"
        element={<Navigate to="/parametres/general" replace />}
      />
      <Route
        path="facturation"
        element={<Navigate to="/parametres/modules" replace />}
      />
      <Route
        path="comptabilite"
        element={<Navigate to="/parametres/modules" replace />}
      />
      <Route
        path="modeles"
        element={<Navigate to="/parametres/modules" replace />}
      />
      <Route
        path="regional"
        element={<Navigate to="/parametres/general" replace />}
      />
      <Route
        path="documents"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsDocuments />
          </MainLayout>
        }
      />
      <Route
        path="produits-services/*"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <ProductsServicesModule />
          </MainLayout>
        }
      />
      <Route
        path="paie"
        element={<Navigate to="/parametres/modules" replace />}
      />
      <Route
        path="achats/validation-paliers"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsPurchaseValidation />
          </MainLayout>
        }
      />
    </Routes>
  );
}
