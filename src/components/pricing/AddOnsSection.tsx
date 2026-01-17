import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Building, Receipt, ShoppingCart } from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  features: string[];
  availableFor: ("depart" | "starter" | "business" | "enterprise")[];
  includedIn?: ("depart" | "starter" | "business" | "enterprise")[];
  badge?: string;
}

const addOns: AddOn[] = [
  {
    id: "notes-frais",
    name: "Notes de frais",
    description: "Gestion complète des notes de frais avec validation et intégration comptable",
    price: 0,
    priceUnit: "inclus",
    features: [
      "Création de notes de frais",
      "Catégories de dépenses",
      "Ajout de justificatifs",
      "Statuts (brouillon, soumis, validé)",
      "Impact trésorerie",
      "Workflow de validation avancé",
      "Règles de plafonds",
      "Intégration comptable",
      "Historique & audit",
    ],
    availableFor: ["business", "enterprise"],
    includedIn: ["enterprise"],
    badge: "Inclus - Enterprise",
  },
  {
    id: "pos",
    name: "Point de Vente (POS)",
    description: "Solution de caisse connectée à KT OPTIMA avec synchronisation automatique",
    price: 500,
    priceUnit: "DT / magasin",
    features: [
      "3 caisses incluses par magasin",
      "Synchronisation produits",
      "Synchronisation ventes",
      "Impact stock automatique",
      "Impact trésorerie",
      "Gestion des tickets",
      "Impression des reçus",
      "Rapports de vente",
    ],
    availableFor: ["depart", "starter", "business", "enterprise"],
  },
  {
    id: "additional-company",
    name: "1 entreprise additionnelle",
    description: "Ajoutez une entreprise supplémentaire à votre abonnement",
    price: 40,
    priceUnit: "DT HT / mois",
    features: [
      "Entreprise supplémentaire complète",
      "Tous les modules de votre plan",
      "Gestion indépendante",
      "Données séparées",
    ],
    availableFor: ["depart", "starter", "business", "enterprise"],
  },
];

export function AddOnsSection() {
  // Pour les pages publiques, on affiche tous les add-ons disponibles
  const currentPlan = "depart"; // Par défaut pour l'affichage public

  const handleActivateAddOn = (addOn: AddOn) => {
    // TODO: Implémenter l'activation de l'add-on
    console.log("Activer add-on:", addOn.id);
  };

  return (
    <section id="addons" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Modules optionnels
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complétez votre plan avec des modules supplémentaires pour répondre à vos besoins spécifiques
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addOn) => {
              const isIncluded = addOn.includedIn?.includes(currentPlan as any);
              const isAvailable = addOn.availableFor.includes(currentPlan as any);
              const isBusinessOptional = addOn.id === "notes-frais" && currentPlan === "business";

              // Déterminer l'icône
              let Icon = Building;
              if (addOn.id === "notes-frais") {
                Icon = Receipt;
              } else if (addOn.id === "pos") {
                Icon = ShoppingCart;
              }

              return (
                <Card key={addOn.id} className="relative">
                  {addOn.badge && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {addOn.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-primary" />
                      <CardTitle className="text-xl">{addOn.name}</CardTitle>
                    </div>
                    <CardDescription>{addOn.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-2xl font-bold">
                        {addOn.price === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            {addOn.priceUnit}
                          </span>
                        ) : (
                          <>
                            {addOn.price} DT
                            <span className="text-sm text-muted-foreground font-normal ml-1">
                              / {addOn.priceUnit}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        Fonctionnalités
                      </p>
                      <div className="space-y-1.5">
                        {addOn.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      {!isAvailable ? (
                        <Button variant="outline" className="w-full" disabled>
                          Non disponible pour votre plan
                        </Button>
                      ) : isIncluded ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Inclus dans votre plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleActivateAddOn(addOn)}
                        >
                          {isBusinessOptional
                            ? "Activer l'add-on"
                            : addOn.id === "pos"
                            ? "Ajouter le POS"
                            : addOn.id === "additional-company"
                            ? "Ajouter une entreprise"
                            : "Activer"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
