import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  ShoppingCart,
  Package,
  Wallet,
  Calculator,
  UserCheck,
  CheckCircle,
  ArrowRight,
  Shield,
  Database,
  Zap,
  Users,
  TrendingUp,
  Lock,
  Cloud,
  FileCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">BilvoxaERP</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#fonctionnalites" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Modules
              </a>
              <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </Link>
            </nav>

            {/* CTA Buttons */}
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

      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Une seule plateforme pour piloter l'ensemble de votre entreprise
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Centralisez vos opérations, maîtrisez votre trésorerie et structurez vos processus avec un ERP pensé pour la croissance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/register">
                  Créer un compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problème → Solution */}
      <section id="fonctionnalites" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              De la Complexité à la Simplicité
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Problèmes */}
              <Card className="border-destructive/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6 text-destructive">Problèmes Courants</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm">✗</span>
                      </div>
                      <div>
                        <p className="font-medium">Outils dispersés</p>
                        <p className="text-sm text-muted-foreground">Plusieurs logiciels non connectés</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm">✗</span>
                      </div>
                      <div>
                        <p className="font-medium">Manque de visibilité financière</p>
                        <p className="text-sm text-muted-foreground">Difficile de suivre la trésorerie en temps réel</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm">✗</span>
                      </div>
                      <div>
                        <p className="font-medium">Gestion manuelle</p>
                        <p className="text-sm text-muted-foreground">Stock et RH gérés sur Excel</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-destructive text-sm">✗</span>
                      </div>
                      <div>
                        <p className="font-medium">Difficulté à anticiper</p>
                        <p className="text-sm text-muted-foreground">Échéances et trésorerie imprévisibles</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Solution */}
              <Card className="border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6 text-primary">Solution ERP</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Une seule plateforme</p>
                        <p className="text-sm text-muted-foreground">Tous vos outils en un seul endroit</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Données centralisées</p>
                        <p className="text-sm text-muted-foreground">Vision complète et temps réel</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Modules activables</p>
                        <p className="text-sm text-muted-foreground">Payez uniquement ce dont vous avez besoin</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Vision temps réel</p>
                        <p className="text-sm text-muted-foreground">Tableaux de bord et rapports instantanés</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Modules Complets</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Une suite complète de modules pour gérer tous les aspects de votre entreprise
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Achats</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestion des bons de commande, réceptions et factures fournisseurs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Stock</h3>
                  <p className="text-sm text-muted-foreground">
                    Inventaire, mouvements, alertes et gestion multi-dépôts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Finance</h3>
                  <p className="text-sm text-muted-foreground">
                    Trésorerie, banques, échéanciers et rapprochements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Comptabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan comptable, écritures, grand livre et balance (PCG tunisien)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ressources Humaines</h3>
                  <p className="text-sm text-muted-foreground">
                    Employés, contrats, paie, absences, documents et évaluations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ventes</h3>
                  <p className="text-sm text-muted-foreground">
                    Devis, factures clients et suivi des ventes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Comment ça marche ?</h2>
            <p className="text-center text-muted-foreground mb-12">
              En 3 étapes simples, commencez à gérer votre entreprise efficacement
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Créez votre compte</h3>
                <p className="text-sm text-muted-foreground">
                  Inscription rapide en quelques clics, sans engagement
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Configurez votre société</h3>
                <p className="text-sm text-muted-foreground">
                  Paramétrez votre entreprise et activez les modules nécessaires
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Gérez vos opérations</h3>
                <p className="text-sm text-muted-foreground">
                  Commencez immédiatement à utiliser l'ERP, accessible 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cibles */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Pour qui ?</h2>
            <p className="text-center text-muted-foreground mb-12">
              Adapté à tous les types d'entreprises
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">PME</h3>
                  <p className="text-sm text-muted-foreground">
                    Solutions adaptées aux petites et moyennes entreprises
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <FileCheck className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Cabinets comptables</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestion multi-clients avec comptabilité complète
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Zap className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Startups</h3>
                  <p className="text-sm text-muted-foreground">
                    Démarrage rapide avec modules évolutifs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Building2 className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Entreprises multi-sites</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestion centralisée avec multi-dépôts et multi-sociétés
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Confiance & Sécurité */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Confiance & Sécurité</h2>
            <p className="text-center text-muted-foreground mb-12">
              Vos données sont protégées et sécurisées
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Données sécurisées</h3>
                  <p className="text-sm text-muted-foreground">
                    Chiffrement des données et accès sécurisés
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Lock className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Rôles et permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Contrôle d'accès granulaire par utilisateur
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Cloud className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Hébergement sécurisé</h3>
                  <p className="text-sm text-muted-foreground">
                    Infrastructure cloud performante et fiable
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Database className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sauvegardes automatiques</h3>
                  <p className="text-sm text-muted-foreground">
                    Sauvegardes quotidiennes pour protéger vos données
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à transformer votre gestion d'entreprise ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez des centaines d'entreprises qui font confiance à BilvoxaERP
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/register">
                  Créer un compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/login">Se connecter</Link>
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
                ERP complet pour les entreprises du Maghreb
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors">
                    Mentions légales
                  </a>
                </li>
                <li>
                  <a href="#confidentialite" className="text-muted-foreground hover:text-foreground transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#cgv" className="text-muted-foreground hover:text-foreground transition-colors">
                    CGV
                  </a>
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
