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
  DialogTrigger,
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
  Phone,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import { useAuth } from "@/contexts/AuthContext";
import type { HREmployee } from "@/types/database";

export default function Employees() {
  const { employees, createEmployee, updateEmployee } = useHR();
  const { companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<HREmployee | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<HREmployee>>({
    matricule: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    cin: "",
    position: "",
    department: "",
    hireDate: "",
    status: "active",
    company_id: companyId || "",
  });

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;

  const handleCreate = () => {
    setFormData({
      matricule: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      cin: "",
      position: "",
      department: "",
      hireDate: "",
      status: "active",
      company_id: companyId || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (employee: HREmployee) => {
    setSelectedEmployee(employee);
    setFormData(employee);
    setIsEditModalOpen(true);
  };

  const handleView = (employee: HREmployee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    if (isCreateModalOpen) {
      createEmployee(formData as any);
      setIsCreateModalOpen(false);
    } else if (isEditModalOpen && selectedEmployee) {
      updateEmployee(selectedEmployee.id, formData);
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    }
    setFormData({
      matricule: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      cin: "",
      position: "",
      department: "",
      hireDate: "",
      status: "active",
      company_id: companyId || "",
    });
  };

  const statusStyles = {
    active: "bg-success/10 text-success border-0",
    inactive: "bg-muted/10 text-muted-foreground border-0",
    suspended: "bg-warning/10 text-warning border-0",
  };

  const statusLabels = {
    active: "Actif",
    inactive: "Inactif",
    suspended: "Suspendu",
  };

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
                <p className="text-2xl font-bold mt-1">{employees.length}</p>
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
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                  <TableHead className="font-semibold">Date embauche</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{employee.matricule}</TableCell>
                      <TableCell>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusStyles[employee.status])}>
                          {statusLabels[employee.status]}
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
                    <Label htmlFor="matricule">Matricule *</Label>
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                      placeholder="EMP001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN *</Label>
                    <Input
                      id="cin"
                      value={formData.cin}
                      onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+216 12 345 678"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Date d'embauche *</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedEmployee(null);
              }}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.matricule || !formData.firstName || !formData.lastName || !formData.email}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dossier RH - {selectedEmployee?.firstName} {selectedEmployee?.lastName}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Matricule</p>
                      <p className="font-medium">{selectedEmployee.matricule}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CIN</p>
                      <p className="font-medium">{selectedEmployee.cin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de naissance</p>
                      <p className="font-medium">{new Date(selectedEmployee.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </p>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adresse
                      </p>
                      <p className="font-medium">{selectedEmployee.address}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Informations professionnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Poste</p>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Département</p>
                      <Badge variant="outline">{selectedEmployee.department}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date d'embauche
                      </p>
                      <p className="font-medium">{new Date(selectedEmployee.hireDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className={cn("text-xs", statusStyles[selectedEmployee.status])}>
                        {statusLabels[selectedEmployee.status]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
