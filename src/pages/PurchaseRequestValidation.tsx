import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePurchaseRequests, type DemandeAchat } from "@/hooks/use-purchase-requests";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";

const statusStyles = {
  approuvee: "bg-success/10 text-success border-0",
  en_attente: "bg-warning/10 text-warning border-0",
  convertie: "bg-info/10 text-info border-0",
  rejetee: "bg-destructive/10 text-destructive border-0",
  brouillon: "bg-muted/10 text-muted-foreground border-0",
  annulee: "bg-destructive/10 text-destructive border-0",
};

const statusLabels = {
  approuvee: "Approuvée",
  en_attente: "En attente",
  convertie: "Convertie",
  rejetee: "Rejetée",
  brouillon: "Brouillon",
  annulee: "Annulée",
};

const prioriteStyles = {
  urgente: "bg-red-100 text-red-800 border-red-300",
  haute: "bg-orange-100 text-orange-800 border-orange-300",
  normale: "bg-blue-100 text-blue-800 border-blue-300",
  basse: "bg-gray-100 text-gray-800 border-gray-300",
};

const prioriteLabels = {
  urgente: "Urgente",
  haute: "Haute",
  normale: "Normale",
  basse: "Basse",
};

export default function PurchaseRequestValidation() {
  const { company, user } = useAuth();
  const { demandes, loading, approveDemande, rejectDemande, fetchDemandes } = usePurchaseRequests();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("en_attente");
  const [prioriteFilter, setPrioriteFilter] = useState<string>("all");
  const [selectedDemande, setSelectedDemande] = useState<DemandeAchat | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filtrer les demandes en attente de validation
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente");
  const demandesApprouvees = demandes.filter(d => d.statut === "approuvee");
  const demandesRejetees = demandes.filter(d => d.statut === "rejetee");

  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch = 
      demande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.departement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.demandeur?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || demande.statut === statusFilter;
    const matchesPriorite = prioriteFilter === "all" || demande.priorite === prioriteFilter;
    return matchesSearch && matchesStatus && matchesPriorite;
  });

  const totalEnAttente = demandesEnAttente.length;
  const totalApprouvees = demandesApprouvees.length;
  const totalRejetees = demandesRejetees.length;
  const montantEnAttente = demandesEnAttente.reduce((sum, d) => {
    const totalLignes = d.lignes?.reduce((s, l) => s + (l.montant_estime || 0), 0) || 0;
    return sum + totalLignes;
  }, 0);

  const handleView = (demande: DemandeAchat) => {
    setSelectedDemande(demande);
    setIsViewModalOpen(true);
  };

  const handleApproveClick = (demande: DemandeAchat) => {
    setSelectedDemande(demande);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (demande: DemandeAchat) => {
    setSelectedDemande(demande);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedDemande || !user?.id) return;

    try {
      await approveDemande(selectedDemande.id, user.id);
      setIsApproveModalOpen(false);
      setSelectedDemande(null);
      toast.success("Demande d'achat approuvée avec succès");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async () => {
    if (!selectedDemande || !user?.id) return;

    if (!rejectReason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }

    try {
      await rejectDemande(selectedDemande.id, user.id, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedDemande(null);
      setRejectReason("");
    } catch (error) {
      // Error handled by hook
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchDemandes();
    }
  }, [company?.id, fetchDemandes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Validation des demandes d'achat</h2>
        <p className="text-muted-foreground mt-1">
          Approuvez ou rejetez les demandes d'achat en attente de validation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalEnAttente}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(montantEnAttente)} à valider
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Approuvées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalApprouvees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejetées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalRejetees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Montant en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(montantEnAttente)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, département, demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuvee">Approuvée</SelectItem>
                  <SelectItem value="rejetee">Rejetée</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={prioriteFilter} onValueChange={setPrioriteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes à valider</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : filteredDemandes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant estimé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemandes.map((demande) => {
                  const montantTotal = demande.lignes?.reduce((sum, l) => sum + (l.montant_estime || 0), 0) || 0;
                  const joursEnAttente = demande.statut === "en_attente" 
                    ? Math.floor((new Date().getTime() - new Date(demande.date_demande).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  
                  return (
                    <TableRow key={demande.id} className={cn(
                      demande.statut === "en_attente" && joursEnAttente > 7 && "bg-warning/5"
                    )}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{demande.numero}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(demande.date_demande), "dd MMM yyyy", { locale: fr })}</span>
                          {demande.statut === "en_attente" && joursEnAttente > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {joursEnAttente} jour{joursEnAttente > 1 ? "s" : ""} en attente
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{demande.demandeur?.full_name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{demande.departement || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", prioriteStyles[demande.priorite])}>
                          {prioriteLabels[demande.priorite]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", statusStyles[demande.statut])}>
                          {statusLabels[demande.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(montantTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(demande)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {demande.statut === "en_attente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApproveClick(demande)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRejectClick(demande)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la demande d'achat</DialogTitle>
          </DialogHeader>
          {selectedDemande && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Numéro</Label>
                  <p className="font-semibold">{selectedDemande.numero}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedDemande.date_demande), "dd MMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Demandeur</Label>
                  <p>{selectedDemande.demandeur?.full_name || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Département</Label>
                  <p>{selectedDemande.departement || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Priorité</Label>
                  <Badge variant="outline" className={cn("text-xs", prioriteStyles[selectedDemande.priorite])}>
                    {prioriteLabels[selectedDemande.priorite]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <Badge variant="outline" className={cn("text-xs", statusStyles[selectedDemande.statut])}>
                    {statusLabels[selectedDemande.statut]}
                  </Badge>
                </div>
              </div>
              {selectedDemande.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedDemande.notes}</p>
                </div>
              )}
              {selectedDemande.lignes && selectedDemande.lignes.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Lignes</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead className="text-right">Prix unit. estimé</TableHead>
                        <TableHead className="text-right">Montant estimé</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDemande.lignes.map((ligne) => (
                        <TableRow key={ligne.id}>
                          <TableCell>{ligne.description}</TableCell>
                          <TableCell className="text-right">{ligne.quantite}</TableCell>
                          <TableCell>{ligne.unite || "-"}</TableCell>
                          <TableCell className="text-right">
                            {ligne.prix_unitaire_estime ? formatCurrency(ligne.prix_unitaire_estime) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {ligne.montant_estime ? formatCurrency(ligne.montant_estime) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <Label className="text-sm text-muted-foreground">Total estimé</Label>
                        <p className="text-lg font-bold">
                          {formatCurrency(
                            selectedDemande.lignes.reduce((sum, l) => sum + (l.montant_estime || 0), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande d'achat</DialogTitle>
          </DialogHeader>
          {selectedDemande && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir approuver la demande <strong>{selectedDemande.numero}</strong> ?
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Montant total estimé</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedDemande.lignes?.reduce((sum, l) => sum + (l.montant_estime || 0), 0) || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApprove} className="bg-success hover:bg-success/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande d'achat</DialogTitle>
          </DialogHeader>
          {selectedDemande && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir rejeter la demande <strong>{selectedDemande.numero}</strong> ?
              </p>
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Raison du rejet *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indiquez la raison du rejet..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              disabled={!rejectReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
