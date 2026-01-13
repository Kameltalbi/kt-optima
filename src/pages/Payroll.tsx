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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Info,
  Calculator,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import type { Payroll } from "@/types/database";

export default function PayrollPage() {
  const { payrolls, employees, contracts, createPayroll, validatePayroll, calculatePayroll } = useHR();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    contract_id: "",
    period: "",
    date: new Date().toISOString().split('T')[0],
    salaryBrut: 0,
    prime: 0,
    indemnites: 0,
  });

  const filteredPayrolls = payrolls.filter((payroll) => {
    const employee = employees.find(e => e.id === payroll.employee_id);
    const matchesSearch =
      employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payroll.statut === statusFilter;
    const matchesPeriod = !periodFilter || payroll.period === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalBrut = payrolls.reduce((sum, p) => sum + p.salaryBrut, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netAPayer, 0);
  const pendingCount = payrolls.filter(p => p.statut === 'draft').length;
  const validatedCount = payrolls.filter(p => p.statut === 'validated').length;

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      contract_id: "",
      period: "",
      date: new Date().toISOString().split('T')[0],
      salaryBrut: 0,
      prime: 0,
      indemnites: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.employee_id || !formData.contract_id || !formData.period || !formData.salaryBrut) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const contract = contracts.find(c => c.id === formData.contract_id);
    if (!contract) {
      alert("Contrat introuvable");
      return;
    }

    createPayroll(
      formData.employee_id,
      formData.contract_id,
      formData.period,
      formData.date,
      formData.salaryBrut,
      {
        prime: formData.prime,
        indemnites: formData.indemnites,
        autres: 0,
      }
    );

    setIsCreateModalOpen(false);
    setFormData({
      employee_id: "",
      contract_id: "",
      period: "",
      date: new Date().toISOString().split('T')[0],
      salaryBrut: 0,
      prime: 0,
      indemnites: 0,
    });
  };

  const handleValidate = (payrollId: string) => {
    if (confirm("Valider cette paie générera automatiquement l'écriture comptable et l'échéance Finance. Continuer ?")) {
      validatePayroll(payrollId, true);
    }
  };

  const handleCalculate = () => {
    if (!formData.employee_id || !formData.salaryBrut) return;
    const calculated = calculatePayroll(formData.employee_id, formData.period, formData.salaryBrut);
    alert(`Salaire net estimé: ${calculated.netAPayer.toFixed(2)} TND`);
  };

  const selectedEmployee = formData.employee_id
    ? employees.find(e => e.id === formData.employee_id)
    : null;

  const availableContracts = formData.employee_id
    ? contracts.filter(c => c.employee_id === formData.employee_id && c.status === 'active')
    : [];

  const statusStyles = {
    draft: "bg-muted/10 text-muted-foreground border-0",
    validated: "bg-success/10 text-success border-0",
    paid: "bg-primary/10 text-primary border-0",
  };

  const statusLabels = {
    draft: "Brouillon",
    validated: "Validé",
    paid: "Payé",
  };

  // Générer les périodes disponibles (12 derniers mois)
  const generatePeriods = () => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      periods.push(period);
    }
    return periods;
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Calcul automatique des salaires, cotisations et retenues. Génération des bulletins de paie et intégration avec Finance et Comptabilité.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total brut</p>
                <p className="text-2xl font-bold mt-1">{totalBrut.toLocaleString()} TND</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total net</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {totalNet.toLocaleString()} TND
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
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
                <p className="text-sm font-medium text-muted-foreground">Validés</p>
                <p className="text-2xl font-bold mt-1 text-success">{validatedCount}</p>
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
              placeholder="Rechercher une paie..."
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
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les périodes</SelectItem>
              {generatePeriods().map(period => (
                <SelectItem key={period} value={period}>{period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Calculator className="w-4 h-4 mr-2" />
          Nouvelle paie
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Période</TableHead>
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="text-right font-semibold">Brut</TableHead>
                  <TableHead className="text-right font-semibold">Cotisations</TableHead>
                  <TableHead className="text-right font-semibold">Retenues</TableHead>
                  <TableHead className="text-right font-semibold">Net à payer</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune paie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayrolls.map((payroll) => {
                    const employee = employees.find(e => e.id === payroll.employee_id);
                    const totalCotisations = payroll.cotisations.cnss + payroll.cotisations.assurance +
                      payroll.cotisations.retraite + payroll.cotisations.autres;
                    const totalRetenues = payroll.retenues.irpp + payroll.retenues.autres;

                    return (
                      <TableRow key={payroll.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{payroll.period}</TableCell>
                        <TableCell>
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
                          <div className="text-xs text-muted-foreground">{employee?.matricule}</div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {payroll.salaryBrut.toLocaleString()} TND
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {totalCotisations.toFixed(2)} TND
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {totalRetenues.toFixed(2)} TND
                        </TableCell>
                        <TableCell className="text-right font-bold text-success">
                          {payroll.netAPayer.toLocaleString()} TND
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", statusStyles[payroll.statut])}>
                            {statusLabels[payroll.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(payroll)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            {payroll.statut === 'draft' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleValidate(payroll.id)}
                                title="Valider et générer écriture comptable"
                              >
                                <FileCheck className="w-4 h-4" />
                              </Button>
                            )}
                            {payroll.bulletinGenerated && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Télécharger le bulletin"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
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
            <DialogTitle>Nouvelle paie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employé *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, employee_id: value, contract_id: "" });
                  }}
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
                <Label htmlFor="contract_id">Contrat *</Label>
                <Select
                  value={formData.contract_id}
                  onValueChange={(value) => {
                    const contract = contracts.find(c => c.id === value);
                    setFormData({
                      ...formData,
                      contract_id: value,
                      salaryBrut: contract?.salary || 0,
                    });
                  }}
                  disabled={!formData.employee_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContracts.map(contract => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.type.toUpperCase()} - {contract.salary.toLocaleString()} TND
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Période * (YYYY-MM)</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="2024-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryBrut">Salaire brut (TND) *</Label>
                <Input
                  id="salaryBrut"
                  type="number"
                  value={formData.salaryBrut}
                  onChange={(e) => setFormData({ ...formData, salaryBrut: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculate}
                  disabled={!formData.employee_id || !formData.salaryBrut}
                  className="mt-6"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculer le net
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prime">Prime (TND)</Label>
                <Input
                  id="prime"
                  type="number"
                  value={formData.prime}
                  onChange={(e) => setFormData({ ...formData, prime: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indemnites">Indemnités (TND)</Label>
                <Input
                  id="indemnites"
                  type="number"
                  value={formData.indemnites}
                  onChange={(e) => setFormData({ ...formData, indemnites: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.employee_id || !formData.contract_id || !formData.period || !formData.salaryBrut}
              >
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bulletin de paie - {selectedPayroll?.period}
            </DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de la paie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employé</p>
                      <p className="font-medium">
                        {employees.find(e => e.id === selectedPayroll.employee_id)?.firstName}{' '}
                        {employees.find(e => e.id === selectedPayroll.employee_id)?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Période</p>
                      <p className="font-medium">{selectedPayroll.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(selectedPayroll.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className={cn("text-xs", statusStyles[selectedPayroll.statut])}>
                        {statusLabels[selectedPayroll.statut]}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Salaire brut</h4>
                    <p className="text-2xl font-bold">{selectedPayroll.salaryBrut.toLocaleString()} TND</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Cotisations sociales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CNSS</span>
                        <span>{selectedPayroll.cotisations.cnss.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assurance</span>
                        <span>{selectedPayroll.cotisations.assurance.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retraite</span>
                        <span>{selectedPayroll.cotisations.retraite.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total cotisations</span>
                        <span>
                          {(
                            selectedPayroll.cotisations.cnss +
                            selectedPayroll.cotisations.assurance +
                            selectedPayroll.cotisations.retraite +
                            selectedPayroll.cotisations.autres
                          ).toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Retenues</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>IRPP</span>
                        <span>{selectedPayroll.retenues.irpp.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total retenues</span>
                        <span>
                          {(selectedPayroll.retenues.irpp + selectedPayroll.retenues.autres).toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Avantages</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Prime</span>
                        <span>{selectedPayroll.avantages.prime.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indemnités</span>
                        <span>{selectedPayroll.avantages.indemnites.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg">Net à payer</h4>
                      <p className="text-2xl font-bold text-success">
                        {selectedPayroll.netAPayer.toLocaleString()} TND
                      </p>
                    </div>
                  </div>

                  {selectedPayroll.accountingEntryId && (
                    <Alert className="bg-success/5 border-success/20">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription>
                        Écriture comptable générée automatiquement (ID: {selectedPayroll.accountingEntryId})
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedPayroll.financeScheduleId && (
                    <Alert className="bg-info/5 border-info/20">
                      <Info className="h-4 w-4 text-info" />
                      <AlertDescription>
                        Échéance Finance créée (ID: {selectedPayroll.financeScheduleId})
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
