import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SettingsCompany from "./SettingsCompany";
import { RegionalSettings, TaxesSettings } from "./SettingsSections";
import Products from "./Products";
import Services from "./Services";
import Categories from "./Categories";
import { ResponsiveTabs, ResponsiveTabsContent } from "@/components/settings/ResponsiveTabs";
import { Building2, DollarSign, Globe, Percent, Package, Briefcase, Folder } from "lucide-react";

export default function SettingsGeneral() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres généraux</h2>
        <p className="text-muted-foreground mt-1">
          Configuration transversale de l'ERP
        </p>
      </div>

      <ResponsiveTabs
        defaultValue="company"
        items={[
          { value: "company", label: "Entreprise", icon: Building2 },
          { value: "currency", label: "Devise", icon: DollarSign },
          { value: "regional", label: "Langue & Formats", icon: Globe },
          { value: "taxes", label: "TVA & Taxes", icon: Percent },
          { value: "products-services", label: "Produits & Services", icon: Package },
        ]}
      >
        <ResponsiveTabsContent value="company" className="mt-6">
          <SettingsCompany />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="currency" className="mt-6">
          <RegionalSettings />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="regional" className="mt-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Langue et formats</CardTitle>
              <CardDescription className="text-xs">
                Configurez la langue, les formats de date, heure et nombres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Langue</Label>
                  <Input defaultValue="Français" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fuseau horaire</Label>
                  <Input defaultValue="Africa/Tunis (UTC+1)" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Format de date</Label>
                  <Input defaultValue="DD/MM/YYYY" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Format d'heure</Label>
                  <Input defaultValue="HH:mm" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Séparateur décimal</Label>
                  <Input defaultValue="," className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Séparateur de milliers</Label>
                  <Input defaultValue=" " className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Numérotation globale</CardTitle>
              <CardDescription className="text-xs">
                Configuration de la numérotation automatique des documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Format par défaut</Label>
                  <Input defaultValue="PREFIXE-YYYY-MM-NNN" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Réinitialisation</Label>
                  <Input defaultValue="Annuelle" className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="taxes" className="mt-6">
          <TaxesSettings />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="products-services" className="mt-6">
          <ResponsiveTabs
            defaultValue="products"
            items={[
              { value: "products", label: "Produits", icon: Package },
              { value: "services", label: "Services", icon: Briefcase },
              { value: "categories", label: "Catégories", icon: Folder },
            ]}
          >
            <ResponsiveTabsContent value="products" className="mt-6">
              <Products />
            </ResponsiveTabsContent>
            <ResponsiveTabsContent value="services" className="mt-6">
              <Services />
            </ResponsiveTabsContent>
            <ResponsiveTabsContent value="categories" className="mt-6">
              <Categories />
            </ResponsiveTabsContent>
          </ResponsiveTabs>
        </ResponsiveTabsContent>
      </ResponsiveTabs>
    </div>
  );
}
