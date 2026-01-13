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
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFleet } from "@/hooks/use-fleet";
import { useHR } from "@/hooks/use-hr";
import type { Equipment } from "@/types/database";

export default function Equipment() {
  const { equipment, createEquipment, updateEquipment, deleteEquipment, getAssignmentHistory } = useFleet();
  const { employees } = useHR();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "vehicle" as Equipment["category"],
    reference: "",
    acquisitionDate: "",
    status: "active" as Equipment["status"],
    warehouseId: "",
    department: "",
    employeeId: "",
    comments: "",
  });

  const categoryLabels: Record<Equipment["category"], string> = {
    vehicle: "Véhicule",
    machine: "Machine",
    it: "Informatique",
    other: "Autre",
  };

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || eq.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = equipment.filter(e => e.status === 'active').length;
  const inactiveCount = equipment.filter(e => e.status === 'inactive').length;

  const handleCreate = () => {
    setFormData({
      name: "",
      category: "vehicle",
      reference: "",
      acquisitionDate: "",
      status: "active",
      warehouseId: "",
      department: "",
      employeeId: "",
      comments: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEquipment) {
      updateEquipment(selectedEquipment.id, {
        ...formData,
        warehouseId: formData.warehouseId || undefined,
        department: formData.department || undefined,
        employeeId: formData.employeeId || undefined,
        comments: formData.comments || undefined,
      });
    } else {
      createEquipment({
        ...formData,
        warehouseId: formData.warehouseId || undefined,
        department: formData.department || undefined,
        employeeId: formData.employeeId || undefined,
        comments: formData.comments || undefined,
      });
    }
    setIsCreateModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleEdit = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name,
      category: eq.category,
      reference: eq.reference,
      acquisitionDate: eq.acquisitionDate,
      status: eq.status,
      warehouseId: eq.warehouseId || "",
      department: eq.department || "",
      employeeId: eq.employeeId || "",
      comments: eq.comments || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsViewModalOpen(true);
  };

  const handleViewHistory = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsHistoryModalOpen(true);
  };

  const handleToggleStatus = (eq: Equipment) => {
    updateEquipment(eq.id, {
      status: eq.status === 'active' ? 'inactive' : 'active',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      deleteEquipment(id);
    }
  };

  const assignmentHistory = selectedEquipment
    ? getAssignmentHistory(selectedEquipment.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total équipements</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En service</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hors service</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Équipements</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un équipement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="vehicle">Véhicule</SelectItem>
                <SelectItem value="machine">Machine</SelectItem>
                <SelectItem value="it">Informatique</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">En service</SelectItem>
                <SelectItem value="inactive">Hors service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date acquisition</TableHead>
                  <TableHead>Affectation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucun équipement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[eq.category]}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{eq.reference}</TableCell>
                      <TableCell>
                        {new Date(eq.acquisitionDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {eq.department && <div>{eq.department}</div>}
                          {eq.employeeId && (
                            <div className="text-muted-foreground">
                              {employees.find(e => e.id === eq.employeeId)?.firstName} {employees.find(e => e.id === eq.employeeId)?.lastName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={eq.status === 'active' ? 'default' : 'destructive'}
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(eq)}
                        >
                          {eq.status === 'active' ? 'En service' : 'Hors service'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(eq)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewHistory(eq)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(eq)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(eq.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              {selectedEquipment ? "Modifier l'équipement" : "Ajouter un équipement"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'équipement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'équipement *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as Equipment["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Véhicule</SelectItem>
                    <SelectItem value="machine">Machine</SelectItem>
                    <SelectItem value="it">Informatique</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence / Matricule *</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Date d'acquisition *</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Service / Département</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: Logistique, Production..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Affecté à (employé)</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Equipment["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">En service</SelectItem>
                  <SelectItem value="inactive">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
                placeholder="Notes supplémentaires..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedEquipment(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedEquipment ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEquipment?.name}</DialogTitle>
            <DialogDescription>Détails de l'équipement</DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <p className="font-medium">{categoryLabels[selectedEquipment.category]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-mono font-medium">{selectedEquipment.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'acquisition</p>
                  <p className="font-medium">
                    {new Date(selectedEquipment.acquisitionDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={selectedEquipment.status === 'active' ? 'default' : 'destructive'}>
                    {selectedEquipment.status === 'active' ? 'En service' : 'Hors service'}
                  </Badge>
                </div>
                {selectedEquipment.department && (
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{selectedEquipment.department}</p>
                  </div>
                )}
                {selectedEquipment.employeeId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Affecté à</p>
                    <p className="font-medium">
                      {employees.find(e => e.id === selectedEquipment.employeeId)?.firstName}{' '}
                      {employees.find(e => e.id === selectedEquipment.employeeId)?.lastName}
                    </p>
                  </div>
                )}
              </div>
              {selectedEquipment.comments && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Commentaires</p>
                  <p className="text-sm">{selectedEquipment.comments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique des affectations</DialogTitle>
            <DialogDescription>
              {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          {assignmentHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun historique d'affectation
            </p>
          ) : (
            <div className="space-y-4">
              {assignmentHistory.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {new Date(assignment.startDate).toLocaleDateString('fr-FR')}
                          {assignment.endDate && ` - ${new Date(assignment.endDate).toLocaleDateString('fr-FR')}`}
                          {!assignment.endDate && ' (Actuel)'}
                        </p>
                        {assignment.department && (
                          <p className="text-sm text-muted-foreground">Service: {assignment.department}</p>
                        )}
                        {assignment.employeeId && (
                          <p className="text-sm text-muted-foreground">
                            Employé: {employees.find(e => e.id === assignment.employeeId)?.firstName}{' '}
                            {employees.find(e => e.id === assignment.employeeId)?.lastName}
                          </p>
                        )}
                        {assignment.comments && (
                          <p className="text-sm mt-2">{assignment.comments}</p>
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
