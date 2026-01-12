import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Treasury from "./pages/Treasury";
import Settings from "./pages/Settings";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Tableau de bord */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/crm" element={<ComingSoon title="CRM" subtitle="Gestion de la relation client" />} />
          
          {/* Commercial */}
          <Route path="/clients" element={<Clients />} />
          <Route path="/quotes" element={<ComingSoon title="Devis" subtitle="Gestion des devis clients" />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/delivery-notes" element={<ComingSoon title="Bons de livraison" subtitle="Suivi des livraisons" />} />
          <Route path="/sales-stats" element={<ComingSoon title="Statistiques ventes" subtitle="Analyses commerciales" />} />
          
          {/* Achats */}
          <Route path="/suppliers" element={<ComingSoon title="Fournisseurs" subtitle="Gestion des fournisseurs" />} />
          <Route path="/purchase-orders" element={<ComingSoon title="Commandes" subtitle="Commandes fournisseurs" />} />
          <Route path="/receptions" element={<ComingSoon title="Réceptions" subtitle="Réception des marchandises" />} />
          <Route path="/supplier-invoices" element={<ComingSoon title="Factures fournisseurs" subtitle="Factures d'achat" />} />
          
          {/* Stock */}
          <Route path="/inventory" element={<ComingSoon title="Inventaire" subtitle="Gestion de l'inventaire" />} />
          <Route path="/stock-movements" element={<ComingSoon title="Mouvements" subtitle="Mouvements de stock" />} />
          <Route path="/stock-alerts" element={<ComingSoon title="Alertes stock" subtitle="Alertes de réapprovisionnement" />} />
          <Route path="/warehouses" element={<ComingSoon title="Dépôts" subtitle="Gestion des entrepôts" />} />
          
          {/* Finance */}
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/banks" element={<ComingSoon title="Banques" subtitle="Comptes bancaires" />} />
          <Route path="/payment-schedules" element={<ComingSoon title="Échéanciers" subtitle="Échéances de paiement" />} />
          <Route path="/reconciliations" element={<ComingSoon title="Rapprochements" subtitle="Rapprochements bancaires" />} />
          
          {/* Comptabilité */}
          <Route path="/chart-of-accounts" element={<ComingSoon title="Plan comptable" subtitle="Structure comptable" />} />
          <Route path="/journal-entries" element={<ComingSoon title="Écritures" subtitle="Saisie comptable" />} />
          <Route path="/general-ledger" element={<ComingSoon title="Grand livre" subtitle="Historique des comptes" />} />
          <Route path="/trial-balance" element={<ComingSoon title="Balance" subtitle="Balance générale" />} />
          <Route path="/tax-declarations" element={<ComingSoon title="Déclarations fiscales" subtitle="TVA et impôts" />} />
          
          {/* RH */}
          <Route path="/employees" element={<ComingSoon title="Employés" subtitle="Gestion du personnel" />} />
          <Route path="/attendance" element={<ComingSoon title="Présences" subtitle="Suivi des présences" />} />
          <Route path="/leaves" element={<ComingSoon title="Congés" subtitle="Gestion des congés" />} />
          <Route path="/payroll" element={<ComingSoon title="Paie" subtitle="Bulletins de paie" />} />
          
          {/* Paramètres */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/company" element={<Settings />} />
          <Route path="/settings/users" element={<Settings />} />
          <Route path="/settings/taxes" element={<Settings />} />
          <Route path="/settings/config" element={<Settings />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
