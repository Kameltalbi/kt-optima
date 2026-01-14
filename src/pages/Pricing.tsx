import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, Building2, Shield, Cloud, Download, Users, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
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
  moduleDetails: {
    crm?: string[];
    ventes?: string[];
    achats?: string[];
    stocks?: string[];
    comptabilite?: string[];
    tresorerie?: string[];
    rh?: string[];
    parc?: string[];
  };
}

const plans: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    description: "Pour petites structures qui veulent facturer proprement",
    monthlyPrice: 49,
    annualPrice: 490,
    color: "blue",
    modules: {
      crm: true,
      ventes: true,
      achats: false,
      stocks: false,
      comptabilite: false,
      tresorerie: "basique",
      rh: false,
      parc: false,
    },
    moduleDetails: {
      crm: ["Clients & prospects", "Fiche client", "Historique des ventes"],
      ventes: ["Devis", "Factures", "Avoirs clients"],
      tresorerie: ["Encaissements clients", "Suivi des paiements"],
    },
  },
  {
    id: "business",
    name: "Business",
    description: "Pour entreprises structurées (le plus vendu)",
    monthlyPrice: 99,
    annualPrice: 990,
    color: "green",
    badge: "Le plus choisi",
    modules: {
      crm: true,
      ventes: true,
      achats: true,
      stocks: true,
      comptabilite: false,
      tresorerie: "standard",
      rh: false,
      parc: false,
    },
    moduleDetails: {
      crm: ["Clients & prospects", "Opportunités", "Historique complet"],
      ventes: ["Devis", "Factures", "Avoirs"],
      achats: ["Fournisseurs", "Factures fournisseurs"],
      stocks: ["Produits", "Mouvements de stock", "Valorisation simple"],
      tresorerie: ["Encaissements", "Décaissements", "Soldes"],
    },
  },
  {
    id: "complet",
    name: "ERP Complet",
    description: "Pour entreprises organisées ou en croissance",
    monthlyPrice: 149,
    annualPrice: 1490,
    color: "orange",
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
      crm: ["Clients & prospects", "Opportunités", "Historique complet"],
      ventes: ["Devis", "Factures", "Avoirs"],
      achats: ["Fournisseurs", "Factures fournisseurs"],
      stocks: ["Produits", "Mouvements de stock", "Valorisation simple"],
      comptabilite: ["Écritures automatiques", "Journaux", "TVA"],
      tresorerie: ["Prévision", "Rapprochement"],
      rh: ["Employés", "Salaires"],
      parc: ["Véhicules / matériel", "Amortissements"],
    },
  },
];

