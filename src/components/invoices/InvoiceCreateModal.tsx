import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { useTaxes, Tax } from "@/hooks/use-taxes";
import { useCurrency } from "@/hooks/use-currency";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId: string | null; // Taxe appliquée à cette ligne (pourcentage uniquement)
}

export interface InvoiceFormData {
  clientId: string;
  date: string;
  reference: string;
  currency: string;
  appliedTaxes: string[]; // IDs des taxes cochées
  applyDiscount: boolean;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  lines: InvoiceLine[];
  notes: string;
}

interface InvoiceCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InvoiceFormData) => void;
  editData?: {
    id: string;
    clientId: string;
    date: string;
    reference: string;
    notes: string;
    lines: InvoiceLine[];
  } | null;
}

export function InvoiceCreateModal({
  open,
  onOpenChange,
  onSave,
  editData,
}: InvoiceCreateModalProps) {
  const { clients, loading: clientsLoading } = useClients();
  const { taxes, enabledTaxes, calculateTax } = useTaxes();
  const { defaultCurrency, formatAmount } = useCurrency();

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    currency: String(defaultCurrency),
    appliedTaxes: [], // Toutes les taxes cochées
    applyDiscount: false,
    discountType: 'percentage',
    discountValue: 0,
    lines: [],
    notes: "",
  });

  // Initialiser avec les taxes activées par défaut
  useEffect(() => {
    if (enabledTaxes.length > 0 && formData.appliedTaxes.length === 0 && !editData) {
      setFormData(prev => ({
        ...prev,
        appliedTaxes: enabledTaxes.map(t => t.id),
      }));
    }
  }, [enabledTaxes, editData]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (editData && open) {
      setFormData({
        clientId: editData.clientId,
        date: editData.date,
        reference: editData.reference,
        currency: String(defaultCurrency),
        appliedTaxes: enabledTaxes.map(t => t.id),
        applyDiscount: false,
        discountType: 'percentage',
        discountValue: 0,
        lines: editData.lines,
        notes: editData.notes,
      });
    } else if (!editData && open) {
      // Reset form when opening in create mode
      setFormData({
        clientId: "",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        currency: String(defaultCurrency),
        appliedTaxes: enabledTaxes.map(t => t.id),
        applyDiscount: false,
        discountType: 'percentage',
        discountValue: 0,
        lines: [],
        notes: "",
      });
    }
  }, [editData, open, defaultCurrency, enabledTaxes]);

  // Calculs dynamiques
  const calculateTotals = () => {
    let totalHT = 0;

    // Calculer le total HT
    formData.lines.forEach((line) => {
      const lineTotal = line.quantity * line.unitPrice;
      totalHT += lineTotal;
    });

    // Appliquer la remise si activée
    let discountAmount = 0;
    if (formData.applyDiscount) {
      if (formData.discountType === 'percentage') {
        discountAmount = (totalHT * formData.discountValue) / 100;
      } else {
        discountAmount = formData.discountValue;
      }
    }

    const totalHTAfterDiscount = totalHT - discountAmount;

    // Calculer les taxes appliquées
    const appliedTaxesList = taxes.filter(t => formData.appliedTaxes.includes(t.id));
    
    // Taxes en pourcentage (appliquées sur le HT après remise)
    const percentageTaxes = appliedTaxesList.filter(t => t.type === 'percentage');
    let totalPercentageTaxes = 0;
    percentageTaxes.forEach(tax => {
      totalPercentageTaxes += calculateTax(totalHTAfterDiscount, tax);
    });

    // Taxes fixes (ajoutées au total)
    const fixedTaxes = appliedTaxesList.filter(t => t.type === 'fixed');
    let totalFixedTaxes = 0;
    fixedTaxes.forEach(tax => {
      totalFixedTaxes += tax.value;
    });

    // Total TTC
    const totalTTC = totalHTAfterDiscount + totalPercentageTaxes + totalFixedTaxes;

    return {
      totalHT,
      discountAmount,
      totalHTAfterDiscount,
      percentageTaxes,
      fixedTaxes,
      totalPercentageTaxes,
      totalFixedTaxes,
      totalTTC,
    };
  };

  const totals = calculateTotals();

  const handleToggleTax = (taxId: string) => {
    setFormData(prev => ({
      ...prev,
      appliedTaxes: prev.appliedTaxes.includes(taxId)
        ? prev.appliedTaxes.filter(id => id !== taxId)
        : [...prev.appliedTaxes, taxId],
    }));
  };

  const handleAddLine = () => {
    // Par défaut, appliquer la première taxe en pourcentage si disponible
    const firstPercentageTax = taxes.find(t => t.type === 'percentage' && formData.appliedTaxes.includes(t.id));
    
    const newLine: InvoiceLine = {
      id: `line_${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRateId: firstPercentageTax?.id || null,
    };
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine],
    }));
  };

  const handleRemoveLine = (lineId: string) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter(l => l.id !== lineId),
    }));
  };

  const handleUpdateLine = (lineId: string, updates: Partial<InvoiceLine>) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map(l =>
        l.id === lineId ? { ...l, ...updates } : l
      ),
    }));
  };

  const handleSave = () => {
    if (!formData.clientId || formData.lines.length === 0) {
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  // Séparer les taxes en pourcentage et fixes
  const percentageTaxes = taxes.filter(t => t.type === 'percentage');
  const fixedTaxes = taxes.filter(t => t.type === 'fixed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        {/* Header moderne */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {editData ? 'Modifier la facture' : 'Nouvelle facture'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editData ? 'Modifiez les informations de la facture' : 'Créez une nouvelle facture client'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.clientId || formData.lines.length === 0}
                className="gap-2"
              >
                <Calculator className="w-4 h-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Section supérieure: Client & Infos en 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Colonne gauche: Client */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Client</h3>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Sélectionner un client *" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formData.clientId && (
                <div className="text-sm text-muted-foreground">
                  {clients.find(c => c.id === formData.clientId)?.adresse || 'Adresse non renseignée'}
                </div>
              )}
            </div>

            {/* Colonne droite: Infos facture */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Détails</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Référence</Label>
                  <Input
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Auto"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TND">TND</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes..."
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Lignes de facturation - Tableau moderne */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Lignes de facturation
              </h3>
              <Button onClick={handleAddLine} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="w-20 text-center font-semibold">Qté</TableHead>
                    <TableHead className="w-28 text-right font-semibold">P.U.</TableHead>
                    <TableHead className="w-24 text-center font-semibold">TVA</TableHead>
                    <TableHead className="w-28 text-right font-semibold">Total HT</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Cliquez sur "Ajouter" pour commencer
                      </TableCell>
                    </TableRow>
                  ) : (
                    formData.lines.map((line) => {
                      const lineTotal = line.quantity * line.unitPrice;
                      const availableLineTaxes = percentageTaxes.filter(t => formData.appliedTaxes.includes(t.id));
                      
                      return (
                        <TableRow key={line.id} className="group">
                          <TableCell className="p-2">
                            <Input
                              value={line.description}
                              onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })}
                              placeholder="Description du produit/service"
                              className="border-0 bg-transparent focus-visible:ring-1 h-9"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={line.quantity}
                              onChange={(e) => handleUpdateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                              className="border-0 bg-transparent focus-visible:ring-1 h-9 text-center"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              value={line.unitPrice}
                              onChange={(e) => handleUpdateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                              className="border-0 bg-transparent focus-visible:ring-1 h-9 text-right"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            {availableLineTaxes.length > 0 ? (
                              <Select
                                value={line.taxRateId || "none"}
                                onValueChange={(value) => handleUpdateLine(line.id, { taxRateId: value === "none" ? "" : value })}
                              >
                                <SelectTrigger className="border-0 bg-transparent h-9 text-center">
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">0%</SelectItem>
                                  {availableLineTaxes.map((tax) => (
                                    <SelectItem key={tax.id} value={tax.id}>
                                      {tax.value}%
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="p-2 text-right font-medium">
                            {formatAmount(lineTotal)}
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveLine(line.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Section inférieure: Options fiscales & Totaux en 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche: Options fiscales */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Options fiscales</h3>
              
              {/* Taxes - TVA et Timbre fiscal sur la même ligne */}
              <div className="flex flex-wrap gap-2">
                {percentageTaxes.map((tax) => (
                  <label
                    key={tax.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      formData.appliedTaxes.includes(tax.id)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={formData.appliedTaxes.includes(tax.id)}
                      onCheckedChange={() => handleToggleTax(tax.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">{tax.name} ({tax.value}%)</span>
                  </label>
                ))}
                {fixedTaxes.map((tax) => (
                  <label
                    key={tax.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      formData.appliedTaxes.includes(tax.id)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={formData.appliedTaxes.includes(tax.id)}
                      onCheckedChange={() => handleToggleTax(tax.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">{tax.name} ({formatAmount(tax.value)})</span>
                  </label>
                ))}
              </div>

              {/* Remise */}
              <div className="pt-3 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.applyDiscount}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, applyDiscount: checked as boolean, discountValue: 0 }))}
                  />
                  <span className="text-sm font-medium">Appliquer une remise</span>
                </label>
                
                {formData.applyDiscount && (
                  <div className="mt-3 flex items-center gap-3">
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: 'percentage' | 'amount') => setFormData(prev => ({ ...prev, discountType: value, discountValue: 0 }))}
                    >
                      <SelectTrigger className="w-32 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="amount">Montant</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                      className="w-28 bg-background"
                      placeholder="Valeur"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite: Totaux (style facture) */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Récapitulatif</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium">{formatAmount(totals.totalHT)}</span>
                </div>

                {formData.applyDiscount && totals.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-orange-600">
                    <span>Remise</span>
                    <span>- {formatAmount(totals.discountAmount)}</span>
                  </div>
                )}

                {totals.percentageTaxes.map((tax) => {
                  const taxAmount = calculateTax(totals.totalHTAfterDiscount, tax);
                  return (
                    <div key={tax.id} className="flex justify-between py-1">
                      <span className="text-muted-foreground">{tax.name} ({tax.value}%)</span>
                      <span className="font-medium">{formatAmount(taxAmount)}</span>
                    </div>
                  );
                })}

                {totals.fixedTaxes.map((tax) => (
                  <div key={tax.id} className="flex justify-between py-1">
                    <span className="text-muted-foreground">{tax.name}</span>
                    <span className="font-medium">{formatAmount(tax.value)}</span>
                  </div>
                ))}

                <div className="flex justify-between py-3 border-t mt-2 text-lg font-bold">
                  <span>Total TTC</span>
                  <span className="text-primary">{formatAmount(totals.totalTTC)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
