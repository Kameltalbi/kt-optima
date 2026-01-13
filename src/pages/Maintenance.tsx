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
  DialogDescription,
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
  Plus,
  Search,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useFleet } from "@/hooks/use-fleet";
import { useCurrency } from "@/hooks/use-currency";
import type { Maintenance } from "@/types/database";

export default function Maintenance() {
  const { equipment, maintenance, createMaintenance, updateMaintenance, deleteMaintenance, getMaintenanceHistory } = useFleet();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  const [formData, setFormData] = useState({
    equipmentId: "",
    date: "",
    type: "maintenance" as Maintenance["type"],
    description: "",
    cost: 0,
    nextDueDate: "",
  });

  const typeLabels: Record<Maintenance["type"], string> = {
    maintenance: "Entretien",
    repair: "Réparation",
    inspection: "Contrôle",
  };

  const filteredMaintenance = maintenance.filter((m) => {
    const equipmentItem = equipment.find(e => e.id === m.equipmentId);
    const matchesSearch =
      equipmentItem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const upcomingMaintenance = maintenance.filter(m => {
    if (!m.nextDueDate) return false;
    const dueDate = new Date(m.nextDueDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  }).length;

  const handleCreate = () => {
    setFormData({
      equipmentId: "",
      date: "",
      type: "maintenance",
      description: "",
      cost: 0,
      nextDueDate: "",
    });
    setSelectedMaintenance(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaintenance) {
      updateMaintenance(selectedMaintenance.id, {
        ...formData,
        nextDueDate: formData.nextDueDate || undefined,
      });
    } else {
      createMaintenance({
        ...formData,
        nextDueDate: formData.nextDueDate || undefined,
      });
    }
    setIsCreateModalOpen(false);
    setSelectedMaintenance(null);
  };

  const handleEdit = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setFormData({
      equipmentId: m.equipmentId,
      date: m.date,
      type: m.type,
      description: m.description,
      cost: m.cost,
      nextDueDate: m.nextDueDate || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleViewHistory = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setIsHistoryModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entretien ?")) {
      deleteMaintenance(id);
    }
  };

  const history = selectedEquipmentId
    ? getMaintenanceHistory(selectedEquipmentId)
    : [];

  const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total entretiens</p>
                <p className="text-2xl font-bold">{maintenance.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coût total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entretiens à venir</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingMaintenance}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Entretiens</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un entretien
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par équipement ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="maintenance">Entretien</SelectItem>
                <SelectItem value="repair">Réparation</SelectItem>
                <SelectItem value="inspection">Contrôle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Prochaine échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucun entretien trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenance.map((m) => {
                    const equipmentItem = equipment.find(e => e.id === m.equipmentId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {equipmentItem?.name || 'Équipement supprimé'}
                        </TableCell>
                        <TableCell>
                          {new Date(m.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[m.type]}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {m.description}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(m.cost)}
                        </TableCell>
                        <TableCell>
                          {m.nextDueDate ? (
                            <span className="text-sm">
                              {new Date(m.nextDueDate).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewHistory(m.equipmentId)}
                              title="Voir l'historique"
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(m)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(m.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMaintenance ? "Modifier l'entretien" : "Ajouter un entretien"}
            </DialogTitle>
            <DialogDescription>
              Enregistrer une intervention sur un équipement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentId">Équipement *</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData({ ...formData, equipmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un équipement" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.reference})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date de l'entretien *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type d'intervention *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Maintenance["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Entretien</SelectItem>
                    <SelectItem value="repair">Réparation</SelectItem>
                    <SelectItem value="inspection">Contrôle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Détails de l'intervention..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Coût (TND) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Prochaine échéance</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedMaintenance(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedMaintenance ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des entretiens</DialogTitle>
            <DialogDescription>
              {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun historique d'entretien
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{typeLabels[m.type]}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(m.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{m.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Coût: {formatCurrency(m.cost)}
                        </p>
                        {m.nextDueDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Prochaine échéance: {new Date(m.nextDueDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
