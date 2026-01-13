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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import { useAuth } from "@/contexts/AuthContext";
import type { Leave } from "@/types/database";

export default function Leaves() {
  const { leaves, leaveBalances, employees, saveLeaves } = useHR();
  const { companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    type: "annual" as Leave['type'],
    startDate: "",
    endDate: "",
    days: 0,
  });

  const filteredLeaves = leaves.filter((leave) => {
    const employee = employees.find(e => e.id === leave.employee_id);
    const matchesSearch =
      employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || leave.status === statusFilter;
    const matchesType = typeFilter === "all" || leave.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      type: "annual",
      startDate: "",
      endDate: "",
      days: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsViewModalOpen(true);
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSave = () => {
    if (!formData.employee_id || !formData.startDate || !formData.endDate) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      alert("La date de fin doit être après la date de début");
      return;
    }

    const newLeave: Leave = {
      id: `leave_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      employee_id: formData.employee_id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      status: 'pending',
      requestedDate: new Date().toISOString(),
      company_id: companyId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveLeaves([...leaves, newLeave]);
    setIsCreateModalOpen(false);
    setFormData({
      employee_id: "",
      type: "annual",
      startDate: "",
      endDate: "",
      days: 0,
    });
  };

  const handleApprove = (leaveId: string) => {
    saveLeaves(leaves.map(l =>
      l.id === leaveId
        ? { ...l, status: 'approved' as const, approvedBy: 'current_user', approvedDate: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : l
    ));
  };

  const handleReject = (leaveId: string, reason: string) => {
    saveLeaves(leaves.map(l =>
      l.id === leaveId
        ? { ...l, status: 'rejected' as const, rejectionReason: reason, updatedAt: new Date().toISOString() }
        : l
    ));
  };

  const typeLabels = {
    annual: "Congés annuels",
    sick: "Congés maladie",
    maternity: "Congé maternité",
    paternity: "Congé paternité",
    unpaid: "Sans solde",
    other: "Autre",
  };

  const statusStyles = {
    pending: "bg-warning/10 text-warning border-0",
    approved: "bg-success/10 text-success border-0",
    rejected: "bg-destructive/10 text-destructive border-0",
    cancelled: "bg-muted/10 text-muted-foreground border-0",
  };

  const statusLabels = {
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    cancelled: "Annulé",
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Gestion des demandes de congés avec validation hiérarchique et suivi des soldes.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total demandes</p>
                <p className="text-2xl font-bold mt-1">{leaves.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold mt-1 text-warning">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold mt-1 text-success">{approvedCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
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
              placeholder="Rechercher une demande..."
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
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="annual">Congés annuels</SelectItem>
              <SelectItem value="sick">Congés maladie</SelectItem>
              <SelectItem value="maternity">Congé maternité</SelectItem>
              <SelectItem value="paternity">Congé paternité</SelectItem>
              <SelectItem value="unpaid">Sans solde</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
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
                  <TableHead className="font-semibold">Date début</TableHead>
                  <TableHead className="font-semibold">Date fin</TableHead>
                  <TableHead className="font-semibold">Jours</TableHead>
                  <TableHead className="font-semibold">Date demande</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaves.map((leave) => {
                    const employee = employees.find(e => e.id === leave.employee_id);
                    return (
                      <TableRow key={leave.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
                          <div className="text-xs text-muted-foreground">{employee?.matricule}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[leave.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {new Date(leave.startDate).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{leave.days} jours</TableCell>
                        <TableCell>
                          {new Date(leave.requestedDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", statusStyles[leave.status])}>
                            {statusLabels[leave.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(leave)}
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                            {leave.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-success"
                                  onClick={() => handleApprove(leave.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => {
                                    const reason = prompt("Raison du rejet:");
                                    if (reason) handleReject(leave.id, reason);
                                  }}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
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

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de congé</DialogTitle>
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
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de congé *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Congés annuels</SelectItem>
                    <SelectItem value="sick">Congés maladie</SelectItem>
                    <SelectItem value="maternity">Congé maternité</SelectItem>
                    <SelectItem value="paternity">Congé paternité</SelectItem>
                    <SelectItem value="unpaid">Sans solde</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (formData.endDate) {
                      const days = calculateDays(e.target.value, formData.endDate);
                      setFormData(prev => ({ ...prev, days }));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (formData.startDate) {
                      const days = calculateDays(formData.startDate, e.target.value);
                      setFormData(prev => ({ ...prev, days }));
                    }
                  }}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Nombre de jours calculé</Label>
                <Input
                  value={formData.days}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.employee_id || !formData.startDate || !formData.endDate}
              >
                Envoyer la demande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employé</p>
                  <p className="font-medium">
                    {employees.find(e => e.id === selectedLeave.employee_id)?.firstName}{' '}
                    {employees.find(e => e.id === selectedLeave.employee_id)?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{typeLabels[selectedLeave.type]}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date début</p>
                  <p className="font-medium">{new Date(selectedLeave.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date fin</p>
                  <p className="font-medium">{new Date(selectedLeave.endDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre de jours</p>
                  <p className="font-medium">{selectedLeave.days} jours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className={cn("text-xs", statusStyles[selectedLeave.status])}>
                    {statusLabels[selectedLeave.status]}
                  </Badge>
                </div>
                {selectedLeave.approvedBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approuvé par</p>
                    <p className="font-medium">{selectedLeave.approvedBy}</p>
                  </div>
                )}
                {selectedLeave.approvedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'approbation</p>
                    <p className="font-medium">{new Date(selectedLeave.approvedDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedLeave.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Raison du rejet</p>
                    <p className="font-medium">{selectedLeave.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
