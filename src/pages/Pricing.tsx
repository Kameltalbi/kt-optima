import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Building2, Shield, Cloud, Download, Info, Users, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PlanDetailModal } from "@/components/pricing/PlanDetailModal";
import { AddOnsSection } from "@/components/pricing/AddOnsSection";
import { Footer } from "@/components/layout/Footer";

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  badge?: string;
  modules: {
    crm: boolean;
    ventes: boolean;
    achats: boolean;
    stocks: boolean;
    comptabilite: boolean;
    tresorerie: "basique" | "standard" | "avancee" | false;
    rh: boolean;
    parc: boolean;
  };
  mainFeatures: string[];
  moduleDetails: {
    crm?: string[];
    ventes?: string[];
    achats?: string[];
    stocks?: string[];
    comptabilite?: string[];
    tresorerie?: string[];
    rh?: string[];
    parc?: string[];
    pos?: string[];
  };
}

export const plans: Plan[] = [
  {
    id: "depart",
    name: "Départ",
    description: "Pour indépendants et tests",
    monthlyPrice: 0,
    annualPrice: 0,
    color: "blue",
    maxUsers: 1,
    mainFeatures: [
      "Devis & factures clients",
      "Gestion des clients",
      "Produits & services",
      "Bons de livraison",
      "Historique des ventes"
    ],
    modules: {
      crm: true,
      ventes: true,
      achats: false,
      stocks: true,
      comptabilite: false,
      tresorerie: false,
      rh: false,
      parc: false,
    },
    moduleDetails: {
      crm: [
        "Gestion des contacts",
        "Fiche client complète",
        "Historique des interactions"
      ],
      ventes: [
        "Devis",
        "Factures clients",
        "Bons de livraison"
      ],
      stocks: [
        "Gestion des produits/services",
        "Gestion des catégories"
      ],
    },
  },
  {
    id: "starter",
    name: "Starter",
    description: "Pour petites entreprises",
    monthlyPrice: 45,
    annualPrice: 450,
    color: "purple",
    maxUsers: 3,
    mainFeatures: [
      "Tout Départ",
      "Encaissements clients",
      "Suivi des paiements",
      "Inventaire simple",
      "Avoirs clients"
    ],
    modules: {
      crm: true,
      ventes: true,
      achats: false,
      stocks: true,
      comptabilite: false,
      tresorerie: "basique",
      rh: false,
      parc: false,
    },
    moduleDetails: {
      crm: [
        "Gestion des contacts",
        "Fiche client complète",
        "Historique des interactions"
      ],
      ventes: [
        "Devis",
        "Factures clients",
        "Bons de livraison"
      ],
      stocks: [
        "Gestion des produits/services",
        "Gestion des catégories",
        "Mouvements de stock",
        "Inventaire"
      ],
      tresorerie: [
        "Encaissements clients",
        "Suivi des paiements",
        "Allocation des paiements"
      ],
    },
  },
  {
    id: "business",
    name: "Business",
    description: "Pour PME en croissance",
    monthlyPrice: 79,
    annualPrice: 790,
    color: "green",
    badge: "⭐",
    maxUsers: 7,
    mainFeatures: [
      "Tout Starter",
      "Gestion avancée du stock",
      "Multi-entrepôts",
      "Trésorerie & rapprochement bancaire",
      "Fournisseurs & commandes"
    ],
    modules: {
      crm: true,
      ventes: true,
      achats: true,
      stocks: true,
      comptabilite: false,
      tresorerie: "standard",
      rh: true,
      parc: false,
    },
    moduleDetails: {
      crm: [
        "Gestion des contacts",
        "Fiche client complète",
        "Historique des interactions"
      ],
      ventes: [
        "Devis",
        "Factures clients",
        "Factures d'acompte",
        "Avoirs clients",
        "Bons de livraison"
      ],
      achats: [
        "Gestion des fournisseurs",
        "Factures fournisseurs",
        "Commandes fournisseurs"
      ],
      stocks: [
        "Gestion des produits/services",
        "Mouvements de stock",
        "Inventaire",
        "Valorisation des stocks",
        "Alertes de réapprovisionnement",
        "Multi-entrepôts"
      ],
      tresorerie: [
        "Encaissements clients",
        "Suivi des paiements",
        "Allocation des paiements",
        "Décaissements",
        "Prévisions de trésorerie",
        "Rapprochement bancaire"
      ],
      rh: [
        "Gestion des employés",
        "Congés & absences"
      ],
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour entreprises structurées",
    monthlyPrice: 139,
    annualPrice: 1390,
    color: "orange",
    maxUsers: null, // Illimité
    mainFeatures: [
      "Tout Business",
      "Comptabilité & journaux",
      "Déclarations TVA",
      "Paie & congés",
      "Immobilisations"
    ],
    modules: {
      crm: true,
      ventes: true,
      achats: true,
      stocks: true,
      comptabilite: true,
      tresorerie: "avancee",
      rh: true,
      parc: true,
    },
    moduleDetails: {
      crm: [
        "Gestion des contacts",
        "Fiche client complète",
        "Historique des interactions"
      ],
      ventes: [
        "Devis",
        "Factures clients",
        "Factures d'acompte",
        "Avoirs clients",
        "Bons de livraison"
      ],
      achats: [
        "Gestion des fournisseurs",
        "Factures fournisseurs",
        "Commandes fournisseurs"
      ],
      stocks: [
        "Gestion des produits/services",
        "Mouvements de stock",
        "Inventaire",
        "Valorisation des stocks",
        "Alertes de réapprovisionnement",
        "Multi-entrepôts"
      ],
      tresorerie: [
        "Encaissements clients",
        "Suivi des paiements",
        "Allocation des paiements",
        "Décaissements",
        "Prévisions de trésorerie",
        "Rapprochement bancaire"
      ],
      comptabilite: [
        "Écritures automatiques",
        "Journaux comptables",
        "Déclarations TVA",
        "Bilan & Compte de résultat"
      ],
      rh: [
        "Gestion des employés",
        "Paie",
        "Congés & absences"
      ],
      parc: [
        "Véhicules & matériel",
        "Amortissements",
        "Maintenance"
      ],
      pos: [
        "Point de vente (POS)",
        "Terminal de caisse",
        "Gestion des tickets",
        "Impression des reçus"
      ],
    },
  },
];

// Liste simplifiée des fonctionnalités par module
const allFeatures = [
  // CRM
  "CRM (Clients & Prospects)",
  // Ventes
  "Devis",
  "Factures clients",
  "Bons de livraison",
  "Factures d'acompte",
  "Avoirs clients",
  // Produits & Stock
  "Gestion produits/services",
  "Gestion catégories",
  "Mouvements de stock",
  "Inventaire",
  "Valorisation stocks",
  "Multi-entrepôts",
  // Trésorerie
  "Encaissements clients",
  "Suivi des paiements",
  "Décaissements",
  "Prévisions trésorerie",
  "Rapprochement bancaire",
  // Achats
  "Gestion fournisseurs",
  "Factures fournisseurs",
  "Commandes fournisseurs",
  // Comptabilité
  "Écritures automatiques",
  "Journaux comptables",
  "Déclarations TVA",
  "Bilan & Compte de résultat",
  // RH
  "Gestion employés",
  "Paie",
  "Congés & absences",
  // Parc
  "Gestion de parc",
  "Amortissements",
  // POS
  "Point de vente (POS)",
];

// Fonction pour vérifier si une fonctionnalité est incluse dans un plan
const hasFeature = (plan: Plan, feature: string): boolean => {
  // Mapping des fonctionnalités simplifiées vers les détails dans moduleDetails
  const featureMapping: Record<string, string[]> = {
    "CRM (Clients & Prospects)": ["Gestion des contacts", "Fiche client complète", "Historique des interactions"],
    "Devis": ["Devis"],
    "Factures clients": ["Factures clients"],
    "Bons de livraison": ["Bons de livraison"],
    "Factures d'acompte": ["Factures d'acompte"],
    "Avoirs clients": ["Avoirs clients"],
    "Gestion produits/services": ["Gestion des produits/services"],
    "Gestion catégories": ["Gestion des catégories"],
    "Mouvements de stock": ["Mouvements de stock"],
    "Inventaire": ["Inventaire"],
    "Valorisation stocks": ["Valorisation des stocks"],
    "Multi-entrepôts": ["Multi-entrepôts"],
    "Encaissements clients": ["Encaissements clients"],
    "Suivi des paiements": ["Suivi des paiements", "Allocation des paiements"],
    "Décaissements": ["Décaissements"],
    "Prévisions trésorerie": ["Prévisions de trésorerie"],
    "Rapprochement bancaire": ["Rapprochement bancaire"],
    "Gestion fournisseurs": ["Gestion des fournisseurs"],
    "Factures fournisseurs": ["Factures fournisseurs"],
    "Commandes fournisseurs": ["Commandes fournisseurs"],
    "Écritures automatiques": ["Écritures automatiques"],
    "Journaux comptables": ["Journaux comptables"],
    "Déclarations TVA": ["Déclarations TVA"],
    "Bilan & Compte de résultat": ["Bilan & Compte de résultat"],
    "Gestion employés": ["Gestion des employés"],
    "Paie": ["Paie"],
    "Congés & absences": ["Congés & absences"],
    "Gestion de parc": ["Véhicules & matériel", "Maintenance"],
    "Amortissements": ["Amortissements"],
    "Point de vente (POS)": ["Point de vente (POS)", "Terminal de caisse", "Gestion des tickets", "Impression des reçus"],
  };
  
  const relatedFeatures = featureMapping[feature] || [feature];
  return Object.values(plan.moduleDetails).some(features => 
    features && relatedFeatures.some(f => features.includes(f))
  );
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<Plan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const calculatePrice = (plan: Plan) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice * 12;
  };

  const formatPrice = (price: number) => {
    if (isAnnual) {
      return `${Math.round(price)} DT / an`;
    }
    return `${Math.round(price / 12)} DT / mois`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/ktoptima.png" 
                alt="KTOptima" 
                className="h-20 w-auto object-contain transition-transform hover:scale-105"
              />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <a href="#fonctionnalites" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Produit
              </a>
              <Link to="/modules" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Modules
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Tarifs
              </Link>
              <a href="#entreprise" className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
                Entreprise
              </a>
            </nav>

            {/* CTA Buttons Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild className="transition-all duration-300">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="transition-all duration-300 hover:shadow-lg">
                <Link to="/demo">Demander une démo</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-6">
                    <a 
                      href="#fonctionnalites" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Produit
                    </a>
                    <Link 
                      to="/modules" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Modules
                    </Link>
                    <Link 
                      to="/pricing" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Tarifs
                    </Link>
                    <a 
                      href="#entreprise" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Entreprise
                    </a>
                    <div className="border-t pt-4 mt-4 space-y-3">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          Connexion
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/demo" onClick={() => setMobileMenuOpen(false)}>
                          Demander une démo
                        </Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1 - Titre & Promesse */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Une solution ERP modulaire, claire et évolutive
            </h1>
            <p className="text-xl text-muted-foreground">
              Payez uniquement les modules dont vous avez besoin.
              <br />
              Aucune complexité. Aucune surprise.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 - Sélecteurs */}
      <section className="py-8 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              {/* Toggle Mensuel/Annuel */}
              <div className="flex items-center gap-3">
                <Label htmlFor="billing-toggle" className={!isAnnual ? "font-semibold" : ""}>
                  Mensuel
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                />
                <Label htmlFor="billing-toggle" className={isAnnual ? "font-semibold" : ""}>
                  Annuel <span className="text-primary">(-20%)</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Les Plans */}
      <section id="plans" className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.id === "business"
                      ? "border-2 border-primary shadow-lg scale-105"
                      : "border border-border"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-6">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    {plan.badge && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-sm">{plan.badge}</Badge>
                      </div>
                    )}
                    <CardDescription className="mt-3">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <div className="text-4xl font-bold">
                        {plan.monthlyPrice === 0 ? (
                          "Gratuit"
                        ) : (
                          <>
                            {isAnnual ? plan.annualPrice : plan.monthlyPrice} DT
                            <span className="text-lg text-muted-foreground">/mois</span>
                          </>
                        )}
                      </div>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Économisez {Math.round(plan.monthlyPrice * 12 - plan.annualPrice)} DT/an
                        </p>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 5 fonctionnalités principales */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Inclus</p>
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {plan.maxUsers === null ? "Utilisateurs illimités" : `${plan.maxUsers} utilisateur${plan.maxUsers > 1 ? "s" : ""}`}
                        </span>
                      </div>
                      {plan.mainFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Button
                        asChild
                        className="w-full"
                        size="lg"
                        variant={plan.id === "business" ? "default" : "outline"}
                      >
                        <Link to={`/checkout?plan=${plan.id}`}>
                          {plan.id === "depart" && "Commencer gratuitement"}
                          {plan.id === "starter" && "Choisir Starter"}
                          {plan.id === "business" && "Choisir Business"}
                          {plan.id === "enterprise" && "Choisir Enterprise"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          setSelectedPlanDetail(plan);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Voir le détail
                      </Button>
                    </div>
                </CardContent>
              </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Tableau Comparatif */}
      <section id="comparison" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Comparaison des modules
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Tout est visible, rien n'est caché
            </p>
              <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold">Modules</th>
                        <th className="text-center p-4 font-semibold">Départ</th>
                        <th className="text-center p-4 font-semibold">Starter</th>
                        <th className="text-center p-4 font-semibold">Business</th>
                        <th className="text-center p-4 font-semibold">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "CRM", depart: true, starter: true, business: true, enterprise: true },
                        { name: "Ventes", depart: true, starter: true, business: true, enterprise: true },
                        { name: "Produits/Services", depart: true, starter: true, business: true, enterprise: true },
                        { name: "Stock (mouvements)", depart: false, starter: true, business: true, enterprise: true },
                        { name: "Trésorerie", depart: false, starter: "Basique", business: "Standard", enterprise: "Avancée" },
                        { name: "Factures d'acompte", depart: false, starter: false, business: true, enterprise: true },
                        { name: "Avoirs clients", depart: false, starter: false, business: true, enterprise: true },
                        { name: "Achats", depart: false, starter: false, business: true, enterprise: true },
                        { name: "Stocks avancés", depart: false, starter: false, business: true, enterprise: true },
                        { name: "Comptabilité", depart: false, starter: false, business: false, enterprise: true },
                        { name: "RH", depart: false, starter: false, business: false, enterprise: true },
                        { name: "Gestion de parc", depart: false, starter: false, business: false, enterprise: true },
                        { name: "POS (Point de vente)", depart: false, starter: false, business: false, enterprise: true },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-center">
                            {typeof row.depart === "boolean" ? (
                              row.depart ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.depart}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof row.starter === "boolean" ? (
                              row.starter ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.starter}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof row.business === "boolean" ? (
                              row.business ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.business}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof row.enterprise === "boolean" ? (
                              row.enterprise ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>
          </div>
                  </div>
      </section>


      {/* Section 6 - Rassurance */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Sécurité & technique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Données sécurisées (PostgreSQL)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Hébergement cloud</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Sauvegardes automatiques</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Sans engagement</span>
                  </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Résiliable à tout moment</span>
                  </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Export des données possible</span>
                  </div>
                </CardContent>
              </Card>
        </div>
          </div>
        </div>
      </section>

      {/* Section 7 - CTA Final */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Vous ne savez pas quel plan choisir ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Contactez-nous pour une démonstration personnalisée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/register">
                  Demander une démo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/register">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Add-ons */}
      <AddOnsSection />

      {/* Footer */}
      <Footer />

      {/* Modal détail plan */}
      {selectedPlanDetail && (
        <PlanDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          plan={selectedPlanDetail}
        />
      )}
    </div>
  );
}
