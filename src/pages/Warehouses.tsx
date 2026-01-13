import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Warehouse,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Warehouse {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  actif: boolean;
  capacite?: number;
  description?: string;
  nombreProduits?: number;
  valeurStock?: number;
}

// Mock data
const mockWarehouses: Warehouse[] = [
  {
    id: "1",
    nom: "Entrepôt Principal",
    adresse: "Zone Industrielle",
    ville: "Casablanca",
    codePostal: "20000",
    telephone: "+212 522 123 456",
    email: "entrepot1@example.ma",
    responsable: "Ahmed Benali",
    actif: true,
    capacite: 5000,
    description: "Entrepôt principal pour le stockage des produits",
    nombreProduits: 5,
    valeurStock: 590900,
  },
  {
    id: "2",
    nom: "Entrepôt Secondaire",
    adresse: "Route de Rabat",
    ville: "Casablanca",
    codePostal: "20100",
    telephone: "+212 522 654 321",
    email: "entrepot2@example.ma",
    responsable: "Fatima Alaoui",
    actif: true,
    capacite: 3000,
    description: "Entrepôt secondaire pour les produits informatiques",
    nombreProduits: 3,
    valeurStock: 250000,
  },
  {
    id: "3",
    nom: "Dépôt Casablanca",
    adresse: "Avenue Mohammed V",
    ville: "Casablanca",
    codePostal: "20200",
    telephone: "+212 522 789 012",
    email: "depot.casa@example.ma",
    responsable: "Hassan Idrissi",
    actif: true,
    capacite: 2000,
    description: "Dépôt de distribution pour la région de Casablanca",
    nombreProduits: 2,
    valeurStock: 53000,
  },
  {
    id: "4",
    nom: "Ancien Entrepôt",
    adresse: "Zone Industrielle",
    ville: "Rabat",
    codePostal: "10000",
    telephone: "+212 537 111 222",
    responsable: "Mohamed Tazi",
    actif: false,
    capacite: 1500,
    description: "Entrepôt désactivé",
  },
];

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);

  // Form state
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    nom: "",
    adresse: "",
    ville: "",
    codePostal: "",
    telephone: "",
    email: "",
    responsable: "",
    actif: true,
    capacite: undefined,
    description: "",
  });

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch = warehouse.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && warehouse.actif) ||
      (statusFilter === "inactive" && !warehouse.actif);
    return matchesSearch && matchesStatus;
  });

  const activeWarehouses = warehouses.filter(w => w.actif).length;
  const totalValue = warehouses.filter(w => w.actif).reduce((sum, w) => sum + (w.valeurStock || 0), 0);

  const handleCreate = () => {
    setFormData({
      nom: "",
      adresse: "",
      ville: "",
      codePostal: "",
      telephone: "",
      email: "",
      responsable: "",
      actif: true,
      capacite: undefined,
      description: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData(warehouse);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (isCreateModalOpen) {
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        nom: formData.nom || "",
        adresse: formData.adresse || "",
        ville: formData.ville || "",
        codePostal: formData.codePostal,
        telephone: formData.telephone,
        email: formData.email,
        responsable: formData.responsable,
        actif: formData.actif ?? true,
        capacite: formData.capacite,
        description: formData.description,
        nombreProduits: 0,
        valeurStock: 0,
      };
      setWarehouses([...warehouses, newWarehouse]);
      setIsCreateModalOpen(false);
    } else if (isEditModalOpen && selectedWarehouse) {
      setWarehouses(warehouses.map(w => 
        w.id === selectedWarehouse.id ? { ...w, ...formData } : w
      ));
      setIsEditModalOpen(false);
      setSelectedWarehouse(null);
    }
    setFormData({
      nom: "",
      adresse: "",
      ville: "",
      codePostal: "",
      telephone: "",
      email: "",
      responsable: "",
      actif: true,
      capacite: undefined,
      description: "",
    });
  };

  const handleToggleStatus = (warehouse: Warehouse) => {
    setWarehouses(warehouses.map(w => 
      w.id === warehouse.id ? { ...w, actif: !w.actif } : w
    ));
  };

  return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total dépôts</p>
                  <p className="text-2xl font-bold mt-1">{warehouses.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Warehouse className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {activeWarehouses}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactifs</p>
                  <p className="text-2xl font-bold mt-1 text-muted-foreground">
                    {warehouses.length - activeWarehouses}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {totalValue.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, ville ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau dépôt
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nom</TableHead>
                    <TableHead className="font-semibold">Adresse</TableHead>
                    <TableHead className="font-semibold">Ville</TableHead>
                    <TableHead className="font-semibold">Responsable</TableHead>
                    <TableHead className="text-right font-semibold">Capacité</TableHead>
                    <TableHead className="text-right font-semibold">Références</TableHead>
                    <TableHead className="text-right font-semibold">Valeur stock</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun dépôt trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWarehouses.map((warehouse) => (
                      <TableRow key={warehouse.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{warehouse.nom}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{warehouse.adresse}</span>
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.ville}</TableCell>
                        <TableCell>{warehouse.responsable || '-'}</TableCell>
                        <TableCell className="text-right">
                          {warehouse.capacite ? `${warehouse.capacite.toLocaleString()} m²` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {warehouse.nombreProduits || 0}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {warehouse.valeurStock ? `${warehouse.valeurStock.toLocaleString()} MAD` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            warehouse.actif ? "bg-success/10 text-success border-0" : "bg-muted/10 text-muted-foreground border-0"
                          )}>
                            {warehouse.actif ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(warehouse)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleToggleStatus(warehouse)}
                            >
                              {warehouse.actif ? (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-success" />
                              )}
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

        {/* Modal pour créer un dépôt */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau dépôt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Entrepôt Principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  placeholder="Ex: Casablanca"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="Ex: Zone Industrielle, Rue..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codePostal">Code postal</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  placeholder="Ex: 20000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacite">Capacité (m²)</Label>
                <Input
                  id="capacite"
                  type="number"
                  value={formData.capacite || ""}
                  onChange={(e) => setFormData({ ...formData, capacite: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Ex: 5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+212 522 XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="depot@example.ma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="Nom du responsable"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du dépôt..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.nom || !formData.ville || !formData.adresse}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>

        {/* Modal pour éditer un dépôt */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le dépôt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ville">Ville *</Label>
                <Input
                  id="edit-ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-adresse">Adresse *</Label>
                <Input
                  id="edit-adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-codePostal">Code postal</Label>
                <Input
                  id="edit-codePostal"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacite">Capacité (m²)</Label>
                <Input
                  id="edit-capacite"
                  type="number"
                  value={formData.capacite || ""}
                  onChange={(e) => setFormData({ ...formData, capacite: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-responsable">Responsable</Label>
                <Input
                  id="edit-responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-actif">Statut</Label>
                <Select
                  value={formData.actif ? "active" : "inactive"}
                  onValueChange={(value) => setFormData({ ...formData, actif: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.nom || !formData.ville || !formData.adresse}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      </div>
  );
}
