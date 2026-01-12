import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Treasury from "./pages/Treasury";
import Settings from "./pages/Settings";
import Purchases from "./pages/Purchases";
import CRM from "./pages/CRM";
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/suppliers" element={<ComingSoon title="Fournisseurs" subtitle="Gestion des fournisseurs" />} />
          <Route path="/projects" element={<ComingSoon title="Projets" subtitle="Gestion de projets et budgets" />} />
          <Route path="/reports" element={<ComingSoon title="Rapports" subtitle="Analyses et statistiques" />} />
          <Route path="/stock" element={<ComingSoon title="Stock" subtitle="Gestion des stocks" />} />
          <Route path="/hr" element={<ComingSoon title="Ressources Humaines" subtitle="Gestion du personnel" />} />
          <Route path="/expenses" element={<ComingSoon title="Dépenses" subtitle="Suivi des dépenses internes" />} />
          <Route path="/accounting" element={<ComingSoon title="Comptabilité" subtitle="Journaux et TVA" />} />
          
          <Route path="/notifications" element={<ComingSoon title="Notifications" subtitle="Centre de notifications" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
