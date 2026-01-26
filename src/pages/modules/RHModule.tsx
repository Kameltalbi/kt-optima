import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Employees from "../Employees";
import HRContracts from "../HRContracts";
import PayrollNew from "../PayrollNew";
import PayrollSimple from "../PayrollSimple";
import Leaves from "../Leaves";
import HRDocuments from "../HRDocuments";
import Evaluations from "../Evaluations";
import ExpenseNotes from "../ExpenseNotes";
import ExpenseCategories from "../ExpenseCategories";

const tabs: ModuleTab[] = [
  { id: "employees", label: "Employés", path: "/rh/employes" },
  { id: "contracts", label: "Contrats", path: "/rh/contrats" },
  { id: "payroll", label: "Paie", path: "/rh/paie" },
  { id: "leaves", label: "Absences", path: "/rh/absences" },
  { id: "expense-notes", label: "Notes de frais", path: "/rh/notes-de-frais" },
  { id: "expense-categories", label: "Catégories", path: "/rh/categories-depenses" },
  { id: "documents", label: "Documents", path: "/rh/documents" },
  { id: "evaluations", label: "Évaluations", path: "/rh/evaluations" },
];

export default function RHModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/rh/employes" replace />} />
      <Route
        path="employes"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <Employees />
          </MainLayout>
        }
      />
      <Route
        path="contrats"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <HRContracts />
          </MainLayout>
        }
      />
      <Route
        path="paie"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <PayrollSimple />
          </MainLayout>
        }
      />
      <Route
        path="absences"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <Leaves />
          </MainLayout>
        }
      />
      <Route
        path="documents"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <HRDocuments />
          </MainLayout>
        }
      />
      <Route
        path="evaluations"
        element={
          <MainLayout
            title="Ressources humaines – Avancé"
            subtitle="Gestion complète des ressources humaines"
            moduleTabs={tabs}
            moduleName="Ressources humaines"
          >
            <Evaluations />
          </MainLayout>
        }
      />
    </Routes>
  );
}
