import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTabs } from "@/components/layout/ModuleTabs";
import CRMContacts from "../CRMContacts";
import CRMCompanies from "../CRMCompanies";
import CRMOpportunities from "../CRMOpportunities";
import CRMPipeline from "../CRMPipeline";
import CRMActivities from "../CRMActivities";

export default function CRMModule() {
  const moduleName = "CRM";
  const tabs = [
    { id: "contacts", label: "Contacts", path: "/crm/contacts" },
    { id: "companies", label: "Sociétés", path: "/crm/societes" },
    { id: "opportunities", label: "Opportunités", path: "/crm/opportunites" },
    { id: "pipeline", label: "Pipeline", path: "/crm/pipeline" },
    { id: "activities", label: "Activités", path: "/crm/activites" },
  ];

  return (
    <MainLayout title={moduleName} subtitle="Suivi commercial et gestion des opportunités">
      <ModuleTabs moduleName={moduleName} tabs={tabs} />
      <Routes>
        <Route path="contacts" element={<CRMContacts />} />
        <Route path="societes" element={<CRMCompanies />} />
        <Route path="opportunites" element={<CRMOpportunities />} />
        <Route path="pipeline" element={<CRMPipeline />} />
        <Route path="activites" element={<CRMActivities />} />
        <Route path="" element={<Navigate to="contacts" replace />} />
      </Routes>
    </MainLayout>
  );
}
