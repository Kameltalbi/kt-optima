import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsInvoicing from "./SettingsInvoicing";
import { AccountingSettings } from "./SettingsSections";
import SettingsPayrollComplete from "./SettingsPayrollComplete";
import SettingsTemplates from "./SettingsTemplates";
import ComingSoon from "./ComingSoon";
import SettingsPurchaseValidation from "./SettingsPurchaseValidation";
import DefaultValidatorsConfig from "@/components/purchase-request/DefaultValidatorsConfig";
import { ResponsiveTabs, ResponsiveTabsContent } from "@/components/settings/ResponsiveTabs";
import { usePlan } from "@/hooks/use-plan";
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
  const { features } = usePlan();
  
  // Modules disponibles filtrés selon le plan
  const modules = useMemo(() => {
    const allModules = [
      { id: "crm", label: "CRM", icon: UserCircle, feature: "crm" },
      { id: "ventes", label: "Ventes", icon: ShoppingCart, feature: "ventes" },
      { id: "achats", label: "Achats", icon: Building2, feature: "achats" },
      { id: "stock", label: "Stock", icon: Package, feature: "stocks" },
      { id: "finance", label: "Finance", icon: Wallet, feature: "tresorerie" },
      { id: "comptabilite", label: "Comptabilité", icon: Calculator, feature: "comptabilite" },
      { id: "rh", label: "Ressources humaines", icon: UserCheck, feature: "rh" },
      { id: "parc", label: "Gestion de parc", icon: Car, feature: "parc" },
    ];

    return allModules.filter(module => {
      switch (module.feature) {
        case "crm":
          return features.crm;
        case "ventes":
          return features.ventes;
        case "achats":
          return features.achats;
        case "stocks":
          return features.stocks;
        case "tresorerie":
          return features.tresorerie !== false;
        case "comptabilite":
          return features.comptabilite;
        case "rh":
          return features.rh;
        case "parc":
          return features.parc;
        default:
          return true;
      }
    });
  }, [features]);

  const [activeModule, setActiveModule] = useState<string>("ventes");

  // Mettre à jour le module actif si le module actuel n'est plus disponible
  useEffect(() => {
    if (modules.length > 0) {
      const isCurrentModuleAvailable = modules.some(m => m.id === activeModule);
      if (!isCurrentModuleAvailable) {
        setActiveModule(modules[0].id);
      }
    }
  }, [modules, activeModule]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres par module</h2>
        <p className="text-muted-foreground mt-1">
          Configuration spécifique à chaque module
        </p>
      </div>

      {modules.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucun module disponible dans votre plan actuel.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ResponsiveTabs
          value={activeModule}
          onValueChange={setActiveModule}
          items={modules.map(m => ({ value: m.id, label: m.label, icon: m.icon }))}
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
          <div className="space-y-6">
            <SettingsPurchaseValidation />
            <DefaultValidatorsConfig />
          </div>
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
          <SettingsPayrollComplete />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="parc" className="mt-6">
          <ComingSoon 
            title="Paramètres Gestion de parc" 
            subtitle="Types de véhicules/équipements, règles d'affectation, suivi des coûts, alertes maintenance" 
          />
        </ResponsiveTabsContent>
      </ResponsiveTabs>
      )}
    </div>
  );
}
