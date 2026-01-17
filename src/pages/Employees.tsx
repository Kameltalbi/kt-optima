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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Users,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployes, Employe, CreateEmployeInput } from "@/hooks/use-employes";

export default function Employees() {
  const { 
    employes, 
    loading, 
    createEmploye, 
    updateEmploye, 
    activeCount, 
    inactiveCount, 
    departments 
  } = useEmployes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employe | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreateEmployeInput>({
    code: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    date_naissance: "",
    numero_cin: "",
    numero_cnss: "",
    poste: "",
    departement: "",
    date_embauche: new Date().toISOString().split("T")[0],
    salaire_base: 0,
    type_contrat: "CDI",
    banque: "",
    rib: "",
    actif: true,
    notes: "",
  });

  const filteredEmployees = employes.filter((emp) => {
    const matchesSearch =
      (emp.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && emp.actif) || 
      (statusFilter === "inactive" && !emp.actif);
    const matchesDepartment = departmentFilter === "all" || emp.departement === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleCreate = () => {
    setFormData({
      code: "",
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      date_naissance: "",
      numero_cin: "",
      numero_cnss: "",
      poste: "",
      departement: "",
      date_embauche: new Date().toISOString().split("T")[0],
      salaire_base: 0,
      type_contrat: "CDI",
      banque: "",
      rib: "",
      actif: true,
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (employee: Employe) => {
    setSelectedEmployee(employee);
    setFormData({
      code: employee.code || "",
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email || "",
      telephone: employee.telephone || "",
      adresse: employee.adresse || "",
      date_naissance: employee.date_naissance || "",
      numero_cin: employee.numero_cin || "",
      numero_cnss: employee.numero_cnss || "",
      poste: employee.poste || "",
      departement: employee.departement || "",
      date_embauche: employee.date_embauche,
      date_depart: employee.date_depart || undefined,
      type_contrat: employee.type_contrat || "CDI",
      banque: employee.banque || "",
      rib: employee.rib || "",
      salaire_base: employee.salaire_base,
      type_contrat: employee.type_contrat || "CDI",
      banque: employee.banque || "",
      rib: employee.rib || "",
      actif: employee.actif,
      notes: employee.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleView = (employee: Employe) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nom || !formData.prenom || !formData.date_embauche) {
      return;
    }

    setIsSaving(true);
    try {
      if (isCreateModalOpen) {
        await createEmploye(formData);
        setIsCreateModalOpen(false);
      } else if (isEditModalOpen && selectedEmployee) {
        await updateEmploye(selectedEmployee.id, formData);
        setIsEditModalOpen(false);
        setSelectedEmployee(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const statusStyles = {
    active: "bg-success/10 text-success border-0",
    inactive: "bg-muted/10 text-muted-foreground border-0",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Gestion complète des employés avec fiches détaillées et accès au dossier RH.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total employés</p>
                <p className="text-2xl font-bold mt-1">{employes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold mt-1 text-success">{activeCount}</p>
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
                <p className="text-2xl font-bold mt-1 text-muted-foreground">{inactiveCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Départements</p>
                <p className="text-2xl font-bold mt-1">{departments.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <Users className="w-5 h-5 text-secondary" />
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
              placeholder="Rechercher un employé..."
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
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Matricule</TableHead>
                  <TableHead className="font-semibold">Nom complet</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Salaire base</TableHead>
                  <TableHead className="font-semibold">Date embauche</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{employee.code || "-"}</TableCell>
                      <TableCell>
                        <div className="font-medium">{employee.prenom} {employee.nom}</div>
                      </TableCell>
                      <TableCell>{employee.poste || "-"}</TableCell>
                      <TableCell>
                        {employee.departement ? (
                          <Badge variant="outline">{employee.departement}</Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {employee.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{employee.email}</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{employee.salaire_base.toLocaleString()} TND</TableCell>
                      <TableCell>
                        {new Date(employee.date_embauche).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", employee.actif ? statusStyles.active : statusStyles.inactive)}>
                          {employee.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(employee)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="w-4 h-4" />
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
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? "Nouvel employé" : "Modifier l'employé"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
                <TabsTrigger value="professional">Informations professionnelles</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Matricule</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="EMP001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_cin">CIN</Label>
                    <Input
                      id="numero_cin"
                      value={formData.numero_cin}
                      onChange={(e) => setFormData({ ...formData, numero_cin: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="+216 12 345 678"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poste">Poste</Label>
                    <Input
                      id="poste"
                      value={formData.poste}
                      onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departement">Département</Label>
                    <Input
                      id="departement"
                      value={formData.departement}
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_embauche">Date d'embauche *</Label>
                    <Input
                      id="date_embauche"
                      type="date"
                      value={formData.date_embauche}
                      onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaire_base">Salaire de base (TND) *</Label>
                    <Input
                      id="salaire_base"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salaire_base}
                      onChange={(e) => setFormData({ ...formData, salaire_base: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type_contrat">Type de contrat</Label>
                    <Select
                      value={formData.type_contrat || "CDI"}
                      onValueChange={(value: "CDI" | "CDD" | "Journalier") => setFormData({ ...formData, type_contrat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="Journalier">Journalier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_cnss">N° CNSS</Label>
                    <Input
                      id="numero_cnss"
                      value={formData.numero_cnss}
                      onChange={(e) => setFormData({ ...formData, numero_cnss: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banque">Banque</Label>
                    <Input
                      id="banque"
                      value={formData.banque}
                      onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
                      placeholder="Nom de la banque"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rib">RIB</Label>
                    <Input
                      id="rib"
                      value={formData.rib}
                      onChange={(e) => setFormData({ ...formData, rib: e.target.value })}
                      placeholder="Relevé d'Identité Bancaire"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actif">Statut</Label>
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
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isCreateModalOpen ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fiche employé</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-medium">{selectedEmployee.code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{selectedEmployee.prenom} {selectedEmployee.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEmployee.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedEmployee.telephone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Poste</p>
                  <p className="font-medium">{selectedEmployee.poste || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Département</p>
                  <p className="font-medium">{selectedEmployee.departement || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salaire de base</p>
                  <p className="font-medium">{selectedEmployee.salaire_base.toLocaleString()} TND</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'embauche</p>
                  <p className="font-medium">{new Date(selectedEmployee.date_embauche).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">N° CIN</p>
                  <p className="font-medium">{selectedEmployee.numero_cin || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">N° CNSS</p>
                  <p className="font-medium">{selectedEmployee.numero_cnss || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={cn("text-xs", selectedEmployee.actif ? statusStyles.active : statusStyles.inactive)}>
                    {selectedEmployee.actif ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
