import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Users, 
  Shield, 
  FileText, 
  Globe, 
  FolderOpen,
  Plus,
  Download,
  Trash2,
  Upload,
  FileCheck,
  Eye,
  Package,
  CheckCircle2,
  XCircle,
  Edit2,
  Star,
  StarOff,
  Percent,
  DollarSign,
  Calculator,
  BookOpen,
  Info,
  ShoppingCart,
  Receipt,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { Currency } from "@/types/currency";
import { useTaxes } from "@/hooks/use-taxes";
import { useAccounting } from "@/hooks/use-accounting";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const settingsSections = [
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "roles", label: "Rôles", icon: Shield },
  { id: "modules", label: "Modules", icon: Package },
  { id: "taxes", label: "Taxes et TVA", icon: Percent },
  { id: "invoicing", label: "Facturation", icon: FileText },
  { id: "accounting", label: "Comptabilité", icon: Calculator },
  { id: "templates", label: "Modèles", icon: FileCheck },
  { id: "regional", label: "Régional", icon: Globe },
  { id: "documents", label: "Documents", icon: FolderOpen },
];

function TaxesSettings() {
  const { taxes, enabledTaxes, addTax, updateTax, deleteTax, toggleTax } = useTaxes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<typeof taxes[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
  });

  const handleOpenDialog = (tax?: typeof taxes[0]) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        type: tax.type,
        value: tax.value,
      });
    } else {
      setEditingTax(null);
      setFormData({
        name: '',
        type: 'percentage',
        value: 19,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTax) {
      updateTax(editingTax.id, formData);
    } else {
      addTax({
        ...formData,
        enabled: true,
      });
    }
    setIsDialogOpen(false);
    setEditingTax(null);
    setFormData({ name: '', type: 'percentage', value: 0 });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Taxes et TVA</CardTitle>
              <CardDescription className="text-xs">
                Gérez les taxes qui apparaîtront dans vos documents
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs gap-1.5" onClick={() => handleOpenDialog()}>
              <Plus className="w-3.5 h-3.5" />
              Nouvelle taxe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Percent className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune taxe configurée</p>
                <p className="text-xs mt-1">Cliquez sur "Nouvelle taxe" pour en ajouter une</p>
              </div>
            ) : (
              taxes.map((tax) => (
                <div
                  key={tax.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      tax.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      {tax.type === 'percentage' ? (
                        <Percent className={cn(
                          "w-5 h-5",
                          tax.enabled ? "text-primary" : "text-muted-foreground"
                        )} />
                      ) : (
                        <DollarSign className={cn(
                          "w-5 h-5",
                          tax.enabled ? "text-primary" : "text-muted-foreground"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{tax.name}</p>
                        {tax.isDefault && (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                            Par défaut
                          </Badge>
                        )}
                        {tax.enabled ? (
                          <Badge className="bg-success/10 text-success border-0 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activée
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            <XCircle className="w-3 h-3 mr-1" />
                            Désactivée
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tax.type === 'percentage' 
                          ? `${tax.value}%` 
                          : `${tax.value.toFixed(2)} MAD (montant fixe)`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={tax.enabled} 
                      onCheckedChange={() => toggleTax(tax.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(tax)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {!tax.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteTax(tax.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTax ? 'Modifier la taxe' : 'Nouvelle taxe'}</DialogTitle>
            <DialogDescription className="text-xs">
              {editingTax ? 'Modifiez les informations de la taxe' : 'Créez une nouvelle taxe personnalisée'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom de la taxe *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: TVA, Taxe sur les services, etc."
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Type de taxe *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                {formData.type === 'percentage' ? 'Taux (%) *' : 'Montant (MAD) *'}
              </Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                placeholder={formData.type === 'percentage' ? 'Ex: 19' : 'Ex: 50.00'}
                className="h-9 text-sm"
                min="0"
                step={formData.type === 'percentage' ? '1' : '0.01'}
              />
              {formData.type === 'percentage' && (
                <p className="text-[10px] text-muted-foreground">
                  Le pourcentage sera calculé sur le montant HT
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTax(null);
                  setFormData({ name: '', type: 'percentage', value: 0 });
                }}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!formData.name || formData.value <= 0}
                className="bg-primary hover:bg-primary/90"
              >
                {editingTax ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegionalSettings() {
  const { currencies, defaultCurrency, addCurrency, updateCurrency, deleteCurrency, setAsDefault } = useCurrency();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    symbol: '',
    symbolPosition: 'after' as 'before' | 'after',
    decimalPlaces: 2,
    wordSingular: '',
    wordPlural: '',
    wordFractionSingular: '',
    wordFractionPlural: '',
  });

  const handleOpenDialog = (currency?: Currency) => {
    if (currency) {
      setEditingCurrency(currency);
      setFormData({
        name: currency.name,
        code: currency.code,
        symbol: currency.symbol,
        symbolPosition: currency.symbolPosition,
        decimalPlaces: currency.decimalPlaces,
        wordSingular: currency.wordSingular,
        wordPlural: currency.wordPlural,
        wordFractionSingular: currency.wordFractionSingular,
        wordFractionPlural: currency.wordFractionPlural,
      });
    } else {
      setEditingCurrency(null);
      setFormData({
        name: '',
        code: '',
        symbol: '',
        symbolPosition: 'after',
        decimalPlaces: 2,
        wordSingular: '',
        wordPlural: '',
        wordFractionSingular: '',
        wordFractionPlural: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingCurrency) {
      updateCurrency(editingCurrency.id, formData);
    } else {
      addCurrency(formData);
    }
    setIsDialogOpen(false);
    setEditingCurrency(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette devise ?')) {
      deleteCurrency(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Gestion des devises</CardTitle>
              <CardDescription className="text-xs">
                Créez et gérez vos devises. La devise par défaut sera utilisée dans tous les documents.
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs gap-1.5" onClick={() => handleOpenDialog()}>
              <Plus className="w-3.5 h-3.5" />
              Nouvelle devise
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currencies.map((currency) => (
              <div
                key={currency.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  currency.isDefault
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/30 border-border/50"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center gap-1">
                    {currency.isDefault ? (
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    ) : (
                      <StarOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    {currency.isDefault && (
                      <span className="text-[10px] text-primary font-medium">Par défaut</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{currency.name}</p>
                      <Badge variant="outline" className="text-[10px]">{currency.code}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Symbole: {currency.symbolPosition === 'before' 
                          ? `${currency.symbol}100` 
                          : `100 ${currency.symbol}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currency.wordPlural}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!currency.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setAsDefault(currency.id)}
                      title="Définir comme devise par défaut"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleOpenDialog(currency)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {!currency.isDefault && currencies.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(currency.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Autres paramètres régionaux</CardTitle>
          <CardDescription className="text-xs">
            Langue et format de date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Langue</Label>
              <Input defaultValue="Français" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Format de date</Label>
              <Input defaultValue="DD/MM/YYYY" className="h-9 text-sm" />
            </div>
          </div>
          <div className="pt-2">
            <Button size="sm" className="text-xs">
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCurrency ? 'Modifier la devise' : 'Nouvelle devise'}</DialogTitle>
            <DialogDescription className="text-xs">
              Remplissez les informations pour {editingCurrency ? 'modifier' : 'créer'} la devise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Nom de la devise *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Dirham marocain"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: MAD"
                  className="h-9 text-sm"
                  maxLength={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Symbole *</Label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="Ex: DH, €, $"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Position du symbole *</Label>
                <Select
                  value={formData.symbolPosition}
                  onValueChange={(value: 'before' | 'after') => setFormData({ ...formData, symbolPosition: value })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Avant le montant ($100)</SelectItem>
                    <SelectItem value="after">Après le montant (100 DH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nombre de décimales *</Label>
              <Input
                type="number"
                value={formData.decimalPlaces}
                onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 2 })}
                min="0"
                max="4"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Mot au singulier *</Label>
                <Input
                  value={formData.wordSingular}
                  onChange={(e) => setFormData({ ...formData, wordSingular: e.target.value })}
                  placeholder="Ex: dirham, euro, dollar"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Mot au pluriel *</Label>
                <Input
                  value={formData.wordPlural}
                  onChange={(e) => setFormData({ ...formData, wordPlural: e.target.value })}
                  placeholder="Ex: dirhams, euros, dollars"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Fraction au singulier *</Label>
                <Input
                  value={formData.wordFractionSingular}
                  onChange={(e) => setFormData({ ...formData, wordFractionSingular: e.target.value })}
                  placeholder="Ex: centime, cent"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fraction au pluriel *</Label>
                <Input
                  value={formData.wordFractionPlural}
                  onChange={(e) => setFormData({ ...formData, wordFractionPlural: e.target.value })}
                  placeholder="Ex: centimes, cents"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !formData.name ||
                !formData.code ||
                !formData.symbol ||
                !formData.wordSingular ||
                !formData.wordPlural ||
                !formData.wordFractionSingular ||
                !formData.wordFractionPlural
              }
            >
              {editingCurrency ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountingSettings() {
  const { config, updateConfig, getAccount } = useAccounting();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    updateConfig(localConfig);
  };

  const accountLabels: Record<keyof typeof config.accounts, string> = {
    fournisseurs: "Fournisseurs (401xxx)",
    clients: "Clients (411xxx)",
    banque: "Banque principale (512xxx)",
    caisse: "Caisse (531xxx)",
    tvaDeductible: "TVA déductible (345xxx)",
    tvaCollectee: "TVA collectée (4457xx)",
    achats: "Achats (60xxx)",
    ventes: "Ventes (70xxx)",
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Configuration comptable</CardTitle>
              <CardDescription className="text-xs">
                Configurez les comptes par défaut et activez/désactivez la génération automatique d'écritures
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation de la comptabilité */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-sm font-semibold">Génération automatique d'écritures</Label>
                <p className="text-xs text-muted-foreground">
                  Activez pour générer automatiquement les écritures depuis les modules Finance, Achats et Ventes
                </p>
              </div>
            </div>
            <Switch
              checked={localConfig.enabled}
              onCheckedChange={(checked) => setLocalConfig({ ...localConfig, enabled: checked })}
            />
          </div>

          {/* Comptes par défaut */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Comptes par défaut (PCG Tunisien)</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Configurez les numéros de comptes utilisés pour la génération automatique des écritures
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(localConfig.accounts).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-xs">{accountLabels[key as keyof typeof accountLabels]}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        accounts: { ...localConfig.accounts, [key]: e.target.value }
                      })}
                      placeholder="Ex: 401000"
                      className="h-9 text-sm font-mono"
                    />
                    {getAccount(value) && (
                      <Badge variant="outline" className="text-xs">
                        {getAccount(value)?.intitule}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations */}
          <Alert className="bg-info/5 border-info/20">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-xs">
              Les écritures comptables sont générées automatiquement selon le Plan Comptable Général Tunisien (PCG TN).
              Toute action financière validée (facture, paiement) crée une écriture équilibrée.
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <Button size="sm" onClick={handleSave} className="text-xs">
              Enregistrer la configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Règles de mapping */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Règles de mapping Finance → Comptabilité</CardTitle>
          <CardDescription className="text-xs">
            Comprendre comment les écritures sont générées automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <ShoppingCart className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-2">Facture fournisseur enregistrée</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Débit compte {localConfig.accounts.achats} (Achats)</li>
                    <li>Débit compte {localConfig.accounts.tvaDeductible} (TVA déductible)</li>
                    <li>Crédit compte {localConfig.accounts.fournisseurs} (Fournisseurs)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-2">Paiement fournisseur</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Débit compte {localConfig.accounts.fournisseurs} (Fournisseurs)</li>
                    <li>Crédit compte {localConfig.accounts.banque} (Banque) ou {localConfig.accounts.caisse} (Caisse)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <Receipt className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-2">Facture client émise</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Débit compte {localConfig.accounts.clients} (Clients)</li>
                    <li>Crédit compte {localConfig.accounts.ventes} (Ventes)</li>
                    <li>Crédit compte {localConfig.accounts.tvaCollectee} (TVA collectée)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-2">Encaissement client</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Débit compte {localConfig.accounts.banque} (Banque) ou {localConfig.accounts.caisse} (Caisse)</li>
                    <li>Crédit compte {localConfig.accounts.clients} (Clients)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");

  const renderContent = () => {
    switch (activeSection) {
      case "company":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Informations de l'entreprise</CardTitle>
                <CardDescription className="text-xs">
                  Ces informations apparaîtront sur vos documents officiels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Nom de l'entreprise</Label>
                    <Input placeholder="Entreprise SA" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Numéro fiscal</Label>
                    <Input placeholder="123456789" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Adresse</Label>
                  <Input placeholder="123 Rue Principale, Casablanca" className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Téléphone</Label>
                    <Input placeholder="+212 5XX XXX XXX" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input placeholder="contact@entreprise.ma" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="text-xs">
                    Enregistrer les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Logo de l'entreprise</CardTitle>
                <CardDescription className="text-xs">
                  Le logo sera affiché sur les factures et documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                    <Building2 className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Télécharger un logo
                    </Button>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Pied de page documents</CardTitle>
                <CardDescription className="text-xs">
                  Texte affiché en bas de vos factures, devis et documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Contenu du pied de page</Label>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Capital: 100 000 DH | RC: 123456 | IF: 12345678 | ICE: 001234567890123 | Patente: 12345678 | CNSS: 1234567&#10;RIB: XXX XXX XXXX XXXX XXXX XXXX XXX&#10;Conditions de paiement, mentions légales..."
                  />
                </div>
                <div className="pt-2">
                  <Button size="sm" className="text-xs">
                    Enregistrer le pied de page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "users":
        return (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Utilisateurs</CardTitle>
                  <CardDescription className="text-xs">
                    Gérez les utilisateurs de votre organisation
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Admin Principal", email: "admin@entreprise.ma", role: "Administrateur" },
                  { name: "Comptable", email: "compta@entreprise.ma", role: "Comptabilité" },
                  { name: "Commercial", email: "commercial@entreprise.ma", role: "Ventes" },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "roles":
        return (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Rôles et permissions</CardTitle>
                  <CardDescription className="text-xs">
                    Configurez les accès par rôle
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Nouveau rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Administrateur", desc: "Accès complet", users: 1 },
                  { name: "Comptabilité", desc: "Finance et rapports", users: 2 },
                  { name: "Ventes", desc: "Commercial et clients", users: 3 },
                ].map((role) => (
                  <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{role.users} utilisateurs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "taxes":
        return <TaxesSettings />;

      case "invoicing":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Numérotation des documents</CardTitle>
                <CardDescription className="text-xs">
                  Format de numérotation automatique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Préfixe factures</Label>
                    <Input defaultValue="FAC-" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prochain numéro</Label>
                    <Input defaultValue="00001" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Préfixe devis</Label>
                    <Input defaultValue="DEV-" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prochain numéro</Label>
                    <Input defaultValue="00001" className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Taux de TVA</CardTitle>
                <CardDescription className="text-xs">
                  Taux applicables aux produits et services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "TVA Standard", rate: "20%" },
                    { name: "TVA Réduit", rate: "10%" },
                    { name: "TVA Super réduit", rate: "7%" },
                  ].map((vat) => (
                    <div key={vat.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-sm">{vat.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{vat.rate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "regional":
        return <RegionalSettings />;

      case "templates":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Modèle de document actif</CardTitle>
                <CardDescription className="text-xs">
                  Ce modèle sera utilisé pour toutes les factures, devis et bons de commande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Modèle Standard</p>
                      <p className="text-xs text-muted-foreground">Design professionnel avec en-tête et pied de page</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Actif</Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-1.5"
                      onClick={() => window.open('/documents/preview', '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Aperçu
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">Autres modèles disponibles</p>
                  <div className="space-y-2">
                    {[
                      { id: 2, name: "Modèle Minimaliste", desc: "Design épuré et moderne" },
                      { id: 3, name: "Modèle Coloré", desc: "Avec couleurs personnalisées" },
                    ].map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.desc}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Activer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Personnalisation du modèle</CardTitle>
                <CardDescription className="text-xs">
                  Ajustez l'apparence de vos documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="#22C55E" className="h-9 text-sm flex-1" />
                      <div className="w-9 h-9 rounded-md bg-primary border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Police du document</Label>
                    <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Afficher le logo</Label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Afficher le logo de l'entreprise en haut des documents</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="text-xs">
                    Enregistrer les préférences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "modules":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div>
                  <CardTitle className="text-base">Modules disponibles</CardTitle>
                  <CardDescription className="text-xs">
                    Activez ou désactivez les modules de votre BilvoxaERP
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      id: "crm", 
                      name: "CRM", 
                      description: "Gestion de la relation client",
                      enabled: true,
                      icon: Users
                    },
                    { 
                      id: "commercial", 
                      name: "Commercial", 
                      description: "Gestion des ventes, devis et factures",
                      enabled: true,
                      icon: FileText
                    },
                    { 
                      id: "achats", 
                      name: "Achats", 
                      description: "Gestion des fournisseurs et commandes",
                      enabled: true,
                      icon: Package
                    },
                    { 
                      id: "stock", 
                      name: "Stock", 
                      description: "Gestion de l'inventaire et des entrepôts",
                      enabled: true,
                      icon: Package
                    },
                    { 
                      id: "finance", 
                      name: "Finance", 
                      description: "Trésorerie et gestion bancaire",
                      enabled: true,
                      icon: FileText
                    },
                    { 
                      id: "comptabilite", 
                      name: "Comptabilité", 
                      description: "Plan comptable et écritures",
                      enabled: true,
                      icon: FileText
                    },
                    { 
                      id: "rh", 
                      name: "Ressources Humaines", 
                      description: "Gestion du personnel et de la paie",
                      enabled: false,
                      icon: Users
                    },
                    { 
                      id: "ecommerce", 
                      name: "E-commerce", 
                      description: "Boutique en ligne et commandes",
                      enabled: false,
                      icon: Package
                    },
                  ].map((module) => {
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "p-2.5 rounded-lg",
                            module.enabled ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Icon className={cn(
                              "w-5 h-5",
                              module.enabled ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{module.name}</p>
                              {module.enabled ? (
                                <Badge className="bg-success/10 text-success border-0 text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Actif
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactif
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={module.enabled} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Modules supplémentaires</CardTitle>
                <CardDescription className="text-xs">
                  Installez des modules supplémentaires pour étendre les fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      name: "Module Reporting Avancé", 
                      description: "Rapports personnalisés et analyses détaillées",
                      price: "Gratuit"
                    },
                    { 
                      name: "Module Multi-devises", 
                      description: "Gestion de plusieurs devises",
                      price: "299 MAD/mois"
                    },
                    { 
                      name: "Module API", 
                      description: "Intégration avec des systèmes externes",
                      price: "499 MAD/mois"
                    },
                  ].map((module) => (
                    <div
                      key={module.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{module.name}</p>
                          <Badge variant="outline" className="text-[10px]">{module.price}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Installer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "accounting":
        return <AccountingSettings />;

      case "documents":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Documents</CardTitle>
                    <CardDescription className="text-xs">
                      Gérez vos fichiers et modèles
                    </CardDescription>
                  </div>
                  <Button size="sm" className="text-xs gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Téléverser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Modèle facture.docx", type: "Modèle", date: "12/01/2024", size: "45 KB" },
                    { name: "Logo HD.png", type: "Image", date: "10/01/2024", size: "1.2 MB" },
                    { name: "CGV.pdf", type: "Document", date: "05/01/2024", size: "320 KB" },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Catégories de documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Factures", "Devis", "Contrats", "Modèles", "Autres"].map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout 
      title="Paramètres" 
      subtitle="Configuration de l'application"
      hideSidebar={true}
      showBackButton={true}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>

        {/* Right Sidebar - Full height */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Card className="border-border/50 h-full lg:min-h-[calc(100vh-8rem)] bg-sidebar flex flex-col">
            <CardHeader className="pb-3 border-b border-sidebar-border/50">
              <CardTitle className="text-base font-bold text-white">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <nav className="px-3 py-3 space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 text-left",
                          isActive
                            ? "bg-white/20 text-white font-bold shadow-lg"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
