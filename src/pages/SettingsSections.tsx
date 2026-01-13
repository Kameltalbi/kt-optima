// Composants de sections extraits de Settings.tsx pour réutilisation
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus,
  Edit2,
  Trash2,
  Star,
  StarOff,
  Percent,
  DollarSign,
  Calculator,
  BookOpen,
  Info,
  ShoppingCart,
  Receipt,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { Currency } from "@/types/currency";
import { useTaxes } from "@/hooks/use-taxes";
import { useAccounting } from "@/hooks/use-accounting";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

// Export des composants de sections pour utilisation dans SettingsModule
export { TaxesSettings, RegionalSettings, AccountingSettings };

// Ces composants seront importés et utilisés dans SettingsModule
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
