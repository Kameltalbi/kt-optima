import { useState, useEffect } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Ban,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Hash,
  Edit,
  Trash2,
  CalendarPlus,
  CreditCard,
  PackagePlus,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths, addYears } from "date-fns";
import { fr } from "date-fns/locale";
import { plans } from "@/pages/Pricing";

type PlanType = "depart" | "starter" | "business" | "enterprise";
type SubscriptionStatus = "active" | "suspended" | "cancelled" | "expired";

interface Company {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  currency: string;
  language: string;
  plan?: PlanType;
  created_at: string | null;
  subscription?: {
    id: string;
    plan: PlanType;
    status: SubscriptionStatus;
    start_date: string;
    end_date: string | null;
    billing_cycle: "monthly" | "yearly" | null;
    price: number | null;
  };
}

export default function SuperAdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  // Modals
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Form states
  const [newPlan, setNewPlan] = useState<PlanType>("depart");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [extendDays, setExtendDays] = useState(30);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  const loadCompanies = async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (companiesError) throw companiesError;

      // Load subscriptions
      const { data: subscriptionsData } = await supabase
        .from("subscriptions")
        .select("*");

      const subscriptionsMap = new Map(
        (subscriptionsData || []).map((sub) => [sub.company_id, sub])
      );

      const companiesWithSubs = (companiesData || []).map((company) => {
        const subscription = subscriptionsMap.get(company.id);
        return {
          ...company,
          plan: company.plan as PlanType || "depart",
          subscription: subscription
            ? {
                id: subscription.id,
                plan: subscription.plan as PlanType,
                status: subscription.status as SubscriptionStatus,
                start_date: subscription.start_date,
                end_date: subscription.end_date,
                billing_cycle: subscription.billing_cycle as "monthly" | "yearly" | null,
                price: subscription.price,
              }
            : undefined,
        };
      });

      setCompanies(companiesWithSubs);
      setFilteredCompanies(companiesWithSubs);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les entreprises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedCompany) return;

    try {
      // Update company plan
      const { error: companyError } = await supabase
        .from("companies")
        .update({ plan: newPlan })
        .eq("id", selectedCompany.id);

      if (companyError) throw companyError;

      // Update or create subscription
      if (selectedCompany.subscription) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            plan: newPlan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedCompany.subscription.id);

        if (subError) throw subError;
      } else {
        const planData = plans.find((p) => p.id === newPlan);
        const price = billingCycle === "yearly" ? planData?.annualPrice : planData?.monthlyPrice;

        const { error: subError } = await supabase.from("subscriptions").insert({
          company_id: selectedCompany.id,
          plan: newPlan,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: billingCycle === "yearly"
            ? addYears(new Date(), 1).toISOString()
            : addMonths(new Date(), 1).toISOString(),
          billing_cycle: billingCycle,
          price: price || 0,
          currency: "TND",
        });

        if (subError) throw subError;
      }

      toast({
        title: "Plan modifié",
        description: `Le plan de ${selectedCompany.name} a été changé vers ${plans.find((p) => p.id === newPlan)?.name}.`,
      });

      setPlanModalOpen(false);
      loadCompanies();
    } catch (error: unknown) {
      console.error("Error changing plan:", error);
      const msg = (error as { message?: string })?.message || (error as { error_description?: string })?.error_description || "Impossible de modifier le plan";
      toast({
        title: "Erreur",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  const handleValidatePayment = async () => {
    if (!selectedCompany) return;

    try {
      const planData = plans.find((p) => p.id === newPlan);
      const price = billingCycle === "yearly" ? planData?.annualPrice : planData?.monthlyPrice;

      // Create or update subscription
      if (selectedCompany.subscription) {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan: newPlan,
            start_date: new Date().toISOString(),
            end_date: billingCycle === "yearly"
              ? addYears(new Date(), 1).toISOString()
              : addMonths(new Date(), 1).toISOString(),
            billing_cycle: billingCycle,
            price: price || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedCompany.subscription.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert({
          company_id: selectedCompany.id,
          plan: newPlan,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: billingCycle === "yearly"
            ? addYears(new Date(), 1).toISOString()
            : addMonths(new Date(), 1).toISOString(),
          billing_cycle: billingCycle,
          price: price || 0,
          currency: "TND",
        });

        if (error) throw error;
      }

      // Update company plan
      const { error: companyError } = await supabase
        .from("companies")
        .update({ plan: newPlan })
        .eq("id", selectedCompany.id);

      if (companyError) throw companyError;

      toast({
        title: "Paiement validé",
        description: `L'accès a été accordé à ${selectedCompany.name} pour le plan ${plans.find((p) => p.id === newPlan)?.name}.`,
      });

      setPaymentModalOpen(false);
      loadCompanies();
    } catch (error: unknown) {
      console.error("Error validating payment:", error);
      const msg = (error as { message?: string })?.message || (error as { error_description?: string })?.error_description || "Impossible de valider le paiement";
      toast({
        title: "Erreur",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedCompany?.subscription) return;

    try {
      const currentEndDate = selectedCompany.subscription.end_date
        ? new Date(selectedCompany.subscription.end_date)
        : new Date();
      const newEndDate = addDays(currentEndDate, extendDays);

      const { error } = await supabase
        .from("subscriptions")
        .update({
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCompany.subscription.id);

      if (error) throw error;

      toast({
        title: "Abonnement prolongé",
        description: `L'abonnement de ${selectedCompany.name} a été prolongé de ${extendDays} jours.`,
      });

      setExtendModalOpen(false);
      loadCompanies();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast({
        title: "Erreur",
        description: "Impossible de prolonger l'abonnement",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    if (!selectedCompany) return;

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: newUser.name,
        email: newUser.email,
        company_id: selectedCompany.id,
        role: "user",
      });

      if (profileError) throw profileError;

      toast({
        title: "Utilisateur ajouté",
        description: `${newUser.name} a été ajouté à ${selectedCompany.name}.`,
      });

      setUserModalOpen(false);
      setNewUser({ name: "", email: "", password: "" });
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (company: Company) => {
    try {
      if (company.subscription) {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "suspended", updated_at: new Date().toISOString() })
          .eq("id", company.subscription.id);

        if (error) throw error;
      }

      toast({
        title: "Entreprise suspendue",
        description: `${company.name} a été suspendue.`,
      });

      loadCompanies();
    } catch (error) {
      console.error("Error suspending company:", error);
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'entreprise",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (company: Company) => {
    try {
      if (company.subscription) {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", company.subscription.id);

        if (error) throw error;
      }

      toast({
        title: "Entreprise activée",
        description: `${company.name} a été activée avec succès.`,
      });

      loadCompanies();
    } catch (error) {
      console.error("Error activating company:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer l'entreprise",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };

  const handleDeleteRequest = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyToDelete.id);

      if (error) throw error;

      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      toast({
        title: "Entreprise supprimée",
        description: `${companyToDelete.name} a été supprimée définitivement.`,
      });
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  const getPlanName = (plan?: PlanType) => {
    if (!plan) return "Non défini";
    return plans.find((p) => p.id === plan)?.name || plan;
  };

  const getStatusBadge = (status?: SubscriptionStatus) => {
    if (!status) return <Badge variant="outline">Sans abonnement</Badge>;
    
    const variants: Record<SubscriptionStatus, { variant: "default" | "destructive" | "secondary"; className?: string }> = {
      active: { variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      suspended: { variant: "destructive" },
      cancelled: { variant: "secondary" },
      expired: { variant: "destructive" },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status === "active" ? "Active" : status === "suspended" ? "Suspendue" : status === "cancelled" ? "Annulée" : "Expirée"}
      </Badge>
    );
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
            <p className="text-muted-foreground mt-1">
              Gérer les entreprises, plans et abonnements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {companies.length} entreprise{companies.length > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Entreprises</CardTitle>
            <CardDescription>
              Vue d'ensemble des entreprises inscrites sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune entreprise trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {company.currency} • {company.language.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{company.email || "-"}</p>
                            <p className="text-muted-foreground">{company.phone || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getPlanName(company.plan)}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(company.subscription?.status)}
                        </TableCell>
                        <TableCell>
                          {company.subscription?.end_date ? (
                            <div className="text-sm">
                              <p className="font-medium">
                                {format(new Date(company.subscription.end_date), "dd MMM yyyy", { locale: fr })}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {company.subscription.billing_cycle === "yearly" ? "Annuel" : "Mensuel"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {company.created_at
                            ? format(new Date(company.created_at), "dd MMM yyyy", { locale: fr })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => handleViewDetails(company)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setNewPlan(company.plan || "depart");
                                  setPaymentModalOpen(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Valider paiement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setNewPlan(company.plan || "depart");
                                  setPlanModalOpen(true);
                                }}
                              >
                                {company.plan === "enterprise" ? (
                                  <>
                                    <ArrowDown className="h-4 w-4 mr-2" />
                                    Downgrader plan
                                  </>
                                ) : (
                                  <>
                                    <ArrowUp className="h-4 w-4 mr-2" />
                                    Upgrader plan
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setExtendModalOpen(true);
                                }}
                              >
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Prolonger abonnement
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setUserModalOpen(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Ajouter utilisateur
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {company.subscription?.status === "suspended" ||
                              company.subscription?.status === "expired" ? (
                                <DropdownMenuItem onClick={() => handleActivate(company)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleSuspend(company)}
                                  className="text-amber-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspendre
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteRequest(company)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Company Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails de l'entreprise</DialogTitle>
              <DialogDescription>Informations complètes</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedCompany.subscription?.status)}
                      <Badge variant="outline">{getPlanName(selectedCompany.plan)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{selectedCompany.id}</code>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedCompany.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span>{selectedCompany.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Adresse:</span>
                    <span>{selectedCompany.address || "-"}</span>
                  </div>
                  {selectedCompany.subscription && (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Début:</span>
                        <span>
                          {format(new Date(selectedCompany.subscription.start_date), "dd MMMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                      </div>
                      {selectedCompany.subscription.end_date && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fin:</span>
                          <span>
                            {format(new Date(selectedCompany.subscription.end_date), "dd MMMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le plan</DialogTitle>
              <DialogDescription>
                Modifier le plan de {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nouveau plan</Label>
                <Select value={newPlan} onValueChange={(value) => setNewPlan(value as PlanType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.monthlyPrice === 0 ? "Gratuit" : `${plan.monthlyPrice} DT/mois`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newPlan !== "depart" && (
                <div className="space-y-2">
                  <Label>Période de facturation</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleChangePlan}>
                {selectedCompany?.plan === "enterprise" || (selectedCompany?.plan && plans.findIndex(p => p.id === selectedCompany.plan) < plans.findIndex(p => p.id === newPlan)) ? "Downgrader" : "Upgrader"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Validate Payment Dialog */}
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valider le paiement</DialogTitle>
              <DialogDescription>
                Accorder l'accès à {selectedCompany?.name} après validation du paiement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={newPlan} onValueChange={(value) => setNewPlan(value as PlanType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.monthlyPrice === 0 ? "Gratuit" : `${plan.monthlyPrice} DT/mois`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newPlan !== "depart" && (
                <div className="space-y-2">
                  <Label>Période de facturation</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleValidatePayment}>Valider le paiement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extend Subscription Dialog */}
        <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prolonger l'abonnement</DialogTitle>
              <DialogDescription>
                Prolonger la période d'utilisation pour {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de jours</Label>
                <Input
                  type="number"
                  min="1"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)}
                />
              </div>
              {selectedCompany?.subscription?.end_date && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Date actuelle de fin:</p>
                  <p className="font-medium">
                    {format(new Date(selectedCompany.subscription.end_date), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Nouvelle date de fin:</p>
                  <p className="font-medium">
                    {format(
                      addDays(new Date(selectedCompany.subscription.end_date), extendDays),
                      "dd MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleExtendSubscription}>Prolonger</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
              <DialogDescription>
                Créer un nouvel utilisateur pour {selectedCompany?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nom de l'utilisateur"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mot de passe temporaire"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.password}
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l'entreprise{" "}
                <strong>{companyToDelete?.name}</strong> ? Cette action est irréversible
                et supprimera toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminLayout>
  );
}
