import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ProtectedRoute } from "@/guards/ProtectedRoute";
import Landing from "./pages/Landing";
import Modules from "./pages/Modules";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AchatsModule from "./pages/modules/AchatsModule";
import VentesModule from "./pages/modules/VentesModule";
import StockModule from "./pages/modules/StockModule";
import FinanceModule from "./pages/modules/FinanceModule";
import ComptabiliteModule from "./pages/modules/ComptabiliteModule";
import RHModule from "./pages/modules/RHModule";
import SettingsModule from "./pages/modules/SettingsModule";
import FleetModule from "./pages/modules/FleetModule";
import CRMModule from "./pages/modules/CRMModule";
import ExpenseNotes from "./pages/ExpenseNotes";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import DocumentPreview from "./pages/DocumentPreview";
import InvoicePreviewPage from "./pages/documents/InvoicePreviewPage";
import QuotePreviewPage from "./pages/documents/QuotePreviewPage";
import CreditNotePreviewPage from "./pages/documents/CreditNotePreviewPage";
import {
  SuperAdminDashboard,
  SuperAdminCompanies,
  SuperAdminUsers,
  SuperAdminSettings,
  SuperAdminLogs,
} from "./pages/superadmin";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing Page (Public) */}
            <Route path="/" element={<Landing />} />
            
            {/* Modules Page (Public) */}
            <Route path="/modules" element={<Modules />} />
            
            {/* Demo Page (Public) */}
            <Route path="/demo" element={<Demo />} />
            
            {/* Contact Page (Public) */}
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth Pages (Public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Users Management - Admin only */}
            <Route path="/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/superadmin" element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/superadmin/companies" element={
              <ProtectedRoute>
                <SuperAdminCompanies />
              </ProtectedRoute>
            } />
            <Route path="/superadmin/users" element={
              <ProtectedRoute>
                <SuperAdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/superadmin/settings" element={
              <ProtectedRoute>
                <SuperAdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/superadmin/logs" element={
              <ProtectedRoute>
                <SuperAdminLogs />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard if authenticated, else landing */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          
            {/* Modules avec navigation par onglets (Protected) */}
            <Route path="/achats/*" element={
              <ProtectedRoute>
                <AchatsModule />
              </ProtectedRoute>
            } />
            <Route path="/ventes/*" element={
              <ProtectedRoute>
                <VentesModule />
              </ProtectedRoute>
            } />
            <Route path="/stock/*" element={
              <ProtectedRoute>
                <StockModule />
              </ProtectedRoute>
            } />
            <Route path="/finance/*" element={
              <ProtectedRoute>
                <FinanceModule />
              </ProtectedRoute>
            } />
            <Route path="/comptabilite/*" element={
              <ProtectedRoute>
                <ComptabiliteModule />
              </ProtectedRoute>
            } />
            <Route path="/rh/*" element={
              <ProtectedRoute>
                <RHModule />
              </ProtectedRoute>
            } />
            <Route path="/parametres/*" element={
              <ProtectedRoute>
                <SettingsModule />
              </ProtectedRoute>
            } />
            <Route path="/parc/*" element={
              <ProtectedRoute>
                <FleetModule />
              </ProtectedRoute>
            } />
            <Route path="/crm/*" element={
              <ProtectedRoute>
                <CRMModule />
              </ProtectedRoute>
            } />
          
          {/* Redirections pour compatibilité avec anciennes routes */}
          <Route path="/clients" element={<Navigate to="/crm/clients" replace />} />
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
          
          {/* Documents Preview */}
          <Route path="/documents/invoices/:id" element={
            <ProtectedRoute>
              <InvoicePreviewPage />
            </ProtectedRoute>
          } />
          <Route path="/documents/quotes/:id" element={
            <ProtectedRoute>
              <QuotePreviewPage />
            </ProtectedRoute>
          } />
          <Route path="/documents/credit-notes/:id" element={
            <ProtectedRoute>
              <CreditNotePreviewPage />
            </ProtectedRoute>
          } />
          <Route path="/documents/preview" element={<DocumentPreview />} />
          
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
