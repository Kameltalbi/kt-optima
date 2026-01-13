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
import {
  Plus,
  Search,
  FileText,
  Edit,
  History,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import { useAuth } from "@/contexts/AuthContext";
import type { HRContract } from "@/types/database";

export default function HRContracts() {
  const { contracts, employees, saveContracts, getActiveContract } = useHR();
  const { companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<HRContract | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<HRContract>>({
    employee_id: "",
    type: "cdi",
    startDate: "",
    endDate: "",
    salary: 0,
    position: "",
    department: "",
    status: "active",
    company_id: "1",
  });

  const filteredContracts = contracts.filter((contract) => {
    const employee = employees.find(e => e.id === contract.employee_id);
    const matchesSearch =
      employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || contract.type === typeFilter;
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const expiredContracts = contracts.filter(c => c.status === 'expired').length;

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      type: "cdi",
      startDate: "",
      endDate: "",
      salary: 0,
      position: "",
      department: "",
      status: "active",
      company_id: companyId || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (contract: HRContract) => {
    setSelectedContract(contract);
    setFormData(contract);
    setIsEditModalOpen(true);
  };

  const handleViewHistory = (employeeId: string) => {
    setSelectedContract(contracts.find(c => c.employee_id === employeeId) || null);
    setIsHistoryModalOpen(true);
  };

  const handleSave = () => {
    if (isCreateModalOpen) {
      // Vérifier qu'il n'y a pas déjà un contrat actif
      const activeContract = getActiveContract(formData.employee_id!);
      if (activeContract && formData.status === 'active') {
        alert("Cet employé a déjà un contrat actif. Veuillez d'abord terminer le contrat existant.");
        return;
      }

      const newContract: HRContract = {
        ...formData as HRContract,
        id: `contract_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveContracts([...contracts, newContract]);
      setIsCreateModalOpen(false);
    } else if (isEditModalOpen && selectedContract) {
      saveContracts(contracts.map(c =>
        c.id === selectedContract.id
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      ));
      setIsEditModalOpen(false);
      setSelectedContract(null);
    }
    setFormData({
      employee_id: "",
      type: "cdi",
      startDate: "",
      endDate: "",
      salary: 0,
      position: "",
      department: "",
      status: "active",
      company_id: companyId || "",
    });
  };

  const typeLabels = {
    cdi: "CDI",
    cdd: "CDD",
    stage: "Stage",
    consultant: "Consultant",
  };

  const statusStyles = {
    active: "bg-success/10 text-success border-0",
    expired: "bg-muted/10 text-muted-foreground border-0",
    terminated: "bg-destructive/10 text-destructive border-0",
  };

  const statusLabels = {
    active: "Actif",
    expired: "Expiré",
    terminated: "Résilié",
  };

  const employeeContracts = selectedContract
    ? contracts.filter(c => c.employee_id === selectedContract.employee_id).sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    : [];

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Gestion des contrats de travail. Un seul contrat actif par employé est autorisé.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total contrats</p>
                <p className="text-2xl font-bold mt-1">{contracts.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contrats actifs</p>
                <p className="text-2xl font-bold mt-1 text-success">{activeContracts}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Contrats expirés</p>
                <p className="text-2xl font-bold mt-1 text-muted-foreground">{expiredContracts}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/10">
                <XCircle className="w-5 h-5 text-muted-foreground" />
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
              placeholder="Rechercher un contrat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="cdi">CDI</SelectItem>
              <SelectItem value="cdd">CDD</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="consultant">Consultant</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="expired">Expiré</SelectItem>
              <SelectItem value="terminated">Résilié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau contrat
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Poste</TableHead>
                  <TableHead className="font-semibold">Département</TableHead>
                  <TableHead className="font-semibold">Salaire</TableHead>
                  <TableHead className="font-semibold">Date début</TableHead>
                  <TableHead className="font-semibold">Date fin</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun contrat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => {
                    const employee = employees.find(e => e.id === contract.employee_id);
                    return (
                      <TableRow key={contract.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
                          <div className="text-xs text-muted-foreground">{employee?.matricule}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[contract.type]}</Badge>
                        </TableCell>
                        <TableCell>{contract.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.department}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {contract.salary.toLocaleString()} TND
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contract.endDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", statusStyles[contract.status])}>
                            {statusLabels[contract.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewHistory(contract.employee_id)}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(contract)}
                            >
                              <Edit className="w-4 h-4" />
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
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedContract(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? "Nouveau contrat" : "Modifier le contrat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employé *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de contrat *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => {
                    setFormData({ ...formData, type: value });
                    if (value === 'cdi') {
                      setFormData(prev => ({ ...prev, endDate: undefined }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              {formData.type !== 'cdi' && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="salary">Salaire brut (TND) *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                />
              </div>
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
                    <SelectItem value="expired">Expiré</SelectItem>
                    <SelectItem value="terminated">Résilié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedContract(null);
              }}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.employee_id || !formData.startDate || !formData.salary || !formData.position}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historique des contrats</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedContract && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Employé: {employees.find(e => e.id === selectedContract.employee_id)?.firstName} {employees.find(e => e.id === selectedContract.employee_id)?.lastName}
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date début</TableHead>
                        <TableHead>Date fin</TableHead>
                        <TableHead>Salaire</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <Badge variant="outline">{typeLabels[contract.type]}</Badge>
                          </TableCell>
                          <TableCell>{new Date(contract.startDate).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            {contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : '-'}
                          </TableCell>
                          <TableCell>{contract.salary.toLocaleString()} TND</TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", statusStyles[contract.status])}>
                              {statusLabels[contract.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
