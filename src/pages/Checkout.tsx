import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, MessageCircle, CreditCard, Banknote, FileText, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { plans } from "./Pricing";
import { useApp } from "@/context/AppContext";

const paymentMethods = [
  {
    id: "especes",
    name: "Espèces",
    icon: Banknote,
    description: "Paiement en espèces lors de la livraison",
  },
  {
    id: "cheque",
    name: "Chèque",
    icon: FileText,
    description: "Paiement par chèque",
  },
  {
    id: "virement",
    name: "Virement bancaire",
    icon: CreditCard,
    description: "Virement bancaire (RIB fourni après confirmation)",
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "depart";
  const { profile, company } = useApp();
  
  const [selectedPlan, setSelectedPlan] = useState(plans.find(p => p.id === planId) || plans[0]);
  const [paymentMethod, setPaymentMethod] = useState("virement");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [planId]);

  // Pre-fill contact info from user profile and company data
  useEffect(() => {
    if (profile || company) {
      setContactInfo(prev => ({
        ...prev,
        name: profile?.full_name || prev.name,
        email: company?.email || prev.email,
        phone: company?.phone || profile?.phone || prev.phone,
        company: company?.name || prev.company,
        address: company?.address || prev.address,
      }));
    }
  }, [profile, company]);

  const calculatePrice = () => {
    if (selectedPlan.monthlyPrice === 0) return 0;
    return billingCycle === "yearly" ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuit";
    return `${price} DT`;
  };

  const handleWhatsAppContact = () => {
    const message = `Bonjour, je souhaite souscrire au plan ${selectedPlan.name} (${formatPrice(calculatePrice())}${billingCycle === "yearly" ? "/an" : "/mois"}).

Informations de contact:
- Nom: ${contactInfo.name || "Non renseigné"}
- Email: ${contactInfo.email || "Non renseigné"}
- Téléphone: ${contactInfo.phone || "Non renseigné"}
- Entreprise: ${contactInfo.company || "Non renseigné"}
- Adresse: ${contactInfo.address || "Non renseigné"}

Méthode de paiement: ${paymentMethods.find(m => m.id === paymentMethod)?.name || "Non sélectionnée"}
${contactInfo.notes ? `\nNotes: ${contactInfo.notes}` : ""}`;

    const whatsappUrl = `https://wa.me/21698704385?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const isFormValid = () => {
    return contactInfo.name.trim() !== "" && 
           contactInfo.email.trim() !== "" && 
           contactInfo.phone.trim() !== "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/pricing"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tarifs
            </Link>
            <h1 className="text-3xl font-bold">Finaliser votre commande</h1>
            <p className="text-muted-foreground mt-2">
              Complétez vos informations pour finaliser votre abonnement
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Plan & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan sélectionné</CardTitle>
                  <CardDescription>Vous pouvez changer de plan si nécessaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPlan.id === plan.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedPlan.id === plan.id
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {selectedPlan.id === plan.id && (
                                <Check className="w-3 h-3 text-primary-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{plan.name}</span>
                                {plan.badge && (
                                  <Badge variant="outline">{plan.badge}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {plan.monthlyPrice === 0 ? (
                                "Gratuit"
                              ) : (
                                <>
                                  {billingCycle === "yearly" ? plan.annualPrice : plan.monthlyPrice} DT
                                  <span className="text-sm text-muted-foreground">/mois</span>
                                </>
                              )}
                            </div>
                            {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Économisez {Math.round(plan.monthlyPrice * 12 - plan.annualPrice)} DT/an
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedPlan.monthlyPrice > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Période de facturation</Label>
                        <div className="flex gap-4">
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="billing"
                              value="monthly"
                              checked={billingCycle === "monthly"}
                              onChange={() => setBillingCycle("monthly")}
                              className="w-4 h-4"
                            />
                            Mensuel
                          </Label>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="billing"
                              value="yearly"
                              checked={billingCycle === "yearly"}
                              onChange={() => setBillingCycle("yearly")}
                              className="w-4 h-4"
                            />
                            Annuel
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de paiement</CardTitle>
                  <CardDescription>Choisissez votre méthode de paiement préférée</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              paymentMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  paymentMethod === method.id
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {paymentMethod === method.id && (
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-5 h-5 text-muted-foreground" />
                                  <Label className="font-semibold cursor-pointer">
                                    {method.name}
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                  <CardDescription>
                    Ces informations seront utilisées pour finaliser votre abonnement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Nom complet <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={contactInfo.name}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Téléphone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+216 XX XXX XXX"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        placeholder="Nom de l'entreprise"
                        value={contactInfo.company}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, company: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="Adresse complète"
                      value={contactInfo.address}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes supplémentaires</Label>
                    <Textarea
                      id="notes"
                      placeholder="Informations complémentaires (optionnel)"
                      rows={3}
                      value={contactInfo.notes}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, notes: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-semibold">{selectedPlan.name}</span>
                    </div>
                    {selectedPlan.monthlyPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Période</span>
                        <span className="font-semibold">
                          {billingCycle === "yearly" ? "Annuel" : "Mensuel"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Méthode de paiement</span>
                      <span className="font-semibold">
                        {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(calculatePrice())}
                          {selectedPlan.monthlyPrice > 0 && (
                            <span className="text-sm text-muted-foreground">
                              /{billingCycle === "yearly" ? "an" : "mois"}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleWhatsAppContact}
                      disabled={!isFormValid()}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contacter via WhatsApp
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Un membre de notre équipe vous contactera pour finaliser votre abonnement
                    </p>
                  </div>

                  {selectedPlan.monthlyPrice > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                          Pour les paiements par virement, vous recevrez les coordonnées bancaires
                          après confirmation de votre commande.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
