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
  DialogTrigger,
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
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePurchaseRequests, type DemandeAchat } from "@/hooks/use-purchase-requests";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { supabase } from "@/integrations/supabase/client";
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

export default function PurchaseRequests() {
  const { company, user } = useAuth();
  const { demandes, loading, createDemande, updateDemande, approveDemande, rejectDemande, deleteDemande, convertToPurchaseOrder } = usePurchaseRequests();
  const { formatCurrency: formatCurrencyAmount } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prioriteFilter, setPrioriteFilter] = useState<string>("all");
  const [selectedDemande, setSelectedDemande] = useState<DemandeAchat | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [convertDate, setConvertDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [adjustedLines, setAdjustedLines] = useState<Array<{ description: string; quantity: number; unit_price: number; tax_rate: number }>>([]);
  const [formData, setFormData] = useState({
    numero: "",
    date_demande: new Date().toISOString().split("T")[0],
    departement: "",
    priorite: "normale" as "basse" | "normale" | "haute" | "urgente",
    notes: "",
  });
  const [lignes, setLignes] = useState([
    { description: "", quantite: 1, prix_unitaire_estime: 0, unite: "", notes: "" },
  ]);

  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch = 
      demande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.departement?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || demande.statut === statusFilter;
    const matchesPriorite = prioriteFilter === "all" || demande.priorite === prioriteFilter;
    return matchesSearch && matchesStatus && matchesPriorite;
  });

  const totalDemandes = demandes.length;
  const enAttente = demandes.filter(d => d.statut === "en_attente").length;
  const approuvees = demandes.filter(d => d.statut === "approuvee").length;
  const totalEstime = demandes.reduce((sum, d) => {
    const totalLignes = d.lignes?.reduce((s, l) => s + (l.montant_estime || 0), 0) || 0;
    return sum + totalLignes;
  }, 0);

  const handleView = (demande: DemandeAchat) => {
    setSelectedDemande(demande);
    setIsViewModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      // Générer un numéro si vide
      let numero = formData.numero;
      if (!numero) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const count = demandes.length + 1;
        numero = `DA-${year}-${month}-${String(count).padStart(3, '0')}`;
      }

      // Filtrer les lignes vides (sans description)
      const lignesValides = lignes
        .filter(l => l.description.trim() !== "")
        .map((l, index) => ({
          description: l.description,
          quantite: l.quantite,
          prix_unitaire_estime: l.prix_unitaire_estime || undefined,
          montant_estime: l.prix_unitaire_estime ? l.prix_unitaire_estime * l.quantite : undefined,
          unite: l.unite || undefined,
          notes: l.notes || undefined,
          ordre: index,
        }));

      if (lignesValides.length === 0) {
        toast.error("Veuillez ajouter au moins une ligne avec une description");
        return;
      }

      await createDemande(
        {
          ...formData,
          numero,
          demandeur_id: user?.id || null,
        },
        lignesValides
      );
      
      setIsCreateModalOpen(false);
      setFormData({
        numero: "",
        date_demande: new Date().toISOString().split("T")[0],
        departement: "",
        priorite: "normale",
        notes: "",
      });
      setLignes([{ description: "", quantite: 1, prix_unitaire_estime: 0, unite: "", notes: "" }]);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleApprove = async (id: string) => {
    if (user?.id) {
      try {
        await approveDemande(id, user.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleReject = async (id: string) => {
    if (user?.id) {
      try {
        await rejectDemande(id, user.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette demande d'achat ?")) {
      try {
        await deleteDemande(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleSendForApproval = async (id: string) => {
    try {
      await updateDemande(id, { statut: "en_attente" });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleConvertClick = (demande: DemandeAchat) => {
    setSelectedDemande(demande);
    // Initialiser les lignes ajustées avec les prix estimés
    const lignes = demande.lignes?.map(l => ({
      description: l.description,
      quantity: l.quantite,
      unit_price: l.prix_unitaire_estime || 0,
      tax_rate: 19, // TVA par défaut 19%
    })) || [];
    setAdjustedLines(lignes);
    setIsConvertModalOpen(true);
  };

  const handleConvert = async () => {
    if (!selectedDemande || !selectedSupplierId) {
      toast.error("Veuillez sélectionner un fournisseur");
      return;
    }

    if (adjustedLines.length === 0) {
      toast.error("Aucune ligne à convertir");
      return;
    }

    try {
      await convertToPurchaseOrder(
        selectedDemande.id,
        selectedSupplierId,
        convertDate,
        adjustedLines
      );
      setIsConvertModalOpen(false);
      setSelectedDemande(null);
      setSelectedSupplierId("");
    } catch (error) {
      // Error handled by hook
    }
  };

  // Charger les fournisseurs
  useEffect(() => {
    const loadSuppliers = async () => {
      if (!company?.id) return;
      
      try {
        // Essayer d'abord suppliers, puis fournisseurs
        let data, error;
        ({ data, error } = await supabase
          .from('suppliers')
          .select('id, name')
          .eq('company_id', company.id)
          .order('name'));
        
        if (error && error.code === '42P01') {
          // Si suppliers n'existe pas, essayer fournisseurs
          ({ data, error } = await supabase
            .from('fournisseurs')
            .select('id, nom as name')
            .eq('company_id', company.id)
            .order('nom'));
        }

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    };

    loadSuppliers();
  }, [company?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Demandes d'achat</h2>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes d'achat internes avant création de bons de commande
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle demande d'achat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Numéro</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Auto-généré si vide"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_demande">Date de demande *</Label>
                  <Input
                    id="date_demande"
                    type="date"
                    value={formData.date_demande}
                    onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departement">Département</Label>
                  <Input
                    id="departement"
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    placeholder="Ex: IT, Achats, Production..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priorite">Priorité</Label>
                  <Select
                    value={formData.priorite}
                    onValueChange={(value: "basse" | "normale" | "haute" | "urgente") =>
                      setFormData({ ...formData, priorite: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                />
              </div>
              <div className="space-y-2">
                <Label>Lignes de demande</Label>
                <div className="space-y-3 border rounded-lg p-4">
                  {lignes.map((ligne, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={ligne.description}
                          onChange={(e) => {
                            const newLignes = [...lignes];
                            newLignes[index].description = e.target.value;
                            setLignes(newLignes);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={ligne.quantite}
                          onChange={(e) => {
                            const newLignes = [...lignes];
                            newLignes[index].quantite = parseFloat(e.target.value) || 0;
                            setLignes(newLignes);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="Unité"
                          value={ligne.unite}
                          onChange={(e) => {
                            const newLignes = [...lignes];
                            newLignes[index].unite = e.target.value;
                            setLignes(newLignes);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Prix unit."
                          value={ligne.prix_unitaire_estime}
                          onChange={(e) => {
                            const newLignes = [...lignes];
                            newLignes[index].prix_unitaire_estime = parseFloat(e.target.value) || 0;
                            setLignes(newLignes);
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        {lignes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLignes(lignes.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLignes([...lignes, { description: "", quantite: 1, prix_unitaire_estime: 0, unite: "", notes: "" }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ligne
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!formData.date_demande}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total demandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDemandes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{enAttente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approuvées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{approuvees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant total estimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrencyAmount(totalEstime)}
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
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuvee">Approuvée</SelectItem>
                  <SelectItem value="rejetee">Rejetée</SelectItem>
                  <SelectItem value="convertie">Convertie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={prioriteFilter} onValueChange={setPrioriteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les priorités" />
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
          <CardTitle>Liste des demandes d'achat</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : filteredDemandes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande d'achat trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant estimé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemandes.map((demande) => {
                  const montantTotal = demande.lignes?.reduce((sum, l) => sum + (l.montant_estime || 0), 0) || 0;
                  return (
                    <TableRow key={demande.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{demande.numero}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(demande.date_demande), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{demande.departement || "-"}</TableCell>
                      <TableCell>{demande.demandeur?.full_name || "-"}</TableCell>
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
                        {formatCurrencyAmount(montantTotal)}
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
                          {demande.statut === "brouillon" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendForApproval(demande.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {demande.statut === "en_attente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(demande.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReject(demande.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {demande.statut === "approuvee" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConvertClick(demande)}
                              title="Convertir en bon de commande"
                            >
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          {demande.statut === "brouillon" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(demande.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
                <div>
                  <Label className="text-sm text-muted-foreground">Demandeur</Label>
                  <p>{selectedDemande.demandeur?.full_name || "-"}</p>
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
                            {ligne.prix_unitaire_estime ? formatCurrencyAmount(ligne.prix_unitaire_estime) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {ligne.montant_estime ? formatCurrencyAmount(ligne.montant_estime) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Convert Modal */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convertir en bon de commande</DialogTitle>
          </DialogHeader>
          {selectedDemande && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold">Demande : {selectedDemande.numero}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Département: {selectedDemande.departement || "-"} | Priorité: {prioriteLabels[selectedDemande.priorite]}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fournisseur *</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="convertDate">Date du bon de commande *</Label>
                  <Input
                    id="convertDate"
                    type="date"
                    value={convertDate}
                    onChange={(e) => setConvertDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lignes du bon de commande</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-right">TVA %</TableHead>
                        <TableHead className="text-right">Total TTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adjustedLines.map((ligne, index) => {
                        const totalHT = ligne.quantity * ligne.unit_price;
                        const totalTTC = totalHT * (1 + ligne.tax_rate / 100);
                        return (
                          <TableRow key={index}>
                            <TableCell>{ligne.description}</TableCell>
                            <TableCell className="text-right">{ligne.quantity}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={ligne.unit_price}
                                onChange={(e) => {
                                  const newLines = [...adjustedLines];
                                  newLines[index].unit_price = parseFloat(e.target.value) || 0;
                                  setAdjustedLines(newLines);
                                }}
                                className="w-24 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={ligne.tax_rate}
                                onChange={(e) => {
                                  const newLines = [...adjustedLines];
                                  newLines[index].tax_rate = parseFloat(e.target.value) || 0;
                                  setAdjustedLines(newLines);
                                }}
                                className="w-20 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrencyAmount(totalTTC)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total HT: {formatCurrencyAmount(
                        adjustedLines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total TVA: {formatCurrencyAmount(
                        adjustedLines.reduce((sum, l) => {
                          const ht = l.quantity * l.unit_price;
                          return sum + (ht * l.tax_rate / 100);
                        }, 0)
                      )}
                    </p>
                    <p className="text-lg font-bold">
                      Total TTC: {formatCurrencyAmount(
                        adjustedLines.reduce((sum, l) => {
                          const ht = l.quantity * l.unit_price;
                          return sum + (ht * (1 + l.tax_rate / 100));
                        }, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConvert} 
              disabled={!selectedSupplierId || !convertDate || adjustedLines.length === 0}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Créer le bon de commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
