import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Clients from "../Clients";
import ClientDetail from "../ClientDetail";
import CRMContacts from "../CRMContacts";
import CRMCompanies from "../CRMCompanies";
import CRMOpportunities from "../CRMOpportunities";
import CRMPipeline from "../CRMPipeline";
import CRMActivities from "../CRMActivities";

export default function CRMModule() {
  const moduleName = "CRM";
  const tabs: ModuleTab[] = [
    { id: "clients", label: "Clients", path: "/crm/clients" },
    { id: "contacts", label: "Contacts", path: "/crm/contacts" },
    { id: "companies", label: "Sociétés", path: "/crm/societes" },
    { id: "opportunities", label: "Opportunités", path: "/crm/opportunites" },
    { id: "pipeline", label: "Pipeline", path: "/crm/pipeline" },
    { id: "activities", label: "Activités", path: "/crm/activites" },
  ];

  return (
    <Routes>
      <Route path="clients" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <Clients />
        </MainLayout>
      } />
      <Route path="clients/:id" element={<ClientDetail />} />
      <Route path="contacts" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <CRMContacts />
        </MainLayout>
      } />
      <Route path="societes" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <CRMCompanies />
        </MainLayout>
      } />
      <Route path="opportunites" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <CRMOpportunities />
        </MainLayout>
      } />
      <Route path="pipeline" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <CRMPipeline />
        </MainLayout>
      } />
      <Route path="activites" element={
        <MainLayout
          title={moduleName}
          subtitle="Gestion de la relation client"
          moduleTabs={tabs}
          moduleName={moduleName}
        >
          <CRMActivities />
        </MainLayout>
      } />
      <Route path="" element={<Navigate to="clients" replace />} />
    </Routes>
  );
}
