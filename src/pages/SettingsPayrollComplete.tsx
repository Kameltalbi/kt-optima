import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Percent,
  Calculator,
  Save,
  Plus,
  Trash2,
  Info,
  Clock,
  Gift,
  User,
  FileText,
  Folder,
  Edit
} from 'lucide-react';
import { usePayrollNew } from '@/hooks/use-payroll-new';
import { toast } from 'sonner';

export default function SettingsPayrollComplete() {
  const {
    settings,
    brackets,
    loading,
    updateSettings,
    updateBracket,
    createBracket,
    deleteBracket,
    loadSettings,
    loadBrackets
  } = usePayrollNew();

  const [openModal, setOpenModal] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<any>({});
  const [tempBracket, setTempBracket] = useState({
    min_amount: '',
    max_amount: '',
    rate: '',
    order_index: ''
  });

  const handleOpenModal = (section: string) => {
    if (!settings) return;
    setTempSettings({
      ...settings,
      // Convertir les valeurs pour les inputs
      cnss_ceiling: settings.cnss_ceiling?.toString() || '',
      css_exemption_threshold: settings.css_exemption_threshold?.toString() || '',
      archive_path: settings.archive_path || '',
      default_contract_type: settings.default_contract_type || '',
      default_fiscal_status: settings.default_fiscal_status || '',
    });
    setOpenModal(section);
  };

  const handleSaveSettings = async (section: string) => {
    if (!settings) return;

    const updates: any = {};
    
    // Mapper les valeurs selon la section
    if (section === 'general') {
      updates.pay_frequency = tempSettings.pay_frequency;
      updates.default_payment_method = tempSettings.default_payment_method;
      updates.currency = tempSettings.currency;
    } else if (section === 'cnss') {
      updates.cnss_rate_employee = parseFloat(tempSettings.cnss_rate_employee) || settings.cnss_rate_employee;
      updates.cnss_ceiling = tempSettings.cnss_ceiling ? parseFloat(tempSettings.cnss_ceiling) : null;
      updates.cnss_active = tempSettings.cnss_active;
    } else if (section === 'irpp') {
      updates.irpp_professional_rate = parseFloat(tempSettings.irpp_professional_rate) || settings.irpp_professional_rate;
      updates.irpp_professional_cap = parseFloat(tempSettings.irpp_professional_cap) || settings.irpp_professional_cap;
      updates.family_deduction = parseFloat(tempSettings.family_deduction) || settings.family_deduction;
      updates.child_deduction = parseFloat(tempSettings.child_deduction) || settings.child_deduction;
    } else if (section === 'css') {
      updates.css_rate = parseFloat(tempSettings.css_rate) || settings.css_rate;
      updates.css_exemption_threshold = parseFloat(tempSettings.css_exemption_threshold) || settings.css_exemption_threshold;
    } else if (section === 'overtime') {
      updates.overtime_rate_1 = parseFloat(tempSettings.overtime_rate_1) || settings.overtime_rate_1;
      updates.overtime_rate_2 = parseFloat(tempSettings.overtime_rate_2) || settings.overtime_rate_2;
      updates.overtime_threshold = parseInt(tempSettings.overtime_threshold) || settings.overtime_threshold;
    } else if (section === 'bonus') {
      updates.bonus_taxable = tempSettings.bonus_taxable;
      updates.bonus_subject_cnss = tempSettings.bonus_subject_cnss;
    } else if (section === 'employee') {
      updates.default_contract_type = tempSettings.default_contract_type || null;
      updates.default_fiscal_status = tempSettings.default_fiscal_status || null;
      updates.default_children_count = parseInt(tempSettings.default_children_count) || settings.default_children_count;
      updates.default_head_family = tempSettings.default_head_family;
      updates.default_cnss_active = tempSettings.default_cnss_active;
    } else if (section === 'payslip') {
      updates.payslip_language = tempSettings.payslip_language;
      updates.show_stamp = tempSettings.show_stamp;
      updates.show_signature = tempSettings.show_signature;
      updates.confidential_label = tempSettings.confidential_label;
    } else if (section === 'storage') {
      updates.archive_path = tempSettings.archive_path || null;
      updates.retention_period = parseInt(tempSettings.retention_period) || settings.retention_period;
      updates.secure_access = tempSettings.secure_access;
    }

    await updateSettings(updates);
    setOpenModal(null);
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
    setOpenModal(null);
    setTempBracket({ min_amount: '', max_amount: '', rate: '', order_index: '' });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chargement des paramètres...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Les tables de paie n'existent pas encore dans la base de données.</p>
            <p className="mb-2">Veuillez exécuter le script SQL suivant dans Supabase SQL Editor :</p>
            <code className="block p-2 bg-muted rounded text-sm mb-2">apply_payroll_module.sql</code>
            <p className="text-sm">Ce script créera les tables nécessaires (payroll_settings, irpp_brackets, payslips) et initialisera les paramètres par défaut.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres RH / Paie</h2>
        <p className="text-muted-foreground mt-1">
          Configuration complète des paramètres de paie (Accès administrateur uniquement)
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ces paramètres sont accessibles uniquement aux administrateurs.
          Les utilisateurs ne voient que le formulaire de saisie simple.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres Généraux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fréquence de paie</p>
              <p className="font-semibold capitalize">{settings.pay_frequency}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Méthode de paiement</p>
              <p className="font-semibold capitalize">{settings.default_payment_method?.replace('_', ' ')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Devise</p>
              <p className="font-semibold">{settings.currency}</p>
            </div>
            <Dialog open={openModal === 'general'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('general')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres Généraux</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fréquence de paie</Label>
                    <Select
                      value={tempSettings.pay_frequency}
                      onValueChange={(value) => setTempSettings({ ...tempSettings, pay_frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="biweekly">Bi-mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Méthode de paiement par défaut</Label>
                    <Select
                      value={tempSettings.default_payment_method}
                      onValueChange={(value) => setTempSettings({ ...tempSettings, default_payment_method: value })}
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
                      value={tempSettings.currency}
                      onChange={(e) => setTempSettings({ ...tempSettings, currency: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('general')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Paramètres CNSS (Salarié)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux CNSS Salarié</p>
              <p className="font-semibold">{settings.cnss_rate_employee}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Plafond CNSS</p>
              <p className="font-semibold">{settings.cnss_ceiling ? `${settings.cnss_ceiling.toLocaleString()} TND` : 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">CNSS Active</p>
              <Badge variant={settings.cnss_active ? 'default' : 'secondary'}>
                {settings.cnss_active ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <Dialog open={openModal === 'cnss'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('cnss')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres CNSS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux CNSS Salarié (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.cnss_rate_employee}
                      onChange={(e) => setTempSettings({ ...tempSettings, cnss_rate_employee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plafond CNSS (TND)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.cnss_ceiling}
                      onChange={(e) => setTempSettings({ ...tempSettings, cnss_ceiling: e.target.value })}
                      placeholder="Laisser vide si pas de plafond"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CNSS Active</Label>
                    <Switch
                      checked={tempSettings.cnss_active}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, cnss_active: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('cnss')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux déduction frais professionnels</p>
              <p className="font-semibold">{settings.irpp_professional_rate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Plafond frais professionnels</p>
              <p className="font-semibold">{settings.irpp_professional_cap.toLocaleString()} TND/an</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Déduction familiale</p>
              <p className="font-semibold">{settings.family_deduction.toLocaleString()} TND/an</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Déduction par enfant</p>
              <p className="font-semibold">{settings.child_deduction.toLocaleString()} TND/an</p>
            </div>
            <Dialog open={openModal === 'irpp'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('irpp')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres IRPP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux déduction frais professionnels (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.irpp_professional_rate}
                      onChange={(e) => setTempSettings({ ...tempSettings, irpp_professional_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plafond frais professionnels (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.irpp_professional_cap}
                      onChange={(e) => setTempSettings({ ...tempSettings, irpp_professional_cap: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Déduction familiale (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.family_deduction}
                      onChange={(e) => setTempSettings({ ...tempSettings, family_deduction: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Déduction par enfant (TND/an)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.child_deduction}
                      onChange={(e) => setTempSettings({ ...tempSettings, child_deduction: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('irpp')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* 4. IRPP Brackets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Barème IRPP (Annuel)
            </CardTitle>
            <CardDescription>Administrateurs uniquement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brackets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune tranche configurée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Min (TND)</TableHead>
                    <TableHead>Max (TND)</TableHead>
                    <TableHead>Taux (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brackets.map((bracket) => (
                    <TableRow key={bracket.id}>
                      <TableCell>{bracket.min_amount.toLocaleString()}</TableCell>
                      <TableCell>{bracket.max_amount ? bracket.max_amount.toLocaleString() : 'Illimité'}</TableCell>
                      <TableCell><Badge>{bracket.rate}%</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Dialog open={openModal === 'brackets'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setOpenModal('brackets')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gérer les tranches
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestion des Tranches IRPP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Montant Minimum (TND)</Label>
                    <Input
                      type="number"
                      value={tempBracket.min_amount}
                      onChange={(e) => setTempBracket({ ...tempBracket, min_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Montant Maximum (TND) - Laisser vide pour illimité</Label>
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
                  <div className="space-y-2">
                    <Label>Ordre</Label>
                    <Input
                      type="number"
                      value={tempBracket.order_index}
                      onChange={(e) => setTempBracket({ ...tempBracket, order_index: e.target.value })}
                      placeholder="Auto"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={handleCreateBracket}>
                      <Save className="h-4 w-4 mr-2" />
                      Créer
                    </Button>
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
              <Percent className="h-5 w-5" />
              Paramètres CSS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux CSS</p>
              <p className="font-semibold">{settings.css_rate}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Seuil d'exemption</p>
              <p className="font-semibold">IRPP ≤ {settings.css_exemption_threshold.toLocaleString()} TND</p>
            </div>
            <Dialog open={openModal === 'css'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('css')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
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
                      value={tempSettings.css_rate}
                      onChange={(e) => setTempSettings({ ...tempSettings, css_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'exemption (IRPP ≤ TND)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.css_exemption_threshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, css_exemption_threshold: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('css')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Paramètres Heures Supplémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux niveau 1</p>
              <p className="font-semibold">{settings.overtime_rate_1}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taux niveau 2</p>
              <p className="font-semibold">{settings.overtime_rate_2}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Seuil hebdomadaire</p>
              <p className="font-semibold">{settings.overtime_threshold}h</p>
            </div>
            <Dialog open={openModal === 'overtime'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('overtime')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres Heures Supplémentaires</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taux niveau 1 (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.overtime_rate_1}
                      onChange={(e) => setTempSettings({ ...tempSettings, overtime_rate_1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux niveau 2 (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tempSettings.overtime_rate_2}
                      onChange={(e) => setTempSettings({ ...tempSettings, overtime_rate_2: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil hebdomadaire (heures)</Label>
                    <Input
                      type="number"
                      value={tempSettings.overtime_threshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, overtime_threshold: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('overtime')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Paramètres Primes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Primes imposables</p>
              <Badge variant={settings.bonus_taxable ? 'default' : 'secondary'}>
                {settings.bonus_taxable ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Primes soumises à CNSS</p>
              <Badge variant={settings.bonus_subject_cnss ? 'default' : 'secondary'}>
                {settings.bonus_subject_cnss ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <Dialog open={openModal === 'bonus'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('bonus')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres Primes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Primes imposables</Label>
                    <Switch
                      checked={tempSettings.bonus_taxable}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, bonus_taxable: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Primes soumises à CNSS</Label>
                    <Switch
                      checked={tempSettings.bonus_subject_cnss}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, bonus_subject_cnss: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('bonus')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Paramètres Employé par Défaut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Type de contrat</p>
              <p className="font-semibold">{settings.default_contract_type || 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Statut fiscal</p>
              <p className="font-semibold">{settings.default_fiscal_status || 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nombre d'enfants par défaut</p>
              <p className="font-semibold">{settings.default_children_count}</p>
            </div>
            <Dialog open={openModal === 'employee'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('employee')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres Employé par Défaut</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de contrat par défaut</Label>
                    <Input
                      value={tempSettings.default_contract_type}
                      onChange={(e) => setTempSettings({ ...tempSettings, default_contract_type: e.target.value })}
                      placeholder="CDI, CDD, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut fiscal par défaut</Label>
                    <Input
                      value={tempSettings.default_fiscal_status}
                      onChange={(e) => setTempSettings({ ...tempSettings, default_fiscal_status: e.target.value })}
                      placeholder="Célibataire, Marié, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'enfants par défaut</Label>
                    <Input
                      type="number"
                      value={tempSettings.default_children_count}
                      onChange={(e) => setTempSettings({ ...tempSettings, default_children_count: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Chef de famille par défaut</Label>
                    <Switch
                      checked={tempSettings.default_head_family}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, default_head_family: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>CNSS active par défaut</Label>
                    <Switch
                      checked={tempSettings.default_cnss_active}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, default_cnss_active: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('employee')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Format du Bulletin de Paie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Langue</p>
              <p className="font-semibold uppercase">{settings.payslip_language}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Afficher le tampon</p>
              <Badge variant={settings.show_stamp ? 'default' : 'secondary'}>
                {settings.show_stamp ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Afficher le champ signature</p>
              <Badge variant={settings.show_signature ? 'default' : 'secondary'}>
                {settings.show_signature ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <Dialog open={openModal === 'payslip'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('payslip')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Format du Bulletin de Paie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select
                      value={tempSettings.payslip_language}
                      onValueChange={(value) => setTempSettings({ ...tempSettings, payslip_language: value })}
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
                    <Label>Afficher le tampon</Label>
                    <Switch
                      checked={tempSettings.show_stamp}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, show_stamp: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Afficher le champ signature</Label>
                    <Switch
                      checked={tempSettings.show_signature}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, show_signature: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Label document confidentiel</Label>
                    <Switch
                      checked={tempSettings.confidential_label}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, confidential_label: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('payslip')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
              Paramètres de Stockage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dossier d'archive</p>
              <p className="font-semibold">{settings.archive_path || 'Non défini'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Période de rétention</p>
              <p className="font-semibold">{settings.retention_period} ans</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Accès sécurisé</p>
              <Badge variant={settings.secure_access ? 'default' : 'secondary'}>
                {settings.secure_access ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <Dialog open={openModal === 'storage'} onOpenChange={(open) => !open && setOpenModal(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => handleOpenModal('storage')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres de Stockage</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dossier d'archive</Label>
                    <Input
                      value={tempSettings.archive_path}
                      onChange={(e) => setTempSettings({ ...tempSettings, archive_path: e.target.value })}
                      placeholder="/archives/payslips"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Période de rétention (années)</Label>
                    <Input
                      type="number"
                      value={tempSettings.retention_period}
                      onChange={(e) => setTempSettings({ ...tempSettings, retention_period: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Accès sécurisé</Label>
                    <Switch
                      checked={tempSettings.secure_access}
                      onCheckedChange={(checked) => setTempSettings({ ...tempSettings, secure_access: checked })}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpenModal(null)}>Annuler</Button>
                    <Button onClick={() => handleSaveSettings('storage')}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
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
