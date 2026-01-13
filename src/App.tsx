import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AchatsModule from "./pages/modules/AchatsModule";
import VentesModule from "./pages/modules/VentesModule";
import StockModule from "./pages/modules/StockModule";
import FinanceModule from "./pages/modules/FinanceModule";
import ComptabiliteModule from "./pages/modules/ComptabiliteModule";
import RHModule from "./pages/modules/RHModule";
import SettingsModule from "./pages/modules/SettingsModule";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import DocumentPreview from "./pages/DocumentPreview";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Modules avec navigation par onglets */}
          <Route path="/achats/*" element={<AchatsModule />} />
          <Route path="/ventes/*" element={<VentesModule />} />
          <Route path="/stock/*" element={<StockModule />} />
          <Route path="/finance/*" element={<FinanceModule />} />
          <Route path="/comptabilite/*" element={<ComptabiliteModule />} />
          <Route path="/rh/*" element={<RHModule />} />
          <Route path="/parametres/*" element={<SettingsModule />} />
          
          {/* Redirections pour compatibilité avec anciennes routes */}
          <Route path="/purchase-orders" element={<Navigate to="/achats/bons-de-commande" replace />} />
          <Route path="/receptions" element={<Navigate to="/achats/receptions" replace />} />
          <Route path="/supplier-invoices" element={<Navigate to="/achats/factures-fournisseurs" replace />} />
          <Route path="/quotes" element={<Navigate to="/ventes/devis" replace />} />
          <Route path="/invoices" element={<Navigate to="/ventes/factures" replace />} />
          <Route path="/inventory" element={<Navigate to="/stock/inventaire" replace />} />
          <Route path="/stock-movements" element={<Navigate to="/stock/mouvements" replace />} />
          <Route path="/stock-alerts" element={<Navigate to="/stock/alertes" replace />} />
          <Route path="/warehouses" element={<Navigate to="/stock/depots" replace />} />
          <Route path="/treasury" element={<Navigate to="/finance/tresorerie" replace />} />
          <Route path="/banks" element={<Navigate to="/finance/banques" replace />} />
          <Route path="/payment-schedules" element={<Navigate to="/finance/echeanciers" replace />} />
          <Route path="/reconciliations" element={<Navigate to="/finance/rapprochements" replace />} />
          <Route path="/chart-of-accounts" element={<Navigate to="/comptabilite/plan-comptable" replace />} />
          <Route path="/journal-entries" element={<Navigate to="/comptabilite/ecritures" replace />} />
          <Route path="/general-ledger" element={<Navigate to="/comptabilite/grand-livre" replace />} />
          <Route path="/trial-balance" element={<Navigate to="/comptabilite/balance" replace />} />
          <Route path="/settings" element={<Navigate to="/parametres/societe" replace />} />
          
          {/* Documents */}
          <Route path="/documents/preview" element={<DocumentPreview />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