const additionalOptions = [
  { id: "user", name: "Utilisateur supplémentaire", price: 10, icon: Users },
  { id: "company", name: "Société supplémentaire", price: 30, icon: Building },
  { id: "reports", name: "Rapports avancés", price: 20, icon: Download },
  { id: "permissions", name: "Droits & permissions avancés", price: 15, icon: Shield },
  { id: "storage", name: "Stockage fichiers", price: 10, icon: Cloud },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [users, setUsers] = useState(1);
  const [companies, setCompanies] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const calculatePrice = (plan: Plan) => {
    let total = isAnnual ? plan.annualPrice : plan.monthlyPrice * 12;
    
    // Add additional users (first user is included)
    if (users > 1) {
      const userPrice = additionalOptions[0].price * (isAnnual ? 12 * 0.8 : 12);
      total += (users - 1) * userPrice;
    }
    
    // Add additional companies (first company is included)
    if (companies > 1) {
      const companyPrice = additionalOptions[1].price * (isAnnual ? 12 * 0.8 : 12);
      total += (companies - 1) * companyPrice;
    }
    
    // Add selected options
    selectedOptions.forEach((optionId) => {
      const option = additionalOptions.find((o) => o.id === optionId);
      if (option) {
        total += option.price * (isAnnual ? 12 * 0.8 : 12);
      }
    });
    
    return total;
  };

  const formatPrice = (price: number) => {
    if (isAnnual) {
      return `${Math.round(price)} DT / an`;
    }
    return `${Math.round(price / 12)} DT / mois`;
  };

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">BilvoxaERP</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#plans" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Plans
              </a>
              <a href="#comparison" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Comparaison
              </a>
              <a href="#options" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Options
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Créer un compte</Link>
              </Button>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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

              {/* Nombre d'utilisateurs */}
              <div className="flex items-center gap-3">
                <Label htmlFor="users">Utilisateurs:</Label>
                <Select value={users.toString()} onValueChange={(v) => setUsers(parseInt(v))}>
                  <SelectTrigger id="users" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  </div>

              {/* Nombre de sociétés */}
              <div className="flex items-center gap-3">
                <Label htmlFor="companies">Sociétés:</Label>
                <Select value={companies.toString()} onValueChange={(v) => setCompanies(parseInt(v))}>
                  <SelectTrigger id="companies" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                      </div>
                      </div>
                    </div>
                  </div>
      </section>

      {/* Section 3 - Les Plans */}
      <section id="plans" className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
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
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <div className="text-4xl font-bold">
                        {formatPrice(calculatePrice(plan))}
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Économisez {Math.round(plan.monthlyPrice * 12 - plan.annualPrice)} DT/an
                        </p>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Modules inclus */}
                    <div className="space-y-4">
                      {Object.entries(plan.moduleDetails).map(([moduleKey, features]) => {
                        if (!features || features.length === 0) return null;
                        return (
                          <div key={moduleKey} className="space-y-2">
                            <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              {moduleKey.toUpperCase()}
                  </div>
                            <div className="space-y-1.5">
                              {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                      </div>
                              ))}
                      </div>
                      </div>
                        );
                      })}
                    </div>

                    {/* Modules non inclus */}
                    <div className="pt-4 border-t border-border space-y-2">
                      {!plan.modules.achats && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Achats</span>
                        </div>
                      )}
                      {!plan.modules.stocks && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Stocks</span>
                        </div>
                      )}
                      {!plan.modules.comptabilite && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Comptabilité</span>
                        </div>
                      )}
                      {!plan.modules.rh && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="text-sm">RH</span>
                  </div>
                      )}
                      {!plan.modules.parc && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Gestion de parc</span>
                      </div>
                      )}
                  </div>

                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      variant={plan.id === "business" ? "default" : "outline"}
                    >
                    <Link to="/register">
                        {plan.id === "essentiel" && "Commencer avec Essentiel"}
                        {plan.id === "business" && "Choisir Business"}
                        {plan.id === "complet" && "Passer à l'ERP complet"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
                        <th className="text-center p-4 font-semibold">Essentiel</th>
                        <th className="text-center p-4 font-semibold">Business</th>
                        <th className="text-center p-4 font-semibold">ERP Complet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "CRM", essentiel: true, business: true, complet: true },
                        { name: "Ventes", essentiel: true, business: true, complet: true },
                        { name: "Achats", essentiel: false, business: true, complet: true },
                        { name: "Stocks", essentiel: false, business: true, complet: true },
                        { name: "Comptabilité", essentiel: false, business: false, complet: true },
                        { name: "Trésorerie", essentiel: "Basique", business: "Standard", complet: "Avancée" },
                        { name: "RH", essentiel: false, business: false, complet: true },
                        { name: "Gestion de parc", essentiel: false, business: false, complet: true },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-center">
                            {typeof row.essentiel === "boolean" ? (
                              row.essentiel ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.essentiel}</span>
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
                            {typeof row.complet === "boolean" ? (
                              row.complet ? (
                                <Check className="w-5 h-5 text-primary mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-sm">{row.complet}</span>
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

      {/* Section 5 - Options Additionnelles */}
      <section id="options" className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Options à la carte
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Tu monétises sans complexifier les plans
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {additionalOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOptions.has(option.id);
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary border-2" : "border-border"
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-semibold">{option.name}</p>
                  <p className="text-sm text-muted-foreground">
                              +{option.price} DT / mois
                            </p>
                  </div>
                  </div>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleOption(option.id)}
                        />
                  </div>
                </CardContent>
              </Card>
                );
              })}
            </div>
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

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">BilvoxaERP</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ERP complet pour les entreprises tunisiennes
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-muted-foreground">contact@bilvoxaerp.com</li>
                <li className="text-muted-foreground">+216 XX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BilvoxaERP. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
