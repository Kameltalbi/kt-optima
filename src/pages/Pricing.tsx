import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Building2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">BilvoxaERP</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#offres" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Offres
              </a>
              <a href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Modules
              </a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Questions
              </a>
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
      <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Des offres simples pour piloter votre entreprise
            </h1>
            <p className="text-xl text-muted-foreground">
              Commencez avec l'essentiel, ajoutez ce dont vous avez besoin.
            </p>
          </div>
        </div>
      </section>

      {/* Plans principaux */}
      <section id="offres" className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Plan 1 - Gestion Essentielle */}
              <Card className="border-2 border-primary shadow-lg relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Le plus utilisé
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4 pt-6">
                  <CardTitle className="text-2xl font-bold">Gestion Essentielle</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Pour gérer l'activité quotidienne simplement.
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">79</span>
                    <span className="text-xl text-muted-foreground ml-2">DT / mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">ACHATS</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Bons de commande</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Factures fournisseurs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Avoirs fournisseurs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">VENTES</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Devis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Factures clients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Avoirs clients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Encaissements</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">FINANCE</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Trésorerie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Échéanciers</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                    <p>• Jusqu'à 3 utilisateurs</p>
                    <p>• Jusqu'à 300 documents par mois</p>
                    <p>• 1 société</p>
                  </div>

                  <div className="pt-2 pb-2">
                    <p className="text-xs text-muted-foreground italic">
                      Le module Stock peut être ajouté à tout moment.
                    </p>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link to="/register">
                      Créer un compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plan 2 - Gestion Commerce */}
              <Card className="border-2 border-border hover:border-primary/50 transition-colors">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-4 py-1 text-sm font-semibold">
                    Pour entreprises avec stock
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4 pt-6">
                  <CardTitle className="text-2xl font-bold">Gestion Commerce</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Pour les entreprises qui gèrent des marchandises.
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">129</span>
                    <span className="text-xl text-muted-foreground ml-2">DT / mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-primary">✓ Gestion Essentielle incluse</div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">STOCK (inclus)</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Inventaire</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Mouvements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Alertes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Dépôts</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">ACHATS (complets)</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Réceptions</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                    <p>• Jusqu'à 5 utilisateurs</p>
                    <p>• Jusqu'à 800 documents par mois</p>
                    <p>• 1 société</p>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link to="/register">
                      Commencer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Modules à ajouter */}
      <section id="modules" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Modules à ajouter selon vos besoins
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Ajoutez uniquement les modules dont vous avez besoin
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Module Stock</h3>
                    <Badge variant="outline">30 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Si non inclus dans votre offre
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Ressources humaines avancées</h3>
                    <Badge variant="outline">40 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jusqu'à 10 employés
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +5 DT par employé supplémentaire
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Comptabilité</h3>
                    <Badge variant="outline">50 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Plan comptable, écritures, balance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Gestion de parc</h3>
                    <Badge variant="outline">20 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Suivi des équipements et entretiens
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Multi-site</h3>
                    <Badge variant="outline">30 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gestion de plusieurs sites/dépôts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">Support prioritaire</h3>
                    <Badge variant="outline">20 DT / mois</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Support en priorité par email et chat
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to="/register">
                  Ajouter un module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Détail des modules (Accordéon) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Voir le détail des modules
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="achats">
                <AccordionTrigger className="text-lg font-semibold">
                  ACHATS
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Bons de commande</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Réceptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Factures fournisseurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Avoirs fournisseurs</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ventes">
                <AccordionTrigger className="text-lg font-semibold">
                  VENTES
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Devis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Factures clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Avoirs clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Encaissements</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="stock">
                <AccordionTrigger className="text-lg font-semibold">
                  STOCK
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Inventaire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Mouvements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Alertes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Dépôts</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="finance">
                <AccordionTrigger className="text-lg font-semibold">
                  FINANCE
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Trésorerie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Échéanciers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Rapprochements (Gestion Commerce)</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Questions fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Puis-je changer d'offre à tout moment ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, vous pouvez passer à une offre supérieure ou inférieure à tout moment depuis votre espace. La transition se fait sans interruption de service et vos données sont conservées.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Puis-je ajouter ou retirer des modules ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, vous pouvez activer ou désactiver des modules à tout moment depuis votre tableau de bord. Les modules sont facturés au prorata et prennent effet immédiatement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Mes données sont-elles sécurisées ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, vos données sont chiffrées et stockées de manière sécurisée. Nous effectuons des sauvegardes quotidiennes et respectons les normes de sécurité les plus strictes pour protéger vos informations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Y a-t-il un engagement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Non, il n'y a aucun engagement. Vous pouvez résilier votre abonnement à tout moment. Aucun frais de résiliation n'est appliqué.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Commencez dès aujourd'hui avec l'offre qui vous convient.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
