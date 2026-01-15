import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Quotes from "../Quotes";
import Invoices from "../Invoices";
import ClientCredits from "../ClientCredits";
import DeliveryNotes from "../DeliveryNotes";
import ComingSoon from "../ComingSoon";
import Encaissements from "../Encaissements";
import FactureAcompte from "../FactureAcompte";

const tabs: ModuleTab[] = [
  { id: "quotes", label: "Devis", path: "/ventes/devis" },
  { id: "invoices", label: "Factures clients", path: "/ventes/factures" },
  { id: "acomptes", label: "Factures d'acompte", path: "/ventes/factures-acompte" },
  { id: "delivery", label: "Bons de livraison", path: "/ventes/bons-livraison" },
  { id: "credits", label: "Avoirs clients", path: "/ventes/avoirs" },
  { id: "payments", label: "Encaissements", path: "/ventes/encaissements" },
];

export default function VentesModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ventes/devis" replace />} />
      <Route
        path="devis"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Quotes />
          </MainLayout>
        }
      />
      <Route
        path="factures"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Invoices />
          </MainLayout>
        }
      />
      <Route
        path="bons-livraison"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <DeliveryNotes />
          </MainLayout>
        }
      />
      <Route
        path="avoirs"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <ClientCredits />
          </MainLayout>
        }
      />
      <Route
        path="factures-acompte"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <FactureAcompte />
          </MainLayout>
        }
      />
      <Route
        path="encaissements"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Encaissements />
          </MainLayout>
        }
      />
    </Routes>
  );
}
