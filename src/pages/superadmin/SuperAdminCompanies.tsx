import { useState, useEffect } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Company {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  currency: string;
  language: string;
  created_at: string | null;
  status?: "active" | "suspended";
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
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Add mock status (all active for now)
      const companiesWithStatus = (data || []).map((c) => ({
        ...c,
        status: "active" as const,
      }));

      setCompanies(companiesWithStatus);
      setFilteredCompanies(companiesWithStatus);
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

  const handleActivate = (company: Company) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, status: "active" as const } : c))
    );
    toast({
      title: "Entreprise activée",
      description: `${company.name} a été activée avec succès.`,
    });
  };

  const handleSuspend = (company: Company) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, status: "suspended" as const } : c))
    );
    toast({
      title: "Entreprise suspendue",
      description: `${company.name} a été suspendue.`,
    });
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };

  const handleEdit = (company: Company) => {
    toast({
      title: "Modifier l'entreprise",
      description: `Fonctionnalité en cours de développement pour ${company.name}`,
    });
  };

  const handleExtendSubscription = (company: Company) => {
    toast({
      title: "Prolonger l'abonnement",
      description: `Abonnement de ${company.name} prolongé de 30 jours.`,
    });
  };

  const handleValidatePayment = (company: Company) => {
    toast({
      title: "Paiement validé",
      description: `Le paiement de ${company.name} a été validé.`,
    });
  };

  const handleAddModule = (company: Company) => {
    toast({
      title: "Ajouter un module",
      description: `Sélection de module pour ${company.name} en cours de développement.`,
    });
  };

  const handleAddUser = (company: Company) => {
    toast({
      title: "Ajouter un utilisateur",
      description: `Ajout d'utilisateur pour ${company.name} en cours de développement.`,
    });
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

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
            <p className="text-muted-foreground mt-1">
              Gérer les entreprises de la plateforme
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
                    <TableHead>Statut</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                          <Badge
                            variant={company.status === "active" ? "default" : "destructive"}
                            className={
                              company.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {company.status === "active" ? "Active" : "Suspendue"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Standard</Badge>
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
                            <DropdownMenuContent align="end" className="w-52 bg-popover">
                              <DropdownMenuItem onClick={() => handleViewDetails(company)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(company)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExtendSubscription(company)}>
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Prolonger abonnement
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleValidatePayment(company)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Valider paiement
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddModule(company)}>
                                <PackagePlus className="h-4 w-4 mr-2" />
                                Ajouter un module
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddUser(company)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Ajouter utilisateur
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {company.status === "suspended" ? (
                                <DropdownMenuItem onClick={() => handleActivate(company)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleSuspend(company)}
                                  className="text-amber-600 focus:text-amber-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspendre
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteRequest(company)}
                                className="text-destructive focus:text-destructive"
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
              <DialogDescription>Informations techniques</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                    <Badge
                      variant={selectedCompany.status === "active" ? "default" : "destructive"}
                      className={
                        selectedCompany.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {selectedCompany.status === "active" ? "Active" : "Suspendue"}
                    </Badge>
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
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Créée le:</span>
                    <span>
                      {selectedCompany.created_at
                        ? format(new Date(selectedCompany.created_at), "dd MMMM yyyy 'à' HH:mm", {
                            locale: fr,
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
