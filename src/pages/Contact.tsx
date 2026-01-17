import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    entreprise: "",
    sujet: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email || !formData.message) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    // TODO: Envoyer le formulaire à l'API
    toast.success("Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.");
    
    // Reset form
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      entreprise: "",
      sujet: "",
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
                src="/kt optima (500 x 192 px).png" 
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
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              Une question ? Un besoin spécifique ? Notre équipe est à votre écoute.
            </p>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Informations de contact */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Informations de contact
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Vous pouvez nous contacter par email, téléphone ou via le formulaire ci-contre.
                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <a 
                            href="mailto:contact@ktconsulting.info" 
                            className="text-primary hover:underline"
                          >
                            contact@ktconsulting.info
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Téléphone</h3>
                          <a 
                            href="tel:+21698704385" 
                            className="text-primary hover:underline"
                          >
                            +216 98 704 385
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Adresse</h3>
                          <p className="text-muted-foreground">
                            Tunisie
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Formulaire de contact */}
              <div>
                <Card className="border-2">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom *</Label>
                          <Input
                            id="nom"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prenom">Prénom</Label>
                          <Input
                            id="prenom"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telephone">Téléphone</Label>
                          <Input
                            id="telephone"
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            placeholder="+216 12 345 678"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entreprise">Entreprise</Label>
                        <Input
                          id="entreprise"
                          value={formData.entreprise}
                          onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sujet">Sujet</Label>
                        <Input
                          id="sujet"
                          value={formData.sujet}
                          onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                          placeholder="Objet de votre message"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={6}
                          required
                          placeholder="Décrivez votre demande..."
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        En soumettant ce formulaire, vous acceptez d'être contacté par l'équipe KT Optima.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prêt à découvrir KT Optima ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Demandez une démonstration personnalisée adaptée à vos besoins
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/demo">
                Demander une démonstration
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
