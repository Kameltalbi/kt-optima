import { useState, useEffect, useRef } from "react";
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
  Menu,
  Sparkles,
  Rocket,
  BarChart3,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/layout/Footer";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const modules = [
    { icon: ShoppingCart, title: "Achats", description: "Gestion des bons de commande, réceptions et factures fournisseurs", color: "from-blue-500 to-cyan-500" },
    { icon: Package, title: "Stock", description: "Inventaire, mouvements, alertes et gestion multi-dépôts", color: "from-purple-500 to-pink-500" },
    { icon: Wallet, title: "Finance", description: "Trésorerie, banques, échéanciers et rapprochements", color: "from-green-500 to-emerald-500" },
    { icon: Calculator, title: "Comptabilité", description: "Plan comptable, écritures, grand livre et balance (PCG tunisien)", color: "from-orange-500 to-red-500" },
    { icon: UserCheck, title: "Ressources Humaines", description: "Employés, contrats, paie, absences, documents et évaluations", color: "from-indigo-500 to-blue-500" },
    { icon: TrendingUp, title: "Ventes", description: "Devis, factures clients et suivi des ventes", color: "from-teal-500 to-cyan-500" },
  ];

  const stats = [
    { value: "100%", label: "Cloud", icon: Cloud },
    { value: "24/7", label: "Disponibilité", icon: Zap },
    { value: "99.9%", label: "Uptime", icon: Shield },
    { value: "1000+", label: "Entreprises", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/ktoptima.png" 
                alt="KTOptima" 
                className="h-20 w-auto object-contain transition-transform hover:scale-105"
              />
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#fonctionnalites" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
                Fonctionnalités
              </a>
              <a href="#modules" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
                Modules
              </a>
              <Link to="/pricing" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
                Tarifs
              </Link>
            </nav>

            {/* CTA Buttons Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild className="transition-all duration-300 hover:scale-105">
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button asChild className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Link to="/register">Créer un compte</Link>
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
                      Fonctionnalités
                    </a>
                    <a 
                      href="#modules" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Modules
                    </a>
                    <Link 
                      to="/pricing" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Tarifs
                    </Link>
                    <div className="border-t pt-4 mt-4 space-y-3">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          Se connecter
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                          Créer un compte
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

      {/* Hero Section - Enhanced with animations */}
      <section 
        ref={heroRef}
        className="relative py-20 sm:py-32 bg-gradient-to-br from-background via-primary/5 to-muted/20 overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Section 1 - Texte et CTA */}
            <div 
              className="text-center lg:text-left space-y-6"
              data-animate
              id="hero-text"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>ERP Moderne & Intuitif</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-in-up">
                Une seule plateforme pour{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  piloter l'ensemble
                </span>{" "}
                de votre entreprise
            </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 animate-slide-in-up delay-200">
              Centralisez vos opérations, maîtrisez votre trésorerie et structurez vos processus avec un ERP pensé pour la croissance.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-in-up delay-300">
                <Button 
                  size="lg" 
                  asChild 
                  className="text-lg px-8 group hover:scale-105 transition-all duration-300 hover:shadow-xl"
                >
                <Link to="/register">
                  Créer un compte
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="text-lg px-8 hover:scale-105 transition-all duration-300 hover:shadow-lg"
                >
                <Link to="/login">Se connecter</Link>
              </Button>
              </div>
            </div>

            {/* Section 2 - Vidéo with enhanced effects */}
            <div 
              className="w-full relative group"
              data-animate
              id="hero-video"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-muted/30 transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent z-10" />
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-[400px] object-cover"
                  aria-label="Présentation KTOptima"
                >
                  <source src="/video-ktoptima.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  data-animate
                >
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problème → Solution - Enhanced */}
      <section id="fonctionnalites" className="py-20 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pour qui est <span className="text-primary">KT OPTIMA</span> ?
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                Pensé pour les entreprises qui veulent garder le contrôle
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Dirigeant */}
              <Card 
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30 border-2"
                data-animate
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Dirigeant
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Une vision claire de l'activité, sans dépendre de plusieurs outils.
                  </p>
                </CardContent>
              </Card>

              {/* Finance / Trésorerie */}
              <Card 
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30 border-2"
                data-animate
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Finance / Trésorerie
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Des chiffres fiables, en temps réel, sans Excel ni retraitement.
                  </p>
                </CardContent>
              </Card>

              {/* Équipes */}
              <Card 
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30 border-2"
                data-animate
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <UserCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    Équipes
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Des outils simples, adaptés à leur métier, sans complexité inutile.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section - Enhanced with animations */}
      <section id="modules" className="py-20 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Modules <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Complets</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une suite complète de modules pour gérer tous les aspects de votre entreprise
            </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-2 hover:border-primary/30 cursor-pointer overflow-hidden relative"
                    data-animate
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    <CardContent className="p-6 relative z-10">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                  </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        {module.description}
                  </p>
                </CardContent>
              </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche - Enhanced */}
      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comment ça marche ?</h2>
              <p className="text-muted-foreground text-lg">
              En 3 étapes simples, commencez à gérer votre entreprise efficacement
            </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Créez votre compte", desc: "Inscription rapide en quelques clics, sans engagement", icon: Rocket },
                { step: "2", title: "Configurez votre société", desc: "Paramétrez votre entreprise et activez les modules nécessaires", icon: Target },
                { step: "3", title: "Gérez vos opérations", desc: "Commencez immédiatement à utiliser l'ERP, accessible 24/7", icon: BarChart3 },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    data-animate
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Icon className="w-10 h-10 text-white" />
                </div>
                    <div className="text-3xl font-bold text-primary mb-2">{item.step}</div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cibles - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pour qui ?</h2>
              <p className="text-muted-foreground text-lg">
              Adapté à tous les types d'entreprises
            </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Users, title: "PME", desc: "Solutions adaptées aux petites et moyennes entreprises" },
                { icon: FileCheck, title: "Cabinets comptables", desc: "Gestion multi-clients avec comptabilité complète" },
                { icon: Zap, title: "Startups", desc: "Démarrage rapide avec modules évolutifs" },
                { icon: Building2, title: "Entreprises multi-sites", desc: "Gestion centralisée avec multi-dépôts et multi-sociétés" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30 cursor-pointer"
                    data-animate
                  >
                <CardContent className="p-6">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        {item.desc}
                  </p>
                </CardContent>
              </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Confiance & Sécurité - Enhanced */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12" data-animate>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Confiance & Sécurité</h2>
              <p className="text-muted-foreground text-lg">
              Vos données sont protégées et sécurisées
            </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Données sécurisées", desc: "Chiffrement des données et accès sécurisés" },
                { icon: Lock, title: "Rôles et permissions", desc: "Contrôle d'accès granulaire par utilisateur" },
                { icon: Cloud, title: "Hébergement sécurisé", desc: "Infrastructure cloud performante et fiable" },
                { icon: Database, title: "Sauvegardes automatiques", desc: "Sauvegardes quotidiennes pour protéger vos données" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30"
                    data-animate
                  >
                <CardContent className="p-6">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        {item.desc}
                  </p>
                </CardContent>
              </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center" data-animate>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Rejoignez-nous dès aujourd'hui</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Prêt à transformer votre{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                gestion d'entreprise
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez des centaines d'entreprises qui font confiance à BilvoxaERP
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="text-lg px-8 group hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <Link to="/register">
                  Créer un compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-8 hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Link to="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        [data-animate] {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        [data-animate].visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
