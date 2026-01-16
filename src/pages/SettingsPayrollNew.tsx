import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Percent, Calculator, Save, Plus, Trash2, Info, DollarSign, Clock, Gift, User, FileText, Folder } from 'lucide-react';
import { usePayrollNew } from '@/hooks/use-payroll-new';
import { toast } from 'sonner';

export default function SettingsPayrollNew() {
  const {
    settings,
    brackets,
    updateSettings,
    updateBracket,
    createBracket,
    deleteBracket,
    loadSettings,
    loadBrackets
  } = usePayrollNew();

  const [loading, setLoading] = useState(true);

  // Modals states
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
  const [isCNSSModalOpen, setIsCNSSModalOpen] = useState(false);
  const [isIRPPModalOpen, setIsIRPPModalOpen] = useState(false);
  const [isCSSModalOpen, setIsCSSModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isBracketModalOpen, setIsBracketModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [tempBracket, setTempBracket] = useState({
    min_amount: '',
    max_amount: '',
    rate: '',
    order_index: ''
  });
  const [editingBracket, setEditingBracket] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        // General
        pay_frequency: settings.pay_frequency || 'monthly',
        default_payment_method: settings.default_payment_method || 'bank_transfer',
        currency: settings.currency || 'TND',
        // CNSS
        cnss_rate_employee: settings.cnss_rate_employee?.toString() || '9.18',
        cnss_ceiling: settings.cnss_ceiling?.toString() || '',
        cnss_active: settings.cnss_active ?? true,
        // IRPP
        irpp_professional_rate: settings.irpp_professional_rate?.toString() || '10.00',
        irpp_professional_cap: settings.irpp_professional_cap?.toString() || '2000.00',
        family_deduction: settings.family_deduction?.toString() || '300.00',
        child_deduction: settings.child_deduction?.toString() || '200.00',
        // CSS
        css_rate: settings.css_rate?.toString() || '1.00',
        css_exemption_threshold: settings.css_exemption_threshold?.toString() || '5000.00',
        // Overtime
        overtime_rate_1: settings.overtime_rate_1?.toString() || '125.00',
        overtime_rate_2: settings.overtime_rate_2?.toString() || '150.00',
        overtime_threshold: settings.overtime_threshold?.toString() || '48',
        // Bonus
        bonus_taxable: settings.bonus_taxable ?? true,
        bonus_subject_cnss: settings.bonus_subject_cnss ?? true,
        // Employee defaults
        default_contract_type: settings.default_contract_type || '',
        default_fiscal_status: settings.default_fiscal_status || '',
        default_children_count: settings.default_children_count?.toString() || '0',
        default_head_family: settings.default_head_family ?? false,
        default_cnss_active: settings.default_cnss_active ?? true,
        // Payslip
        payslip_language: settings.payslip_language || 'fr',
        show_stamp: settings.show_stamp ?? true,
        show_signature: settings.show_signature ?? true,
        confidential_label: settings.confidential_label ?? true,
        // Storage
        archive_path: settings.archive_path || '',
        retention_period: settings.retention_period?.toString() || '5',
        secure_access: settings.secure_access ?? true,
      });
      setLoading(false);
    }
  }, [settings]);

  const handleSaveSection = async (section: string, updates: any) => {
    if (!settings) return;
    const success = await updateSettings(updates);
    if (success) {
      toast.success('Paramètres mis à jour avec succès');
      // Close the appropriate modal
      if (section === 'general') setIsGeneralModalOpen(false);
      if (section === 'cnss') setIsCNSSModalOpen(false);
      if (section === 'irpp') setIsIRPPModalOpen(false);
      if (section === 'css') setIsCSSModalOpen(false);
      if (section === 'overtime') setIsOvertimeModalOpen(false);
      if (section === 'bonus') setIsBonusModalOpen(false);
      if (section === 'employee') setIsEmployeeModalOpen(false);
      if (section === 'payslip') setIsPayslipModalOpen(false);
      if (section === 'storage') setIsStorageModalOpen(false);
    }
  };

  const handleCreateBracket = async () => {
    const min = parseFloat(tempBracket.min_amount);
    const max = tempBracket.max_amount ? parseFloat(tempBracket.max_amount) : null;
    const rate = parseFloat(tempBracket.rate);
    const order = parseInt(tempBracket.order_index) || brackets.length + 1;

    if (isNaN(min) || isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Valeurs invalides');
      return;
    }

    await createBracket({
      min_amount: min,
      max_amount: max,
      rate,
      order_index: order
    });
    setIsBracketModalOpen(false);
    setTempBracket({ min_amount: '', max_amount: '', rate: '', order_index: '' });
  };

  const handleSaveBracket = async (id: string) => {
    const min = parseFloat(tempBracket.min_amount);
    const max = tempBracket.max_amount ? parseFloat(tempBracket.max_amount) : null;
    const rate = parseFloat(tempBracket.rate);
    const order = parseInt(tempBracket.order_index);

    if (isNaN(min) || isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Valeurs invalides');
      return;
    }

    await updateBracket(id, {
      min_amount: min,
      max_amount: max,
      rate,
      order_index: order
    });
    setEditingBracket(null);
    setTempBracket({ min_amount: '', max_amount: '', rate: '', order_index: '' });
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Paramètres RH / Paie</h2>
          <p className="text-muted-foreground mt-1">
            Configuration des paramètres de calcul de paie
          </p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Les tables de paie n'existent pas encore dans la base de données.</p>
            <p className="mb-2">Veuillez exécuter le script SQL suivant dans Supabase SQL Editor :</p>
            <code className="block p-2 bg-muted rounded text-sm mb-2">apply_payroll_module.sql</code>
            <p className="text-sm">Ce script créera les tables nécessaires (payroll_settings, irpp_brackets, payslips) et initialisera les paramètres par défaut.</p>
          </AlertDescription>
        </Alert>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres RH / Paie</h2>
        <p className="text-muted-foreground mt-1">
          Configuration des paramètres de calcul de paie (Accès administrateur uniquement)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. General Payroll Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres généraux
            </CardTitle>
            <CardDescription>Fréquence, méthode de paiement, devise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fréquence de paie</p>
              <p className="font-semibold capitalize">{formData.pay_frequency || 'Mensuelle'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Méthode de paiement</p>
              <p className="font-semibold">
                {formData.default_payment_method === 'bank_transfer' ? 'Virement bancaire' :
                 formData.default_payment_method === 'cash' ? 'Espèces' :
                 formData.default_payment_method === 'cheque' ? 'Chèque' : 'Virement bancaire'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Devise</p>
              <p className="font-semibold">{formData.currency || 'TND'}</p>
            </div>
            <Dialog open={isGeneralModalOpen} onOpenChange={setIsGeneralModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres généraux</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fréquence de paie</Label>
                    <Select
                      value={formData.pay_frequency}
                      onValueChange={(v) => setFormData({ ...formData, pay_frequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="biweekly">Bimensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Méthode de paiement par défaut</Label>
                    <Select
                      value={formData.default_payment_method}
                      onValueChange={(v) => setFormData({ ...formData, default_payment_method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="cheque">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Input
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsGeneralModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('general', {
                      pay_frequency: formData.pay_frequency,
                      default_payment_method: formData.default_payment_method,
                      currency: formData.currency
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 2. CNSS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Paramètres CNSS
            </CardTitle>
            <CardDescription>Taux et plafond CNSS salarié</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux CNSS salarié</p>
              <p className="font-semibold">{formData.cnss_rate_employee}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Plafond CNSS</p>
              <p className="font-semibold">
                {formData.cnss_ceiling ? `${parseFloat(formData.cnss_ceiling).toLocaleString()} TND` : 'Non défini'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CNSS active</span>
              <Badge variant={formData.cnss_active ? "default" : "secondary"}>
                {formData.cnss_active ? "Oui" : "Non"}
              </Badge>
            </div>
            <Dialog open={isCNSSModalOpen} onOpenChange={setIsCNSSModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres CNSS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux CNSS salarié (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cnss_rate_employee}
                      onChange={(e) => setFormData({ ...formData, cnss_rate_employee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plafond CNSS (TND)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cnss_ceiling}
                      onChange={(e) => setFormData({ ...formData, cnss_ceiling: e.target.value })}
                      placeholder="Laisser vide si aucun plafond"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CNSS active</Label>
                    <Switch
                      checked={formData.cnss_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, cnss_active: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCNSSModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('cnss', {
                      cnss_rate_employee: parseFloat(formData.cnss_rate_employee),
                      cnss_ceiling: formData.cnss_ceiling ? parseFloat(formData.cnss_ceiling) : null,
                      cnss_active: formData.cnss_active
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 3. IRPP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Paramètres IRPP
            </CardTitle>
            <CardDescription>Déductions et frais professionnels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux frais professionnels</p>
              <p className="font-semibold">{formData.irpp_professional_rate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Plafond frais professionnels</p>
              <p className="font-semibold">{parseFloat(formData.irpp_professional_cap).toLocaleString()} TND/an</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Déduction familiale</p>
              <p className="font-semibold">{parseFloat(formData.family_deduction).toLocaleString()} TND/an</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Déduction par enfant</p>
              <p className="font-semibold">{parseFloat(formData.child_deduction).toLocaleString()} TND/an/enfant</p>
            </div>
            <Dialog open={isIRPPModalOpen} onOpenChange={setIsIRPPModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres IRPP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux frais professionnels (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.irpp_professional_rate}
                      onChange={(e) => setFormData({ ...formData, irpp_professional_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plafond frais professionnels (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.irpp_professional_cap}
                      onChange={(e) => setFormData({ ...formData, irpp_professional_cap: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Déduction familiale (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.family_deduction}
                      onChange={(e) => setFormData({ ...formData, family_deduction: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Déduction par enfant (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.child_deduction}
                      onChange={(e) => setFormData({ ...formData, child_deduction: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsIRPPModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('irpp', {
                      irpp_professional_rate: parseFloat(formData.irpp_professional_rate),
                      irpp_professional_cap: parseFloat(formData.irpp_professional_cap),
                      family_deduction: parseFloat(formData.family_deduction),
                      child_deduction: parseFloat(formData.child_deduction)
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 4. IRPP Tax Brackets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Barème IRPP
            </CardTitle>
            <CardDescription>Tranches d'imposition (Admin uniquement)</CardDescription>
          </CardHeader>
          <CardContent>
            {brackets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">Aucune tranche configurée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Min (TND)</TableHead>
                    <TableHead>Max (TND)</TableHead>
                    <TableHead>Taux (%)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brackets.map((bracket) => (
                    <TableRow key={bracket.id}>
                      {editingBracket === bracket.id ? (
                        <>
                          <TableCell>
                            <Input
                              type="number"
                              value={tempBracket.min_amount}
                              onChange={(e) => setTempBracket({ ...tempBracket, min_amount: e.target.value })}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={tempBracket.max_amount}
                              onChange={(e) => setTempBracket({ ...tempBracket, max_amount: e.target.value })}
                              className="w-24"
                              placeholder="Illimité"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={tempBracket.rate}
                              onChange={(e) => setTempBracket({ ...tempBracket, rate: e.target.value })}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleSaveBracket(bracket.id)}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingBracket(null)}>
                                Annuler
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{bracket.min_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {bracket.max_amount ? bracket.max_amount.toLocaleString() : (
                              <Badge variant="secondary">Illimité</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge>{bracket.rate}%</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingBracket(bracket.id);
                                  setTempBracket({
                                    min_amount: bracket.min_amount.toString(),
                                    max_amount: bracket.max_amount?.toString() || '',
                                    rate: bracket.rate.toString(),
                                    order_index: bracket.order_index.toString()
                                  });
                                }}
                              >
                                Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Supprimer cette tranche ?')) {
                                    deleteBracket(bracket.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Dialog open={isBracketModalOpen} onOpenChange={setIsBracketModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une tranche
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle tranche IRPP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montant minimum (TND)</Label>
                    <Input
                      type="number"
                      value={tempBracket.min_amount}
                      onChange={(e) => setTempBracket({ ...tempBracket, min_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Montant maximum (TND) - Laisser vide pour illimité</Label>
                    <Input
                      type="number"
                      value={tempBracket.max_amount}
                      onChange={(e) => setTempBracket({ ...tempBracket, max_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempBracket.rate}
                      onChange={(e) => setTempBracket({ ...tempBracket, rate: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsBracketModalOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreateBracket}>Créer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 5. CSS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Paramètres CSS
            </CardTitle>
            <CardDescription>Taux et seuil d'exemption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux CSS</p>
              <p className="font-semibold">{formData.css_rate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Seuil d'exemption</p>
              <p className="font-semibold">IRPP ≤ {parseFloat(formData.css_exemption_threshold).toLocaleString()} TND</p>
            </div>
            <Dialog open={isCSSModalOpen} onOpenChange={setIsCSSModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres CSS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux CSS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.css_rate}
                      onChange={(e) => setFormData({ ...formData, css_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'exemption (IRPP ≤ TND)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.css_exemption_threshold}
                      onChange={(e) => setFormData({ ...formData, css_exemption_threshold: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCSSModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('css', {
                      css_rate: parseFloat(formData.css_rate),
                      css_exemption_threshold: parseFloat(formData.css_exemption_threshold)
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 6. Overtime Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Paramètres heures supplémentaires
            </CardTitle>
            <CardDescription>Taux et seuils</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux niveau 1</p>
              <p className="font-semibold">{formData.overtime_rate_1}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux niveau 2</p>
              <p className="font-semibold">{formData.overtime_rate_2}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Seuil hebdomadaire</p>
              <p className="font-semibold">{formData.overtime_threshold}h</p>
            </div>
            <Dialog open={isOvertimeModalOpen} onOpenChange={setIsOvertimeModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres heures supplémentaires</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux niveau 1 (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.overtime_rate_1}
                      onChange={(e) => setFormData({ ...formData, overtime_rate_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux niveau 2 (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.overtime_rate_2}
                      onChange={(e) => setFormData({ ...formData, overtime_rate_2: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil hebdomadaire (heures)</Label>
                    <Input
                      type="number"
                      value={formData.overtime_threshold}
                      onChange={(e) => setFormData({ ...formData, overtime_threshold: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOvertimeModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('overtime', {
                      overtime_rate_1: parseFloat(formData.overtime_rate_1),
                      overtime_rate_2: parseFloat(formData.overtime_rate_2),
                      overtime_threshold: parseInt(formData.overtime_threshold)
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 7. Bonus Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Paramètres primes
            </CardTitle>
            <CardDescription>Règles d'imposition et CNSS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Primes imposables</span>
              <Badge variant={formData.bonus_taxable ? "default" : "secondary"}>
                {formData.bonus_taxable ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Primes soumises à CNSS</span>
              <Badge variant={formData.bonus_subject_cnss ? "default" : "secondary"}>
                {formData.bonus_subject_cnss ? "Oui" : "Non"}
              </Badge>
            </div>
            <Dialog open={isBonusModalOpen} onOpenChange={setIsBonusModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres primes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Primes imposables</Label>
                    <Switch
                      checked={formData.bonus_taxable}
                      onCheckedChange={(checked) => setFormData({ ...formData, bonus_taxable: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Primes soumises à CNSS</Label>
                    <Switch
                      checked={formData.bonus_subject_cnss}
                      onCheckedChange={(checked) => setFormData({ ...formData, bonus_subject_cnss: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsBonusModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('bonus', {
                      bonus_taxable: formData.bonus_taxable,
                      bonus_subject_cnss: formData.bonus_subject_cnss
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 8. Employee Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Paramètres par défaut employé
            </CardTitle>
            <CardDescription>Valeurs par défaut pour nouveaux employés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Type de contrat</p>
              <p className="font-semibold">{formData.default_contract_type || 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Statut fiscal</p>
              <p className="font-semibold">{formData.default_fiscal_status || 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nombre d'enfants</p>
              <p className="font-semibold">{formData.default_children_count}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chef de famille</span>
              <Badge variant={formData.default_head_family ? "default" : "secondary"}>
                {formData.default_head_family ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CNSS active</span>
              <Badge variant={formData.default_cnss_active ? "default" : "secondary"}>
                {formData.default_cnss_active ? "Oui" : "Non"}
              </Badge>
            </div>
            <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres par défaut employé</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de contrat</Label>
                    <Input
                      value={formData.default_contract_type}
                      onChange={(e) => setFormData({ ...formData, default_contract_type: e.target.value })}
                      placeholder="CDI, CDD, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut fiscal</Label>
                    <Input
                      value={formData.default_fiscal_status}
                      onChange={(e) => setFormData({ ...formData, default_fiscal_status: e.target.value })}
                      placeholder="Célibataire, Marié, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'enfants par défaut</Label>
                    <Input
                      type="number"
                      value={formData.default_children_count}
                      onChange={(e) => setFormData({ ...formData, default_children_count: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Chef de famille</Label>
                    <Switch
                      checked={formData.default_head_family}
                      onCheckedChange={(checked) => setFormData({ ...formData, default_head_family: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CNSS active</Label>
                    <Switch
                      checked={formData.default_cnss_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, default_cnss_active: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsEmployeeModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('employee', {
                      default_contract_type: formData.default_contract_type || null,
                      default_fiscal_status: formData.default_fiscal_status || null,
                      default_children_count: parseInt(formData.default_children_count) || 0,
                      default_head_family: formData.default_head_family,
                      default_cnss_active: formData.default_cnss_active
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 9. Payslip Format Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Format bulletin de paie
            </CardTitle>
            <CardDescription>Paramètres d'affichage et langue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Langue</p>
              <p className="font-semibold capitalize">{formData.payslip_language === 'fr' ? 'Français' : 'Arabe'}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Afficher tampon</span>
              <Badge variant={formData.show_stamp ? "default" : "secondary"}>
                {formData.show_stamp ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Afficher signature</span>
              <Badge variant={formData.show_signature ? "default" : "secondary"}>
                {formData.show_signature ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Label confidentiel</span>
              <Badge variant={formData.confidential_label ? "default" : "secondary"}>
                {formData.confidential_label ? "Oui" : "Non"}
              </Badge>
            </div>
            <Dialog open={isPayslipModalOpen} onOpenChange={setIsPayslipModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Format bulletin de paie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select
                      value={formData.payslip_language}
                      onValueChange={(v) => setFormData({ ...formData, payslip_language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">Arabe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Afficher tampon</Label>
                    <Switch
                      checked={formData.show_stamp}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_stamp: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Afficher signature</Label>
                    <Switch
                      checked={formData.show_signature}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_signature: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Label confidentiel</Label>
                    <Switch
                      checked={formData.confidential_label}
                      onCheckedChange={(checked) => setFormData({ ...formData, confidential_label: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsPayslipModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('payslip', {
                      payslip_language: formData.payslip_language,
                      show_stamp: formData.show_stamp,
                      show_signature: formData.show_signature,
                      confidential_label: formData.confidential_label
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 10. Storage Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Paramètres de stockage
            </CardTitle>
            <CardDescription>Archivage et rétention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dossier d'archive</p>
              <p className="font-semibold text-sm break-all">
                {formData.archive_path || 'Non défini'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Période de rétention</p>
              <p className="font-semibold">{formData.retention_period} ans</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accès sécurisé</span>
              <Badge variant={formData.secure_access ? "default" : "secondary"}>
                {formData.secure_access ? "Oui" : "Non"}
              </Badge>
            </div>
            <Dialog open={isStorageModalOpen} onOpenChange={setIsStorageModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Configurer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres de stockage</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dossier d'archive</Label>
                    <Input
                      value={formData.archive_path}
                      onChange={(e) => setFormData({ ...formData, archive_path: e.target.value })}
                      placeholder="/archives/payslips"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Période de rétention (années)</Label>
                    <Input
                      type="number"
                      value={formData.retention_period}
                      onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Accès sécurisé</Label>
                    <Switch
                      checked={formData.secure_access}
                      onCheckedChange={(checked) => setFormData({ ...formData, secure_access: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsStorageModalOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleSaveSection('storage', {
                      archive_path: formData.archive_path || null,
                      retention_period: parseInt(formData.retention_period) || 5,
                      secure_access: formData.secure_access
                    })}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
