import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, FileText, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export default function SettingsModules() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="text-base">Modules disponibles</CardTitle>
            <CardDescription className="text-xs">
              Activez ou désactivez les modules de votre BilvoxaERP
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                id: "crm", 
                name: "CRM", 
                description: "Gestion de la relation client",
                enabled: true,
                icon: Users
              },
              { 
                id: "commercial", 
                name: "Commercial", 
                description: "Gestion des ventes, devis et factures",
                enabled: true,
                icon: FileText
              },
              { 
                id: "achats", 
                name: "Achats", 
                description: "Gestion des fournisseurs et commandes",
                enabled: true,
                icon: Package
              },
              { 
                id: "stock", 
                name: "Stock", 
                description: "Gestion de l'inventaire et des entrepôts",
                enabled: true,
                icon: Package
              },
              { 
                id: "finance", 
                name: "Finance", 
                description: "Trésorerie et gestion bancaire",
                enabled: true,
                icon: FileText
              },
              { 
                id: "comptabilite", 
                name: "Comptabilité", 
                description: "Plan comptable et écritures",
                enabled: true,
                icon: FileText
              },
              { 
                id: "rh", 
                name: "Ressources Humaines", 
                description: "Gestion du personnel et de la paie",
                enabled: false,
                icon: Users
              },
              { 
                id: "ecommerce", 
                name: "E-commerce", 
                description: "Boutique en ligne et commandes",
                enabled: false,
                icon: Package
              },
            ].map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      module.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        module.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{module.name}</p>
                        {module.enabled ? (
                          <Badge className="bg-success/10 text-success border-0 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={module.enabled} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Modules supplémentaires</CardTitle>
          <CardDescription className="text-xs">
            Installez des modules supplémentaires pour étendre les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                name: "Module Reporting Avancé", 
                description: "Rapports personnalisés et analyses détaillées",
                price: "Gratuit"
              },
              { 
                name: "Module Multi-devises", 
                description: "Gestion de plusieurs devises",
                price: "299 MAD/mois"
              },
              { 
                name: "Module API", 
                description: "Intégration avec des systèmes externes",
                price: "499 MAD/mois"
              },
            ].map((module) => (
              <div
                key={module.name}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{module.name}</p>
                    <Badge variant="outline" className="text-[10px]">{module.price}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Installer
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
