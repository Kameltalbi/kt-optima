import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTabs } from "@/components/layout/ModuleTabs";
import Clients from "../Clients";
import ClientDetail from "../ClientDetail";
import CRMContacts from "../CRMContacts";
import CRMCompanies from "../CRMCompanies";
import CRMOpportunities from "../CRMOpportunities";
import CRMPipeline from "../CRMPipeline";
import CRMActivities from "../CRMActivities";

export default function CRMModule() {
  const moduleName = "CRM";
  const tabs = [
    { id: "clients", label: "Clients", path: "/crm/clients" },
    { id: "contacts", label: "Contacts", path: "/crm/contacts" },
    { id: "companies", label: "Sociétés", path: "/crm/societes" },
    { id: "opportunities", label: "Opportunités", path: "/crm/opportunites" },
    { id: "pipeline", label: "Pipeline", path: "/crm/pipeline" },
    { id: "activities", label: "Activités", path: "/crm/activites" },
  ];

  return (
    <MainLayout title={moduleName} subtitle="Gestion de la relation client">
      <ModuleTabs moduleName={moduleName} tabs={tabs} />
      <Routes>
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="contacts" element={<CRMContacts />} />
        <Route path="societes" element={<CRMCompanies />} />
        <Route path="opportunites" element={<CRMOpportunities />} />
        <Route path="pipeline" element={<CRMPipeline />} />
        <Route path="activites" element={<CRMActivities />} />
        <Route path="" element={<Navigate to="clients" replace />} />
      </Routes>
    </MainLayout>
  );
}
