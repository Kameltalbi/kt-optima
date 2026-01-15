import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ArrowRight,
  Users,
  Presentation,
  MessageSquare,
  ArrowLeftRight,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

export default function Demo() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fonction: "",
    entreprise: "",
    email: "",
    phone: "",
    nombreUtilisateurs: "",
    modulesInteret: [] as string[],
    message: "",
  });

  const modules = [
    "Ventes",
    "Trésorerie",
    "Stock",
    "RH",
    "Paie",
    "Comptabilité",
  ];

  const handleModuleToggle = (module: string) => {
    setFormData((prev) => ({
      ...prev,
      modulesInteret: prev.modulesInteret.includes(module)
        ? prev.modulesInteret.filter((m) => m !== module)
        : [...prev.modulesInteret, module],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.entreprise) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    // TODO: Envoyer le formulaire à l'API
    toast.success("Votre demande de démonstration a été envoyée. Nous vous recontacterons rapidement.");
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      fonction: "",
      entreprise: "",
      email: "",
      phone: "",
      nombreUtilisateurs: "",
      modulesInteret: [],
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/ktoptima.png" 
                alt="KT Optima" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link to="/#fonctionnalites" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Produit
              </Link>
              <Link to="/modules" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Modules
              </Link>
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
              Découvrez comment{" "}
              <span className="text-primary">KT Optima s'adapte</span>{" "}
              à votre organisation
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              La démonstration de KT Optima vous permet de comprendre concrètement comment la plateforme peut structurer vos opérations, centraliser vos données et simplifier votre pilotage au quotidien.
            </p>
            <p className="text-lg text-foreground font-medium max-w-3xl mx-auto">
              Il ne s'agit pas d'une présentation générique, mais d'un échange ciblé, basé sur vos besoins réels.
            </p>
          </div>
        </div>
      </section>

      {/* Pourquoi demander une démonstration */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pourquoi demander une démonstration
              </h2>
              <p className="text-lg text-muted-foreground">
                Une approche concrète, orientée métier
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="p-8">
                <p className="text-foreground mb-6">
                  Une démonstration KT Optima vous permet de :
                </p>
                <ul className="space-y-4">
                  {[
                    "Visualiser le fonctionnement global de la plateforme",
                    "Comprendre la logique modulaire et le socle commun",
                    "Identifier les modules adaptés à votre activité",
                    "Évaluer la simplicité d'utilisation pour vos équipes",
                    "Poser des questions précises, liées à votre contexte",
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-foreground font-medium">
                    L'objectif est de vous permettre de prendre une décision éclairée, sans engagement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment se déroule la démonstration */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Comment se déroule la démonstration
              </h2>
              <p className="text-lg text-muted-foreground">
                Un processus simple et structuré
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  icon: Users,
                  title: "Analyse rapide de votre contexte",
                  description: "Nous commençons par comprendre votre activité, votre organisation et vos priorités.",
                },
                {
                  step: "2",
                  icon: Presentation,
                  title: "Présentation ciblée de la plateforme",
                  description: "La démonstration se concentre sur les modules et les fonctionnalités réellement utiles pour vous.",
                },
                {
                  step: "3",
                  icon: MessageSquare,
                  title: "Échange et questions",
                  description: "Vous pouvez approfondir les points importants : organisation, données, évolutivité, sécurité.",
                },
                {
                  step: "4",
                  icon: ArrowLeftRight,
                  title: "Prochaines étapes (si pertinentes)",
                  description: "Activation progressive, accompagnement ou phase de test selon votre situation.",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {item.step}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* À qui s'adresse la démonstration */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                À qui s'adresse la démonstration
              </h2>
              <p className="text-lg text-muted-foreground">
                Pour les décideurs et équipes impliquées
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="p-8">
                <p className="text-foreground mb-6">
                  La démonstration est particulièrement pertinente pour :
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Dirigeants de PME",
                    "Responsables financiers et trésorerie",
                    "Responsables administratifs",
                    "Responsables opérationnels",
                  ].map((role, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{role}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-muted-foreground">
                    Elle peut être réalisée avec une ou plusieurs personnes, selon votre organisation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ce que la démonstration n'est pas */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ce que la démonstration n'est pas
              </h2>
              <p className="text-lg text-muted-foreground">
                Pour être clair
              </p>
            </div>
            <Card className="border-2 border-muted">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {[
                    "Ce n'est pas une présentation commerciale standard",
                    "Ce n'est pas un engagement contractuel",
                    "Ce n'est pas une démonstration générique identique pour tous",
                  ].map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-muted-foreground text-xl">✗</span>
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t">
                  <p className="text-foreground font-medium">
                    C'est un échange professionnel, centré sur la compréhension et l'adéquation de la solution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulaire de demande */}
      <section id="formulaire" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Demander une démonstration de KT Optima
              </h2>
              <p className="text-muted-foreground">
                Formulaire simple et rapide
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Prénom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fonction">Fonction</Label>
                      <Input
                        id="fonction"
                        value={formData.fonction}
                        onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                        placeholder="Ex: Directeur Général"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entreprise">Entreprise *</Label>
                      <Input
                        id="entreprise"
                        value={formData.entreprise}
                        onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+216 12 345 678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombreUtilisateurs">Nombre approximatif d'utilisateurs</Label>
                    <Select
                      value={formData.nombreUtilisateurs}
                      onValueChange={(value) => setFormData({ ...formData, nombreUtilisateurs: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1 à 5 utilisateurs</SelectItem>
                        <SelectItem value="6-10">6 à 10 utilisateurs</SelectItem>
                        <SelectItem value="11-20">11 à 20 utilisateurs</SelectItem>
                        <SelectItem value="21-50">21 à 50 utilisateurs</SelectItem>
                        <SelectItem value="50+">Plus de 50 utilisateurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Modules d'intérêt</Label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {modules.map((module) => (
                        <button
                          key={module}
                          type="button"
                          onClick={() => handleModuleToggle(module)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.modulesInteret.includes(module)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {module}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message libre (optionnel)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      placeholder="Décrivez vos besoins ou questions spécifiques..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" className="flex-1">
                      Envoyer la demande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    En soumettant ce formulaire, vous acceptez d'être contacté par l'équipe KT Optima.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Délai et organisation */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Délai et organisation
              </h2>
              <p className="text-lg text-muted-foreground">
                Une réponse rapide
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Après réception de votre demande :</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• vous êtes recontacté rapidement</li>
                        <li>• un créneau est proposé selon vos disponibilités</li>
                        <li>• la démonstration peut se faire à distance</li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Mail className="w-5 h-5 text-primary" />
                      <a href="mailto:contact@ktconsulting.info" className="text-foreground hover:text-primary transition-colors">
                        contact@ktconsulting.info
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <a href="tel:+21698704385" className="text-foreground hover:text-primary transition-colors">
                        +216 98 704 385
                      </a>
                    </div>
                  </div>
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
              Demander une démonstration personnalisée
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Prenez le temps de découvrir KT Optima dans votre contexte
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <a href="#formulaire">
                Remplir le formulaire
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
