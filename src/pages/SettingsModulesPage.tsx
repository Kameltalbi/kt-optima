import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsInvoicing from "./SettingsInvoicing";
import { AccountingSettings } from "./SettingsSections";
import SettingsPayroll from "./SettingsPayroll";
import SettingsTemplates from "./SettingsTemplates";
import ComingSoon from "./ComingSoon";
import { ResponsiveTabs, ResponsiveTabsContent } from "@/components/settings/ResponsiveTabs";
import { 
  UserCircle, 
  ShoppingCart, 
  Package, 
  Wallet, 
  Calculator, 
  UserCheck, 
  Car,
  Building2,
} from "lucide-react";

export default function SettingsModulesPage() {
  const [activeModule, setActiveModule] = useState<string>("ventes");

  // Modules disponibles (peut être filtré selon les modules actifs)
  const modules = [
    { id: "crm", label: "CRM", icon: UserCircle, enabled: true },
    { id: "ventes", label: "Ventes", icon: ShoppingCart, enabled: true },
    { id: "achats", label: "Achats", icon: Building2, enabled: true },
    { id: "stock", label: "Stock", icon: Package, enabled: true },
    { id: "finance", label: "Finance", icon: Wallet, enabled: true },
    { id: "comptabilite", label: "Comptabilité", icon: Calculator, enabled: true },
    { id: "rh", label: "Ressources humaines", icon: UserCheck, enabled: true },
    { id: "parc", label: "Gestion de parc", icon: Car, enabled: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres par module</h2>
        <p className="text-muted-foreground mt-1">
          Configuration spécifique à chaque module
        </p>
      </div>

      <ResponsiveTabs
        value={activeModule}
        onValueChange={setActiveModule}
        items={modules.map(m => ({ value: m.id, label: m.label }))}
      >
        <ResponsiveTabsContent value="crm" className="mt-6">
          <ComingSoon 
            title="Paramètres CRM" 
            subtitle="Statuts clients/prospects, sources de leads, champs personnalisés, règles de qualification" 
          />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="ventes" className="mt-6">
          <div className="space-y-6">
            <SettingsInvoicing />
            <SettingsTemplates />
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Conditions de paiement</CardTitle>
                <CardDescription className="text-xs">
                  Conditions de paiement par défaut pour les factures clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComingSoon title="Conditions de paiement" subtitle="À venir" />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Règles de remise et d'avoir</CardTitle>
                <CardDescription className="text-xs">
                  Configuration des règles de remise et de gestion des avoirs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComingSoon title="Règles de remise" subtitle="À venir" />
              </CardContent>
            </Card>
          </div>
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="achats" className="mt-6">
          <ComingSoon 
            title="Paramètres Achats" 
            subtitle="Numérotation factures fournisseurs, délais de paiement, réceptions, comptes fournisseurs par défaut" 
          />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="stock" className="mt-6">
          <ComingSoon 
            title="Paramètres Stock" 
            subtitle="Dépôts, méthode de valorisation (FIFO, CMP), alertes de stock, autoriser stock négatif" 
          />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="finance" className="mt-6">
          <ComingSoon 
            title="Paramètres Finance" 
            subtitle="Comptes bancaires & caisses, modes de paiement, règles d'échéanciers, règles de rapprochement" 
          />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="comptabilite" className="mt-6">
          <AccountingSettings />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="rh" className="mt-6">
          <SettingsPayroll />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="parc" className="mt-6">
          <ComingSoon 
            title="Paramètres Gestion de parc" 
            subtitle="Types de véhicules/équipements, règles d'affectation, suivi des coûts, alertes maintenance" 
          />
        </ResponsiveTabsContent>
      </ResponsiveTabs>
    </div>
  );
}
