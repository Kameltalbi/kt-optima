import { useState } from "react";
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
import { 
  Plus, 
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";
import { useFinance, type Prevision, type CreatePrevisionData } from "@/hooks/use-finance";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

export default function Previsions() {
  const { 
    accounts, 
    previsions, 
    loading, 
    createPrevision, 
    updatePrevision,
    deletePrevision,
    fetchPrevisions,
    formatCurrency
  } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrevision, setSelectedPrevision] = useState<Prevision | null>(null);
  const [filterType, setFilterType] = useState<"all" | "entree" | "sortie">("all");
  const [filterStatut, setFilterStatut] = useState<"all" | "prevue" | "realisee" | "annulee">("all");
  const [formData, setFormData] = useState<CreatePrevisionData>({
    account_id: "",
    type: "entree",
    date_prevue: new Date().toISOString().split("T")[0],
    montant: 0,
    description: "",
    source_module: "manuel",
  });

  const handleCreate = async () => {
    try {
      await createPrevision(formData);
      setIsCreateModalOpen(false);
      setFormData({
        account_id: undefined,
        type: "entree",
        date_prevue: new Date().toISOString().split("T")[0],
        montant: 0,
        description: "",
        source_module: "manuel",
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = async () => {
    if (!selectedPrevision) return;
    try {
      await updatePrevision(selectedPrevision.id, formData);
      setIsEditModalOpen(false);
      setSelectedPrevision(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette prévision ?")) {
      try {
        await deletePrevision(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const openEditModal = (prevision: Prevision) => {
    setSelectedPrevision(prevision);
    setFormData({
      account_id: prevision.account_id || undefined,
      type: prevision.type,
      date_prevue: prevision.date_prevue,
      montant: prevision.montant,
      description: prevision.description,
      source_module: prevision.source_module || "manuel",
    });
    setIsEditModalOpen(true);
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "prevue":
        return "Prévue";
      case "realisee":
        return "Réalisée";
      case "annulee":
        return "Annulée";
      default:
        return statut;
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "prevue":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "realisee":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "annulee":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredPrevisions = previsions.filter((p) => {
    const matchesType = filterType === "all" || p.type === filterType;
    const matchesStatut = filterStatut === "all" || p.statut === filterStatut;
    return matchesType && matchesStatut;
  });

  const previsionsPrevues = filteredPrevisions.filter((p) => p.statut === "prevue");
  const totalEntreesPrevues = previsionsPrevues
    .filter((p) => p.type === "entree")
    .reduce((sum, p) => sum + p.montant, 0);
  const totalSortiesPrevues = previsionsPrevues
    .filter((p) => p.type === "sortie")
    .reduce((sum, p) => sum + p.montant, 0);
  const soldePrevu = totalEntreesPrevues - totalSortiesPrevues;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prévisions</h2>
          <p className="text-muted-foreground mt-1">
            Planifiez et suivez vos entrées et sorties prévues
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle prévision
        </Button>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle prévision</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "entree" | "sortie") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entree">Entrée</SelectItem>
                    <SelectItem value="sortie">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_prevue">Date prévue *</Label>
                <Input
                  id="date_prevue"
                  type="date"
                  value={formData.date_prevue}
                  onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant *</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la prévision"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_id">Compte (optionnel)</Label>
                <Select
                  value={formData.account_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun compte spécifique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun compte spécifique</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!formData.description || !formData.montant || !formData.date_prevue}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={(value: "all" | "entree" | "sortie") => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="sortie">Sorties</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Statut</Label>
              <Select value={filterStatut} onValueChange={(value: "all" | "prevue" | "realisee" | "annulee") => setFilterStatut(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="prevue">Prévue</SelectItem>
                  <SelectItem value="realisee">Réalisée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entrées prévues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntreesPrevues)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sorties prévues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSortiesPrevues)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde prévu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${soldePrevu >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(soldePrevu)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previsions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des prévisions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : filteredPrevisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune prévision enregistrée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date prévue</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrevisions.map((prevision) => (
                  <TableRow key={prevision.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(prevision.date_prevue), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {prevision.type === "entree" ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                        {prevision.type === "entree" ? "Entrée" : "Sortie"}
                      </Badge>
                    </TableCell>
                    <TableCell>{prevision.description}</TableCell>
                    <TableCell>
                      {prevision.source_module && (
                        <Badge variant="secondary">
                          {prevision.source_module === "ventes" ? "Ventes" :
                           prevision.source_module === "achats" ? "Achats" :
                           prevision.source_module === "paie" ? "Paie" : "Manuel"}
                        </Badge>
                      )}
                      {prevision.source_reference && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {prevision.source_reference}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getStatutIcon(prevision.statut)}
                        {getStatutLabel(prevision.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      prevision.type === "entree" ? "text-green-600" : "text-red-600"
                    }`}>
                      {prevision.type === "entree" ? "+" : "-"}
                      {formatCurrency(prevision.montant)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {prevision.statut === "prevue" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(prevision)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(prevision.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la prévision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "entree" | "sortie") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entree">Entrée</SelectItem>
                  <SelectItem value="sortie">Sortie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date_prevue">Date prévue *</Label>
              <Input
                id="edit-date_prevue"
                type="date"
                value={formData.date_prevue}
                onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-montant">Montant *</Label>
              <Input
                id="edit-montant"
                type="number"
                step="0.01"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={!formData.description || !formData.montant || !formData.date_prevue}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
