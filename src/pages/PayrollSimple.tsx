import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, FileText, Download, Info, CheckCircle, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayrollNew } from '@/hooks/use-payroll-new';
import { useEmployes } from '@/hooks/use-employes';
import { toast } from 'sonner';
import { generatePayslipPDFSimple } from '@/components/payroll/PayslipPDFSimple';
import { useAuth } from '@/contexts/AuthContext';

export default function PayrollSimple() {
  const { company } = useAuth();
  const { employes } = useEmployes();
  const { settings, brackets, calculatePayroll, createPayslip, payslips, loadPayslips, deletePayslip } = usePayrollNew();

  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    gross_salary: '',
    bonuses: '',
    overtime: '',
    family_situation: 'single',
    number_of_children: 0
  });

  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCalculate = () => {
    if (!formData.employee_id || !formData.gross_salary) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!settings || brackets.length === 0) {
      toast.error('Paramètres de paie non chargés. Veuillez configurer les paramètres dans les réglages.');
      return;
    }

    setIsCalculating(true);

    try {
      const input = {
        grossSalary: parseFloat(formData.gross_salary),
        bonuses: parseFloat(formData.bonuses) || 0,
        overtime: parseFloat(formData.overtime) || 0,
        familySituation: formData.family_situation,
        numberOfChildren: formData.number_of_children
      };

      const result = calculatePayroll(input, settings, brackets);
      setCalculation(result);
    } catch (error) {
      console.error('Erreur calcul:', error);
      toast.error('Erreur lors du calcul');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!calculation) {
      toast.error('Veuillez d\'abord calculer le salaire');
      return;
    }

    if (!formData.employee_id) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }

    const employee = employes.find(e => e.id === formData.employee_id);
    if (!employee) {
      toast.error('Employé non trouvé');
      return;
    }

    try {
      // Générer le PDF
      const pdfBlob = generatePayslipPDFSimple({
        employee: {
          id: employee.id,
          nom: employee.nom,
          prenom: employee.prenom,
          code: employee.code,
          poste: employee.poste,
          departement: employee.departement,
          numero_cnss: employee.numero_cnss || null
        },
        month: formData.month,
        year: formData.year,
        grossSalary: calculation.grossSalary,
        bonuses: parseFloat(formData.bonuses) || 0,
        overtime: parseFloat(formData.overtime) || 0,
        familySituation: formData.family_situation,
        numberOfChildren: formData.number_of_children,
        cnss: calculation.cnss,
        irpp: calculation.monthlyIRPP,
        css: calculation.css,
        netSalary: calculation.netSalary,
        company: company || null
      });

      // Sauvegarder le PDF dans Supabase Storage (ou simplement créer le bulletin)
      // Pour l'instant, on crée le bulletin sans le chemin PDF
      const payslip = await createPayslip(
        formData.employee_id,
        formData.month,
        formData.year,
        {
          grossSalary: parseFloat(formData.gross_salary),
          bonuses: parseFloat(formData.bonuses) || 0,
          overtime: parseFloat(formData.overtime) || 0,
          familySituation: formData.family_situation,
          numberOfChildren: formData.number_of_children
        }
      );

      if (payslip) {
        // Télécharger le PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulletin-paie-${employee.nom}-${formData.year}-${String(formData.month).padStart(2, '0')}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success('Bulletin de paie généré et sauvegardé');
        setCalculation(null);
        setFormData({
          employee_id: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          gross_salary: '',
          bonuses: '',
          overtime: '',
          family_situation: 'single',
          number_of_children: 0
        });
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const activeEmployees = employes.filter(e => e.actif);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleViewPayslip = (payslip: any) => {
    setSelectedPayslip(payslip);
    setIsViewDialogOpen(true);
  };

  const handleEditPayslip = (payslip: any) => {
    setSelectedPayslip(payslip);
    setIsEditDialogOpen(true);
  };

  const handleDeletePayslip = async (payslipId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bulletin de paie ?')) {
      return;
    }

    try {
      const success = await deletePayslip(payslipId);
      if (success) {
        toast.success('Bulletin de paie supprimé avec succès');
        loadPayslips();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownloadPDF = (payslip: any) => {
    const employee = payslip.employee;
    if (!employee) {
      toast.error('Informations employé manquantes');
      return;
    }

    try {
      const pdfBlob = generatePayslipPDFSimple({
        employee: {
          id: employee.id,
          nom: employee.nom,
          prenom: employee.prenom,
          code: employee.code,
          poste: employee.poste,
          departement: employee.departement,
          numero_cnss: employee.numero_cnss || null
        },
        month: payslip.month,
        year: payslip.year,
        grossSalary: payslip.gross_salary,
        bonuses: payslip.bonuses || 0,
        overtime: payslip.overtime || 0,
        familySituation: payslip.family_situation || 'single',
        numberOfChildren: payslip.number_of_children || 0,
        cnss: payslip.cnss,
        irpp: payslip.irpp,
        css: payslip.css,
        netSalary: payslip.net_salary,
        company: company || null
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bulletin-paie-${employee.nom}-${payslip.year}-${String(payslip.month).padStart(2, '0')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paie</h2>
        <p className="text-muted-foreground mt-1">
          Calcul et génération de bulletins de paie
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Remplissez le formulaire ci-dessous pour calculer et générer un bulletin de paie.
          Les calculs sont effectués automatiquement selon les règles tunisiennes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formulaire de Paie
            </CardTitle>
            <CardDescription>
              Saisissez les informations du salarié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Employé *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nom} {emp.prenom} {emp.code ? `(${emp.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mois *</Label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Année *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2000"
                  max="2100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Salaire Brut (TND) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.gross_salary}
                onChange={(e) => setFormData({ ...formData, gross_salary: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Primes (TND)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Heures Supplémentaires (TND)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.overtime}
                onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Situation Familiale</Label>
              <Select
                value={formData.family_situation}
                onValueChange={(value) => setFormData({ ...formData, family_situation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Célibataire</SelectItem>
                  <SelectItem value="married">Marié(e)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre d'Enfants</Label>
              <Input
                type="number"
                min="0"
                value={formData.number_of_children}
                onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={isCalculating || !formData.employee_id || !formData.gross_salary}
              className="w-full"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calcul en cours...' : 'Calculer'}
            </Button>
          </CardContent>
        </Card>

        {/* Résultats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Résultats du Calcul
            </CardTitle>
            <CardDescription>
              Détails du calcul de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculation ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salaire Brut</span>
                    <span className="font-semibold">{calculation.grossSalary.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-muted-foreground">CNSS</span>
                    <span className="font-semibold">-{calculation.cnss.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-muted-foreground">IRPP</span>
                    <span className="font-semibold">-{calculation.monthlyIRPP.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span className="text-muted-foreground">CSS</span>
                    <span className="font-semibold">-{calculation.css.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Salaire Net</span>
                      <span className="text-success">{calculation.netSalary.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePDF}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Calculer & Générer PDF
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cliquez sur "Calculer" pour voir les résultats</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique des bulletins */}
      {payslips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulletins de Paie Générés</CardTitle>
            <CardDescription>
              Historique des bulletins de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Salaire Brut</TableHead>
                  <TableHead>Salaire Net</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.slice(0, 10).map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      {payslip.employee?.nom} {payslip.employee?.prenom}
                    </TableCell>
                    <TableCell>
                      {monthNames[payslip.month - 1]} {payslip.year}
                    </TableCell>
                    <TableCell>{payslip.gross_salary.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</TableCell>
                    <TableCell className="font-semibold">{payslip.net_salary.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPayslip(payslip)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(payslip)}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPayslip(payslip)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePayslip(payslip.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog Voir Bulletin */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bulletin de Paie - {selectedPayslip?.employee?.nom} {selectedPayslip?.employee?.prenom}
            </DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Période</p>
                  <p className="font-semibold">
                    {monthNames[selectedPayslip.month - 1]} {selectedPayslip.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employé</p>
                  <p className="font-semibold">
                    {selectedPayslip.employee?.nom} {selectedPayslip.employee?.prenom}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salaire Brut</span>
                  <span className="font-semibold">
                    {selectedPayslip.gross_salary.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                  </span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">CNSS</span>
                  <span>-{selectedPayslip.cnss.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">IRPP</span>
                  <span>-{selectedPayslip.irpp.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">CSS</span>
                  <span>-{selectedPayslip.css.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Salaire Net</span>
                    <span className="text-success">
                      {selectedPayslip.net_salary.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  handleDownloadPDF(selectedPayslip);
                  setIsViewDialogOpen(false);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier Bulletin */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Bulletin de Paie</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  La modification d'un bulletin de paie nécessite de recalculer tous les montants.
                  Cette fonctionnalité sera disponible prochainement.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
