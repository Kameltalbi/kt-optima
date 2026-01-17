import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import { usePayrollAdvances } from '@/hooks/use-payroll-advances';
import { usePayrollDeductions } from '@/hooks/use-payroll-deductions';
import { useEmployes } from '@/hooks/use-employes';
import { useCurrency } from '@/hooks/use-currency';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function PayrollAdvancesDeductions() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const { employes } = useEmployes();
  const { advances, loading: advancesLoading, createAdvance, updateAdvance, deleteAdvance } = usePayrollAdvances();
  const { deductions, loading: deductionsLoading, createDeduction, updateDeduction, deleteDeduction } = usePayrollDeductions();

  const [activeTab, setActiveTab] = useState<'advances' | 'deductions'>('advances');
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<any>(null);
  const [selectedDeduction, setSelectedDeduction] = useState<any>(null);

  const [advanceForm, setAdvanceForm] = useState({
    employe_id: '',
    date_advance: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    notes: '',
  });

  const [deductionForm, setDeductionForm] = useState({
    employe_id: '',
    date_deduction: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'other' as 'disciplinary' | 'loan' | 'other',
    description: '',
    notes: '',
  });

  const handleCreateAdvance = () => {
    setSelectedAdvance(null);
    setAdvanceForm({
      employe_id: '',
      date_advance: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      notes: '',
    });
    setIsAdvanceModalOpen(true);
  };

  const handleEditAdvance = (advance: any) => {
    setSelectedAdvance(advance);
    setAdvanceForm({
      employe_id: advance.employe_id,
      date_advance: advance.date_advance,
      amount: advance.amount.toString(),
      description: advance.description || '',
      notes: advance.notes || '',
    });
    setIsAdvanceModalOpen(true);
  };

  const handleSaveAdvance = async () => {
    if (!advanceForm.employe_id || !advanceForm.amount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const data = {
      employe_id: advanceForm.employe_id,
      date_advance: advanceForm.date_advance,
      amount: parseFloat(advanceForm.amount),
      description: advanceForm.description || null,
      notes: advanceForm.notes || null,
      status: 'pending' as const,
    };

    if (selectedAdvance) {
      await updateAdvance(selectedAdvance.id, data);
    } else {
      await createAdvance(data);
    }
    setIsAdvanceModalOpen(false);
    setSelectedAdvance(null);
  };

  const handleCreateDeduction = () => {
    setSelectedDeduction(null);
    setDeductionForm({
      employe_id: '',
      date_deduction: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'other',
      description: '',
      notes: '',
    });
    setIsDeductionModalOpen(true);
  };

  const handleEditDeduction = (deduction: any) => {
    setSelectedDeduction(deduction);
    setDeductionForm({
      employe_id: deduction.employe_id,
      date_deduction: deduction.date_deduction,
      amount: deduction.amount.toString(),
      type: deduction.type,
      description: deduction.description,
      notes: deduction.notes || '',
    });
    setIsDeductionModalOpen(true);
  };

  const handleSaveDeduction = async () => {
    if (!deductionForm.employe_id || !deductionForm.amount || !deductionForm.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const data = {
      employe_id: deductionForm.employe_id,
      date_deduction: deductionForm.date_deduction,
      amount: parseFloat(deductionForm.amount),
      type: deductionForm.type,
      description: deductionForm.description,
      notes: deductionForm.notes || null,
      status: 'pending' as const,
    };

    if (selectedDeduction) {
      await updateDeduction(selectedDeduction.id, data);
    } else {
      await createDeduction(data);
    }
    setIsDeductionModalOpen(false);
    setSelectedDeduction(null);
  };

  const getEmployeeName = (id: string) => {
    const emp = employes.find(e => e.id === id);
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A';
  };

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600' },
    reimbursed: { label: 'Remboursée', color: 'bg-green-500/10 text-green-600' },
    applied: { label: 'Appliquée', color: 'bg-green-500/10 text-green-600' },
    cancelled: { label: 'Annulée', color: 'bg-red-500/10 text-red-600' },
  };

  const typeConfig = {
    disciplinary: { label: 'Disciplinaire', color: 'bg-red-500/10 text-red-600' },
    loan: { label: 'Prêt interne', color: 'bg-blue-500/10 text-blue-600' },
    other: { label: 'Autre', color: 'bg-gray-500/10 text-gray-600' },
  };

  return (
    <MainLayout title="Avances & Retenues" subtitle="Gestion des avances sur salaire et retenues">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'advances' | 'deductions')}>
          <TabsList>
            <TabsTrigger value="advances">Avances</TabsTrigger>
            <TabsTrigger value="deductions">Retenues</TabsTrigger>
          </TabsList>

          <TabsContent value="advances">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Avances sur salaire</CardTitle>
                  <Button onClick={handleCreateAdvance}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle avance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {advancesLoading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : advances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune avance enregistrée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advances.map((advance) => (
                        <TableRow key={advance.id}>
                          <TableCell>{getEmployeeName(advance.employe_id)}</TableCell>
                          <TableCell>{new Date(advance.date_advance).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(advance.amount)}</TableCell>
                          <TableCell>{advance.description || '-'}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig[advance.status].color + ' border-0'}>
                              {statusConfig[advance.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAdvance(advance)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteAdvance(advance.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deductions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Retenues sur salaire</CardTitle>
                  <Button onClick={handleCreateDeduction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle retenue
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {deductionsLoading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : deductions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune retenue enregistrée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deductions.map((deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell>{getEmployeeName(deduction.employe_id)}</TableCell>
                          <TableCell>{new Date(deduction.date_deduction).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Badge className={typeConfig[deduction.type].color + ' border-0'}>
                              {typeConfig[deduction.type].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(deduction.amount)}</TableCell>
                          <TableCell>{deduction.description}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig[deduction.status].color + ' border-0'}>
                              {statusConfig[deduction.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditDeduction(deduction)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteDeduction(deduction.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advance Modal */}
        <Dialog open={isAdvanceModalOpen} onOpenChange={setIsAdvanceModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAdvance ? 'Modifier l\'avance' : 'Nouvelle avance'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employé *</Label>
                <Select value={advanceForm.employe_id} onValueChange={(v) => setAdvanceForm({ ...advanceForm, employe_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employes.filter(e => e.actif).map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={advanceForm.date_advance}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, date_advance: e.target.value })}
                />
              </div>
              <div>
                <Label>Montant (TND) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={advanceForm.description}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={advanceForm.notes}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdvanceModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveAdvance}>
                  {selectedAdvance ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deduction Modal */}
        <Dialog open={isDeductionModalOpen} onOpenChange={setIsDeductionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDeduction ? 'Modifier la retenue' : 'Nouvelle retenue'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employé *</Label>
                <Select value={deductionForm.employe_id} onValueChange={(v) => setDeductionForm({ ...deductionForm, employe_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employes.filter(e => e.actif).map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={deductionForm.date_deduction}
                  onChange={(e) => setDeductionForm({ ...deductionForm, date_deduction: e.target.value })}
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={deductionForm.type} onValueChange={(v: any) => setDeductionForm({ ...deductionForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disciplinary">Disciplinaire</SelectItem>
                    <SelectItem value="loan">Prêt interne</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Montant (TND) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={deductionForm.amount}
                  onChange={(e) => setDeductionForm({ ...deductionForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={deductionForm.description}
                  onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={deductionForm.notes}
                  onChange={(e) => setDeductionForm({ ...deductionForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeductionModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveDeduction}>
                  {selectedDeduction ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
