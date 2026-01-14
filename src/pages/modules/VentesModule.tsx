import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ModuleTab } from "@/components/layout/ModuleTabs";
import Quotes from "../Quotes";
import Invoices from "../Invoices";
import Clients from "../Clients";
import ClientCredits from "../ClientCredits";
import DeliveryNotes from "../DeliveryNotes";
import ComingSoon from "../ComingSoon";

const tabs: ModuleTab[] = [
  { id: "clients", label: "Clients", path: "/ventes/clients" },
  { id: "quotes", label: "Devis", path: "/ventes/devis" },
  { id: "invoices", label: "Factures clients", path: "/ventes/factures" },
  { id: "delivery", label: "Bons de livraison", path: "/ventes/bons-livraison" },
  { id: "credits", label: "Avoirs clients", path: "/ventes/avoirs" },
  { id: "payments", label: "Encaissements", path: "/ventes/encaissements" },
];

export default function VentesModule() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ventes/clients" replace />} />
      <Route
        path="clients"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <Clients />
          </MainLayout>
        }
      />
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
        path="encaissements"
        element={
          <MainLayout
            title="Ventes"
            subtitle="Gestion des ventes et clients"
            moduleTabs={tabs}
            moduleName="Ventes"
          >
            <ComingSoon title="Encaissements" subtitle="Gestion des encaissements clients" />
          </MainLayout>
        }
      />
    </Routes>
  );
}
