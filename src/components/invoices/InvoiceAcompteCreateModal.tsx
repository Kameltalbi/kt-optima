import { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, Calculator, Search, Package, Briefcase, Settings } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { useTaxes, Tax } from "@/hooks/use-taxes";
import { useCurrency } from "@/hooks/use-currency";
import { useProducts } from "@/hooks/use-products";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface ProductServiceItem {
  id: string;
  name: string;
  code: string;
  type: 'product' | 'service';
  sale_price?: number;
  price?: number;
  tax_rate?: number;
}

function ProductServiceSearch({ value, onSelect, onChange, products, services }: { value: string; onSelect: (item: ProductServiceItem) => void; onChange?: (value: string) => void; products: any[]; services: any[]; }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(value);

  const allItems: ProductServiceItem[] = [
    ...products.map(p => ({ id: p.id, name: p.name, code: p.code, type: 'product' as const, sale_price: p.sale_price, tax_rate: p.tax_rate })),
    ...services.map(s => ({ id: s.id, name: s.name, code: s.code, type: 'service' as const, price: s.price, tax_rate: s.tax_rate })),
  ];

  const filteredItems = allItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => { setInputValue(value); }, [value]);

  return (
    <div className="flex gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="shrink-0"><Search className="h-4 w-4" /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher..." value={searchTerm} onValueChange={setSearchTerm} />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              {filteredItems.filter(i => i.type === 'product').length > 0 && (
                <CommandGroup heading="Produits">
                  {filteredItems.filter(i => i.type === 'product').map(item => (
                    <CommandItem key={item.id} value={`${item.name} ${item.code}`} onSelect={() => { onSelect(item); setOpen(false); setSearchTerm(""); }}>
                      <Package className="mr-2 h-4 w-4" /><div className="flex flex-col flex-1"><span className="font-medium">{item.name}</span><span className="text-xs text-muted-foreground">{item.code}</span></div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {filteredItems.filter(i => i.type === 'service').length > 0 && (
                <CommandGroup heading="Services">
                  {filteredItems.filter(i => i.type === 'service').map(item => (
                    <CommandItem key={item.id} value={`${item.name} ${item.code}`} onSelect={() => { onSelect(item); setOpen(false); setSearchTerm(""); }}>
                      <Briefcase className="mr-2 h-4 w-4" /><div className="flex flex-col flex-1"><span className="font-medium">{item.name}</span><span className="text-xs text-muted-foreground">{item.code}</span></div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input value={inputValue} onChange={(e) => { setInputValue(e.target.value); onChange?.(e.target.value); }} placeholder="Description..." className="flex-1" />
    </div>
  );
}

export interface InvoiceAcompteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId: string | null; // Taxe appliquée à cette ligne (pourcentage uniquement)
}

export interface InvoiceAcompteFormData {
  clientId: string;
  date: string;
  reference: string;
  currency: string;
  appliedTaxes: string[]; // IDs des taxes cochées
  applyDiscount: boolean;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  lines: InvoiceAcompteLine[];
  notes: string;
}

interface InvoiceAcompteCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: InvoiceAcompteFormData) => void;
  editData?: {
    id: string;
    clientId: string;
    date: string;
    reference: string;
    notes: string;
    lines: { id: string; description: string; quantity: number; unitPrice: number; taxRateId: string | null; }[];
  } | null;
}

export function InvoiceAcompteCreateModal({
  open,
  onOpenChange,
  onSave,
  editData,
}: InvoiceAcompteCreateModalProps) {
  const { clients, loading: clientsLoading } = useClients();
  const { taxes, enabledTaxes, calculateTax } = useTaxes();
  const { defaultCurrency, formatAmount } = useCurrency();
  const { products, services } = useProducts();

  const [formData, setFormData] = useState<InvoiceAcompteFormData>({
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

  const [showSettings, setShowSettings] = useState(false);

  const wasOpenRef = useRef(false);

  // Réinitialiser le formulaire quand le modal s'ouvre ou charger les données d'édition
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setShowSettings(false); // Reset settings visibility
      if (editData) {
        // Mode édition
        setFormData({
          clientId: editData.clientId,
          date: editData.date,
          reference: editData.reference,
          currency: String(defaultCurrency),
          appliedTaxes: enabledTaxes.map((t) => t.id),
          applyDiscount: false,
          discountType: "percentage",
          discountValue: 0,
          lines: editData.lines.map((l) => ({
            id: l.id,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRateId: l.taxRateId,
          })),
          notes: editData.notes,
        });
      } else {
        // Mode création avec ligne par défaut
        const firstPercentageTax = enabledTaxes.find((t) => t.type === "percentage");
        setFormData({
          clientId: "",
          date: new Date().toISOString().split("T")[0],
          reference: "",
          currency: String(defaultCurrency),
          appliedTaxes: enabledTaxes.map((t) => t.id),
          applyDiscount: false,
          discountType: "percentage",
          discountValue: 0,
          lines: [
            { id: `line_${Date.now()}`, description: "", quantity: 1, unitPrice: 0, taxRateId: firstPercentageTax?.id || null },
          ],
          notes: "",
        });
      }
    }

    wasOpenRef.current = open;
  }, [open, defaultCurrency, enabledTaxes, editData]);

  // Initialiser avec les taxes activées par défaut
  useEffect(() => {
    if (enabledTaxes.length > 0 && formData.appliedTaxes.length === 0) {
      setFormData(prev => ({
        ...prev,
        appliedTaxes: enabledTaxes.map(t => t.id),
      }));
    }
  }, [enabledTaxes]);

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
    
    const newLine: InvoiceAcompteLine = {
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

  const handleUpdateLine = (lineId: string, updates: Partial<InvoiceAcompteLine>) => {
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <DialogTitle>{editData ? "Modifier la facture d'acompte" : "Nouvelle facture d'acompte"}</DialogTitle>
            <DialogDescription>
              {editData ? "Modifiez les informations de la facture d'acompte" : "Créez une facture d'acompte (avance client) qui sera déductible sur les factures finales"}
            </DialogDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant={showSettings ? "default" : "outline"}
            onClick={() => setShowSettings(!showSettings)}
            className={`gap-2 shrink-0 mr-6 ${showSettings ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
          >
            <Settings className="w-4 h-4" />
            {showSettings ? 'Masquer' : 'Réglages'}
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Options fiscales et Remise - Affichées seulement si showSettings */}
          {showSettings && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-green-600" />
                  Options fiscales & Remise
                </CardTitle>
                <CardDescription>
                  Sélectionnez les taxes à appliquer depuis Paramètres → Taxes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Taxes en pourcentage */}
                {percentageTaxes.length > 0 && (
                  <div className="space-y-3 p-4 border rounded-lg bg-background">
                    <Label className="font-semibold">Taxes en pourcentage</Label>
                    <div className="space-y-2">
                      {percentageTaxes.map((tax) => (
                        <div key={tax.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tax-${tax.id}`}
                            checked={formData.appliedTaxes.includes(tax.id)}
                            onCheckedChange={() => handleToggleTax(tax.id)}
                          />
                          <Label htmlFor={`tax-${tax.id}`} className="cursor-pointer flex-1">
                            {tax.name} ({tax.value}%)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Taxes fixes */}
                {fixedTaxes.length > 0 && (
                  <div className="space-y-3 p-4 border rounded-lg bg-background">
                    <Label className="font-semibold">Taxes fixes</Label>
                    <div className="space-y-2">
                      {fixedTaxes.map((tax) => (
                        <div key={tax.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tax-${tax.id}`}
                            checked={formData.appliedTaxes.includes(tax.id)}
                            onCheckedChange={() => handleToggleTax(tax.id)}
                          />
                          <Label htmlFor={`tax-${tax.id}`} className="cursor-pointer flex-1">
                            {tax.name} ({formatAmount(tax.value)})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {taxes.length === 0 && (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground bg-background">
                    <p className="text-sm">Aucune taxe configurée</p>
                    <p className="text-xs mt-1">Configurez vos taxes dans Paramètres → Taxes</p>
                  </div>
                )}

                {/* Remise */}
                <div className="space-y-3 p-4 border rounded-lg bg-background">
                  <Label className="font-semibold">Remise</Label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          discountType: value as 'percentage' | 'amount',
                          applyDiscount: true,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type de remise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="amount">Montant fixe</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        id="discount-value"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={formData.discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50'}
                        value={formData.discountValue || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            discountValue: value,
                            applyDiscount: value > 0,
                          }));
                        }}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">
                        {formData.discountType === 'percentage' ? '%' : formData.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 1. Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, clientId: value }))
                    }
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Sélectionner un client" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, reference: e.target.value }))
                    }
                    placeholder="Réf. facture d'acompte (générée automatiquement si vide)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="TND">TND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Lignes de facturation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Lignes de facturation</CardTitle>
                  <CardDescription>Ajoutez les produits ou services</CardDescription>
                </div>
                <Button type="button" onClick={handleAddLine} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Quantité</TableHead>
                    <TableHead className="w-32">Prix unitaire</TableHead>
                    <TableHead className="w-32">Taxe</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line) => {
                    const lineTotal = line.quantity * line.unitPrice;
                    const availableLineTaxes = percentageTaxes.filter(t => formData.appliedTaxes.includes(t.id));
                    
                    return (
                      <TableRow key={line.id}>
                        <TableCell>
                          <ProductServiceSearch
                            value={line.description}
                            onChange={(value) => handleUpdateLine(line.id, { description: value })}
                            onSelect={(item) => {
                              handleUpdateLine(line.id, {
                                description: item.name,
                                unitPrice: item.type === 'product' ? (item.sale_price || 0) : (item.price || 0),
                                quantity: 1,
                              });
                            }}
                            products={products}
                            services={services}
                          />
                        </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.quantity}
                              onChange={(e) =>
                                handleUpdateLine(line.id, {
                                  quantity: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) =>
                                handleUpdateLine(line.id, {
                                  unitPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {availableLineTaxes.length > 0 ? (
                              <Select
                                value={line.taxRateId || "none"}
                                onValueChange={(value) =>
                                  handleUpdateLine(line.id, { taxRateId: value === "none" ? null : value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Taxe" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucune</SelectItem>
                                  {availableLineTaxes.map((tax) => (
                                    <SelectItem key={tax.id} value={tax.id}>
                                      {tax.name} ({tax.value}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatAmount(lineTotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLine(line.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>

          {/* 4. Totaux */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HT:</span>
                  <span className="font-medium">{formatAmount(totals.totalHT)}</span>
                </div>

                {formData.applyDiscount && (
                  <div className="flex justify-between text-orange-600">
                    <span>Remise:</span>
                    <span>-{formatAmount(totals.discountAmount)}</span>
                  </div>
                )}

                {formData.applyDiscount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total HT après remise:</span>
                    <span className="font-medium">{formatAmount(totals.totalHTAfterDiscount)}</span>
                  </div>
                )}

                {/* Taxes en pourcentage */}
                {totals.percentageTaxes.map((tax) => {
                  const taxAmount = calculateTax(totals.totalHTAfterDiscount, tax);
                  return (
                    <div key={tax.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {tax.name} ({tax.value}%):
                      </span>
                      <span className="font-medium">{formatAmount(taxAmount)}</span>
                    </div>
                  );
                })}

                {/* Taxes fixes */}
                {totals.fixedTaxes.map((tax) => (
                  <div key={tax.id} className="flex justify-between">
                    <span className="text-muted-foreground">{tax.name}:</span>
                    <span className="font-medium">{formatAmount(tax.value)}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total TTC:</span>
                  <span>{formatAmount(totals.totalTTC)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.notes}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Notes additionnelles..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formData.clientId || formData.lines.length === 0}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
