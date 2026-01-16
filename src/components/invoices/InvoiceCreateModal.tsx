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

// Type pour les produits/services
interface ProductServiceItem {
  id: string;
  name: string;
  code: string;
  type: 'product' | 'service';
  sale_price?: number;
  price?: number;
  tax_rate?: number;
}

// Composant de recherche produits/services
function ProductServiceSearch({ 
  value, 
  onSelect, 
  onChange, 
  products, 
  services 
}: { 
  value: string; 
  onSelect: (item: ProductServiceItem) => void; 
  onChange?: (value: string) => void;
  products: any[];
  services: any[];
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(value);

  const allItems: ProductServiceItem[] = [
    ...products.map(p => ({
      id: p.id,
      name: p.name,
      code: p.code,
      type: 'product' as const,
      sale_price: p.sale_price,
      tax_rate: p.tax_rate,
    })),
    ...services.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      type: 'service' as const,
      price: s.price,
      tax_rate: s.tax_rate,
    })),
  ];

  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="flex gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="shrink-0 h-9 w-9 p-0">
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher..." value={searchTerm} onValueChange={setSearchTerm} />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              {filteredItems.filter(item => item.type === 'product').length > 0 && (
                <CommandGroup heading="Produits">
                  {filteredItems.filter(item => item.type === 'product').map((item) => (
                    <CommandItem key={item.id} value={`${item.name} ${item.code}`} onSelect={() => { onSelect(item); setOpen(false); setSearchTerm(""); }}>
                      <Package className="mr-2 h-4 w-4" />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.code} - {item.sale_price?.toFixed(2)}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {filteredItems.filter(item => item.type === 'service').length > 0 && (
                <CommandGroup heading="Services">
                  {filteredItems.filter(item => item.type === 'service').map((item) => (
                    <CommandItem key={item.id} value={`${item.name} ${item.code}`} onSelect={() => { onSelect(item); setOpen(false); setSearchTerm(""); }}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.code} - {item.price?.toFixed(2)}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); onChange?.(e.target.value); }}
        placeholder="Description..."
        className="flex-1 border-0 bg-transparent focus-visible:ring-1 h-9"
      />
    </div>
  );
}

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
  const { products, services } = useProducts();

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

  const [showSettings, setShowSettings] = useState(false);

  // Initialiser avec les taxes activées par défaut
  useEffect(() => {
    if (enabledTaxes.length > 0 && formData.appliedTaxes.length === 0 && !editData) {
      setFormData(prev => ({
        ...prev,
        appliedTaxes: enabledTaxes.map(t => t.id),
      }));
    }
  }, [enabledTaxes, editData]);

  const wasOpenRef = useRef(false);

  // Pré-remplir le formulaire en mode édition / reset en création (uniquement à l'ouverture)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (editData) {
        setFormData({
          clientId: editData.clientId,
          date: editData.date,
          reference: editData.reference,
          currency: String(defaultCurrency),
          appliedTaxes: enabledTaxes.map((t) => t.id),
          applyDiscount: false,
          discountType: "percentage",
          discountValue: 0,
          lines: editData.lines,
          notes: editData.notes,
        });
      } else {
        // Reset form when opening in create mode avec une ligne par défaut
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
            {
              id: `line_${Date.now()}`,
              description: "",
              quantity: 1,
              unitPrice: 0,
              taxRateId: firstPercentageTax?.id || null,
            },
          ],
          notes: "",
        });
      }
    }

    wasOpenRef.current = open;
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
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {editData ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editData ? 'Modifiez les informations de la facture' : 'Créez une nouvelle facture client'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Bouton Réglages */}
          <div className="mb-6">
            <Button
              type="button"
              variant={showSettings ? "default" : "outline"}
              onClick={() => setShowSettings(!showSettings)}
              className={`gap-2 ${showSettings ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
            >
              <Settings className="w-4 h-4" />
              {showSettings ? 'Masquer les réglages' : 'Réglages (taxes & remise)'}
            </Button>
          </div>

          {/* Options fiscales et Remise - Affichées seulement si showSettings */}
          {showSettings && (
            <div className="mb-6 p-4 bg-green-50/50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                Options fiscales & Remise
              </h3>
              
              {/* Taxes */}
              <div className="flex flex-wrap gap-2 mb-4">
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
                <Label className="text-sm font-medium mb-2 block">Remise</Label>
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
                    <SelectTrigger className="w-[160px] bg-background">
                      <SelectValue placeholder="Type de remise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="amount">Montant fixe</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountValue || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({ 
                          ...prev, 
                          discountValue: value,
                          applyDiscount: value > 0,
                        }));
                      }}
                      className="w-24 bg-background"
                      placeholder="Valeur"
                    />
                    <span className="text-muted-foreground text-sm">
                      {formData.discountType === 'percentage' ? '%' : formData.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  {formData.lines.map((line) => {
                      const lineTotal = line.quantity * line.unitPrice;
                      const availableLineTaxes = percentageTaxes.filter(t => formData.appliedTaxes.includes(t.id));
                      
                      return (
                        <TableRow key={line.id} className="group">
                          <TableCell className="p-2">
                            <ProductServiceSearch
                              value={line.description}
                              onChange={(value) => handleUpdateLine(line.id, { description: value })}
                              onSelect={(item) => {
                                handleUpdateLine(line.id, {
                                  description: item.name,
                                  unitPrice: item.type === 'product' ? (item.sale_price || 0) : (item.price || 0),
                                  quantity: 1,
                                });
                                if (item.tax_rate) {
                                  const productTax = taxes.find(t => t.type === 'percentage' && Math.abs(t.value - item.tax_rate!) < 0.01);
                                  if (productTax && formData.appliedTaxes.includes(productTax.id)) {
                                    handleUpdateLine(line.id, { taxRateId: productTax.id });
                                  }
                                }
                              }}
                              products={products}
                              services={services}
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
                    })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Section inférieure: Totaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div></div>
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

        <DialogFooter className="px-6 py-4 border-t">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
