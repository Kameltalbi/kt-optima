import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Wallet,
  Package,
  Users,
  Calculator,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Link as LinkIcon,
  Zap,
  Database,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function Modules() {
  const modules = [
    {
      id: 1,
      icon: ShoppingCart,
      title: "Gestion Commerciale (Ventes)",
      subtitle: "Piloter l'activite commerciale sans complexité",
      description: "Le module Ventes permet de gérer l'ensemble du cycle commercial, de la relation client à la facturation.",
      features: [
        "Gestion des clients et prospects",
        "Devis, commandes, factures",
        "Factures d'acompte et avoirs",
        "Suivi des ventes et encaissements",
        "Historique client centralisé",
      ],
      value: [
        "Vision claire du chiffre d'affaires",
        "Suivi précis des engagements clients",
        "Moins d'erreurs et de ressaisie",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      icon: Wallet,
      title: "Trésorerie",
      subtitle: "Suivre vos flux financiers en temps réel",
      description: "La trésorerie est le cœur de la prise de décision. Ce module permet un suivi précis et continu des flux entrants et sortants.",
      features: [
        "Comptes bancaires et caisses",
        "Suivi des encaissements et décaissements",
        "Prévisions de trésorerie",
        "Suivi par projet ou par catégorie",
        "Tableaux de bord financiers",
      ],
      value: [
        "Anticipation des tensions de trésorerie",
        "Décisions basées sur des données fiables",
        "Fin des tableaux Excel parallèles",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      icon: Package,
      title: "Stock",
      subtitle: "Gérer vos stocks avec fiabilité",
      description: "Le module Stock permet de suivre les mouvements de marchandises de manière structurée et contrôlée.",
      features: [
        "Articles et familles de produits",
        "Entrées, sorties et ajustements",
        "Valorisation du stock",
        "Suivi par dépôt ou emplacement",
        "Historique des mouvements",
      ],
      value: [
        "Réduction des ruptures et surstocks",
        "Traçabilité complète",
        "Données cohérentes avec les ventes",
      ],
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      icon: Users,
      title: "Ressources Humaines (RH)",
      subtitle: "Structurer la gestion du personnel",
      description: "Ce module permet de centraliser les informations liées aux collaborateurs et d'assurer un suivi clair.",
      features: [
        "Dossiers salariés",
        "Contrats et informations administratives",
        "Congés et absences",
        "Suivi des présences",
        "Historique RH",
      ],
      value: [
        "Meilleure organisation interne",
        "Données RH centralisées",
        "Gain de temps administratif",
      ],
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: 5,
      icon: CreditCard,
      title: "Paie",
      subtitle: "Calculer et suivre la paie en toute conformité",
      description: "Le module Paie est conçu pour s'adapter au cadre réglementaire local et à l'organisation interne.",
      features: [
        "Paramétrage des éléments de paie",
        "Calcul des salaires",
        "Génération des fiches de paie",
        "Suivi des charges sociales",
        "Historique des paiements",
      ],
      value: [
        "Fiabilité des calculs",
        "Réduction des erreurs",
        "Traçabilité complète",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      id: 6,
      icon: Calculator,
      title: "Comptabilité",
      subtitle: "Centraliser les écritures et la logique comptable",
      description: "La comptabilité s'appuie sur les données générées par les autres modules.",
      features: [
        "Journaux comptables",
        "Écritures automatiques",
        "Suivi des comptes",
        "Export comptable",
        "Cohérence ventes / trésorerie / paie",
      ],
      value: [
        "Moins de ressaisie",
        "Données comptables fiables",
        "Meilleure collaboration avec l'expert-comptable",
      ],
      color: "from-teal-500 to-cyan-500",
      badge: "En cours / Optionnel",
    },
  ];

  const interconnections = [
    {
      from: "Ventes",
      to: "Trésorerie",
      description: "Une vente impacte la trésorerie",
      icon: TrendingUp,
    },
    {
      from: "Paie",
      to: "Comptabilité",
      description: "La paie impacte les charges",
      icon: Calculator,
    },
    {
      from: "Stock",
      to: "Ventes",
      description: "Le stock alimente les ventes",
      icon: Package,
    },
    {
      from: "RH",
      to: "Paie",
      description: "Les données RH structurent la paie",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/kt optima (500 x 192 px).png" 
                alt="KT Optima" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link to="/#fonctionnalites" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Produit
              </Link>
              <a href="#modules" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Modules
              </a>
              <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Tarifs
              </Link>
              <Link to="/#entreprise" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Entreprise
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link to="/demo">Demander une démo</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Des modules activables selon{" "}
              <span className="text-primary">vos besoins réels</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              KT Optima est une plateforme modulaire.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Chaque module répond à un besoin métier précis et s'intègre dans un socle commun, sans rupture ni redondance de données.
            </p>
            <p className="text-base font-medium text-foreground">
              Activez uniquement ce dont vous avez besoin, aujourd'hui ou demain.
            </p>
          </div>
        </div>
      </section>

      {/* Principes des Modules */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Principes des modules KT Optima
              </h2>
              <p className="text-lg text-muted-foreground">
                Une logique simple et cohérente
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-8 mb-8">
              <p className="text-muted-foreground mb-6">
                Avant de présenter les modules, il est important de comprendre leur fonctionnement :
              </p>
              <ul className="space-y-4">
                {[
                  "Tous les modules partagent la même base de données",
                  "Les informations circulent automatiquement entre modules",
                  "Aucun module n'est isolé ou indépendant",
                  "L'activation d'un module ne remet pas en cause l'existant",
                ].map((principle, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="text-foreground font-medium">
                👉 Vous construisez votre ERP progressivement, sans refaire votre système.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules détaillés */}
      <section id="modules" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl">
                              Module {module.id} — {module.title}
                            </CardTitle>
                            {module.badge && (
                              <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                                {module.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-medium text-primary mb-2">
                            {module.subtitle}
                          </p>
                          <p className="text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                          Fonctionnalités clés
                        </h4>
                        <ul className="space-y-2">
                          {module.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                          Valeur métier
                        </h4>
                        <ul className="space-y-2">
                          {module.value.map((value, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-foreground">{value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interconnexion des Modules */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Interconnexion des modules
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                Une plateforme cohérente, pas des outils juxtaposés
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {interconnections.map((connection, index) => {
                const Icon = connection.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{connection.from}</span>
                          <LinkIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">{connection.to}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {connection.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg text-center">
              <p className="text-foreground font-medium">
                👉 Tout est lié, sans duplication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activation Progressive */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Activer les modules progressivement
              </h2>
              <p className="text-lg text-muted-foreground">
                Une approche pragmatique
              </p>
            </div>
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <p className="text-lg text-foreground mb-6">
                  KT Optima permet :
                </p>
                <ul className="space-y-4 mb-6">
                  {[
                    "de démarrer avec un ou deux modules",
                    "d'en activer d'autres plus tard",
                    "d'adapter la plateforme à l'évolution de l'entreprise",
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground font-medium">
                    Aucune rupture. Aucun redéploiement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à choisir vos modules ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez nos tarifs ou demandez une démonstration personnalisée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/pricing">
                  Voir les tarifs
                </Link>
              </Button>
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/demo">
                  Demander une démonstration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
