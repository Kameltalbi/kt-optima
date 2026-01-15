import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import SettingsCompany from "../SettingsCompany";
import ComingSoon from "../ComingSoon";
import ProductsServicesModule from "./ProductsServicesModule";
import { TaxesSettings, RegionalSettings, AccountingSettings } from "../SettingsSections";
import SettingsUsers from "../SettingsUsers";
import SettingsRoles from "../SettingsRoles";
import SettingsModules from "../SettingsModules";
import SettingsPermissions from "../SettingsPermissions";
import SettingsInvoicing from "../SettingsInvoicing";
import SettingsTemplates from "../SettingsTemplates";
import SettingsDocuments from "../SettingsDocuments";
import SettingsPayroll from "../SettingsPayroll";

const tabs: ModuleTab[] = [
  { id: "company", label: "Société", path: "/parametres/societe" },
  { id: "products-services", label: "Produits & Services", path: "/parametres/produits-services" },
  { id: "users", label: "Utilisateurs", path: "/parametres/utilisateurs" },
  { id: "roles", label: "Rôles", path: "/parametres/roles" },
  { id: "permissions", label: "Permissions", path: "/parametres/permissions" },
  { id: "modules", label: "Modules", path: "/parametres/modules" },
  { id: "taxes", label: "Taxes et TVA", path: "/parametres/taxes" },
  { id: "invoicing", label: "Facturation", path: "/parametres/facturation" },
  { id: "accounting", label: "Comptabilité", path: "/parametres/comptabilite" },
  { id: "templates", label: "Modèles", path: "/parametres/modeles" },
  { id: "regional", label: "Régional", path: "/parametres/regional" },
  { id: "documents", label: "Documents", path: "/parametres/documents" },
  { id: "payroll", label: "Paie", path: "/parametres/paie" },
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
            <SettingsCompany />
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
            <SettingsUsers />
          </MainLayout>
        }
      />
      <Route
        path="roles"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsRoles />
          </MainLayout>
        }
      />
      <Route
        path="permissions"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsPermissions />
          </MainLayout>
        }
      />
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
            <SettingsModules />
          </MainLayout>
        }
      />
      <Route
        path="taxes"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <TaxesSettings />
          </MainLayout>
        }
      />
      <Route
        path="facturation"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsInvoicing />
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
            <AccountingSettings />
          </MainLayout>
        }
      />
      <Route
        path="modeles"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsTemplates />
          </MainLayout>
        }
      />
      <Route
        path="regional"
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <RegionalSettings />
          </MainLayout>
        }
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
        element={
          <MainLayout
            title="Paramètres"
            subtitle="Configuration de l'application"
            moduleTabs={tabs}
            moduleName="Paramètres"
            hideSidebar={true}
            showBackButton={true}
          >
            <SettingsPayroll />
          </MainLayout>
        }
      />
    </Routes>
  );
}
