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
  DialogTrigger,
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
import { 
  Plus, 
  Search, 
  BookOpen,
  Edit,
  Trash2,
  Download,
  Upload,
  Info,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Account {
  id: string;
  numero: string;
  intitule: string;
  classe: string;
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie';
  nature: 'debit' | 'credit';
  actif: boolean;
  parentId?: string;
  niveau: number;
  soldeDebit?: number;
  soldeCredit?: number;
}

// Mock data - Plan comptable général tunisien (PCG TN)
const mockAccounts: Account[] = [
  // Classe 1 - Capitaux
  { id: "1", numero: "1", intitule: "Capitaux", classe: "1", type: "passif", nature: "credit", actif: true, niveau: 1 },
  { id: "101000", numero: "101000", intitule: "Capital social", classe: "1", type: "passif", nature: "credit", actif: true, parentId: "1", niveau: 2, soldeCredit: 100000 },
  { id: "106000", numero: "106000", intitule: "Réserves", classe: "1", type: "passif", nature: "credit", actif: true, parentId: "1", niveau: 2, soldeCredit: 50000 },
  
  // Classe 2 - Immobilisations
  { id: "2", numero: "2", intitule: "Immobilisations", classe: "2", type: "actif", nature: "debit", actif: true, niveau: 1 },
  { id: "201000", numero: "201000", intitule: "Immobilisations incorporelles", classe: "2", type: "actif", nature: "debit", actif: true, parentId: "2", niveau: 2, soldeDebit: 20000 },
  { id: "211000", numero: "211000", intitule: "Immobilisations corporelles", classe: "2", type: "actif", nature: "debit", actif: true, parentId: "2", niveau: 2, soldeDebit: 150000 },
  
  // Classe 3 - Stocks
  { id: "3", numero: "3", intitule: "Stocks", classe: "3", type: "actif", nature: "debit", actif: true, niveau: 1 },
  { id: "311000", numero: "311000", intitule: "Matières premières", classe: "3", type: "actif", nature: "debit", actif: true, parentId: "3", niveau: 2, soldeDebit: 45000 },
  { id: "351000", numero: "351000", intitule: "Produits finis", classe: "3", type: "actif", nature: "debit", actif: true, parentId: "3", niveau: 2, soldeDebit: 893900 },
  
  // Classe 4 - Tiers (clients, fournisseurs, État)
  { id: "4", numero: "4", intitule: "Tiers", classe: "4", type: "tresorerie", nature: "debit", actif: true, niveau: 1 },
  { id: "401000", numero: "401000", intitule: "Fournisseurs locaux", classe: "4", type: "passif", nature: "credit", actif: true, parentId: "4", niveau: 2, soldeCredit: 45000 },
  { id: "411000", numero: "411000", intitule: "Clients locaux", classe: "4", type: "actif", nature: "debit", actif: true, parentId: "4", niveau: 2, soldeDebit: 85000 },
  { id: "345500", numero: "345500", intitule: "TVA déductible", classe: "4", type: "actif", nature: "debit", actif: true, parentId: "4", niveau: 2, soldeDebit: 5000 },
  { id: "445700", numero: "445700", intitule: "TVA collectée", classe: "4", type: "passif", nature: "credit", actif: true, parentId: "4", niveau: 2, soldeCredit: 3000 },
  
  // Classe 5 - Trésorerie
  { id: "5", numero: "5", intitule: "Trésorerie", classe: "5", type: "tresorerie", nature: "debit", actif: true, niveau: 1 },
  { id: "512000", numero: "512000", intitule: "Banque principale", classe: "5", type: "tresorerie", nature: "debit", actif: true, parentId: "5", niveau: 2, soldeDebit: 185320 },
  { id: "531000", numero: "531000", intitule: "Caisse", classe: "5", type: "tresorerie", nature: "debit", actif: true, parentId: "5", niveau: 2, soldeDebit: 12500 },
  
  // Classe 6 - Charges
  { id: "6", numero: "6", intitule: "Charges", classe: "6", type: "charge", nature: "debit", actif: true, niveau: 1 },
  { id: "601000", numero: "601000", intitule: "Achats de marchandises", classe: "6", type: "charge", nature: "debit", actif: true, parentId: "6", niveau: 2, soldeDebit: 50000 },
  { id: "611000", numero: "611000", intitule: "Achats de matières premières", classe: "6", type: "charge", nature: "debit", actif: true, parentId: "6", niveau: 2, soldeDebit: 30000 },
  { id: "641000", numero: "641000", intitule: "Salaires", classe: "6", type: "charge", nature: "debit", actif: true, parentId: "6", niveau: 2, soldeDebit: 80000 },
  
  // Classe 7 - Produits
  { id: "7", numero: "7", intitule: "Produits", classe: "7", type: "produit", nature: "credit", actif: true, niveau: 1 },
  { id: "701000", numero: "701000", intitule: "Ventes de marchandises", classe: "7", type: "produit", nature: "credit", actif: true, parentId: "7", niveau: 2, soldeCredit: 150000 },
  { id: "707000", numero: "707000", intitule: "Ventes de produits finis", classe: "7", type: "produit", nature: "credit", actif: true, parentId: "7", niveau: 2, soldeCredit: 200000 },
];

const classLabels: Record<string, string> = {
  "1": "Capitaux",
  "2": "Immobilisations",
  "3": "Stocks",
  "4": "Tiers",
  "5": "Trésorerie",
  "6": "Charges",
  "7": "Produits",
};

const typeLabels: Record<string, string> = {
  actif: "Actif",
  passif: "Passif",
  charge: "Charge",
  produit: "Produit",
  tresorerie: "Trésorerie",
};

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set(["1", "2", "3", "4", "5", "6", "7"]));
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);

  // Form state
  const [formData, setFormData] = useState<Partial<Account>>({
    numero: "",
    intitule: "",
    classe: "",
    type: "charge",
    nature: "debit",
    actif: true,
    niveau: 2,
  });

  const toggleClass = (classe: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classe)) {
      newExpanded.delete(classe);
    } else {
      newExpanded.add(classe);
    }
    setExpandedClasses(newExpanded);
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.intitule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || account.classe === classFilter;
    const matchesType = typeFilter === "all" || account.type === typeFilter;
    return matchesSearch && matchesClass && matchesType;
  });

  const classes = Array.from(new Set(accounts.map(a => a.classe))).sort();

  const handleCreate = () => {
    setFormData({
      numero: "",
      intitule: "",
      classe: "",
      type: "charge",
      nature: "debit",
      actif: true,
      niveau: 2,
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setFormData(account);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (isCreateModalOpen) {
      const newAccount: Account = {
        id: Date.now().toString(),
        numero: formData.numero || "",
        intitule: formData.intitule || "",
        classe: formData.classe || "",
        type: formData.type || "charge",
        nature: formData.nature || "debit",
        actif: formData.actif ?? true,
        niveau: formData.niveau || 2,
        parentId: formData.parentId,
      };
      setAccounts([...accounts, newAccount]);
      setIsCreateModalOpen(false);
    } else if (isEditModalOpen && selectedAccount) {
      setAccounts(accounts.map(a => 
        a.id === selectedAccount.id ? { ...a, ...formData } : a
      ));
      setIsEditModalOpen(false);
      setSelectedAccount(null);
    }
    setFormData({
      numero: "",
      intitule: "",
      classe: "",
      type: "charge",
      nature: "debit",
      actif: true,
      niveau: 2,
    });
  };

  const groupedAccounts = classes.map(classe => {
    const classAccounts = filteredAccounts.filter(a => a.classe === classe);
    const parentAccount = classAccounts.find(a => a.niveau === 1);
    const childAccounts = classAccounts.filter(a => a.niveau > 1);
    return { classe, parentAccount, childAccounts };
  });

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page permet de gérer le plan comptable. Aucune écriture n'est générée depuis cette page.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total comptes</p>
                  <p className="text-2xl font-bold mt-1">{accounts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold mt-1">{classes.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comptes actifs</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {accounts.filter(a => a.actif).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <BookOpen className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comptes inactifs</p>
                  <p className="text-2xl font-bold mt-1 text-muted-foreground">
                    {accounts.filter(a => !a.actif).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
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
                placeholder="Rechercher par numéro ou intitulé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map(classe => (
                  <SelectItem key={classe} value={classe}>
                    Classe {classe} - {classLabels[classe] || classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="passif">Passif</SelectItem>
                <SelectItem value="charge">Charge</SelectItem>
                <SelectItem value="produit">Produit</SelectItem>
                <SelectItem value="tresorerie">Trésorerie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Importer
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau compte
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-12"></TableHead>
                    <TableHead className="font-semibold">Numéro</TableHead>
                    <TableHead className="font-semibold">Intitulé</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Nature</TableHead>
                    <TableHead className="text-right font-semibold">Solde Débit</TableHead>
                    <TableHead className="text-right font-semibold">Solde Crédit</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedAccounts.map(({ classe, parentAccount, childAccounts }) => {
                    const isExpanded = expandedClasses.has(classe);
                    return (
                      <>
                        {parentAccount && (
                          <TableRow 
                            key={parentAccount.id} 
                            className="bg-muted/30 hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleClass(classe)}
                          >
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleClass(classe);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-bold">{parentAccount.numero}</TableCell>
                            <TableCell className="font-bold">{parentAccount.intitule}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Classe {classe}</Badge>
                            </TableCell>
                            <TableCell>{typeLabels[parentAccount.type]}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{parentAccount.nature === "debit" ? "Débit" : "Crédit"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-xs",
                                parentAccount.actif ? "bg-success/10 text-success border-0" : "bg-muted/10 text-muted-foreground border-0"
                              )}>
                                {parentAccount.actif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}
                        {isExpanded && childAccounts.map((account) => (
                          <TableRow key={account.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell></TableCell>
                            <TableCell className="font-medium pl-8">{account.numero}</TableCell>
                            <TableCell className="pl-8">{account.intitule}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Classe {account.classe}</Badge>
                            </TableCell>
                            <TableCell>{typeLabels[account.type]}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{account.nature === "debit" ? "Débit" : "Crédit"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {account.soldeDebit ? account.soldeDebit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.soldeCredit ? account.soldeCredit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-xs",
                                account.actif ? "bg-success/10 text-success border-0" : "bg-muted/10 text-muted-foreground border-0"
                              )}>
                                {account.actif ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(account)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal pour créer un compte */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: 411"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classe">Classe *</Label>
                <Select
                  value={formData.classe}
                  onValueChange={(value) => setFormData({ ...formData, classe: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classe => (
                      <SelectItem key={classe} value={classe}>
                        Classe {classe} - {classLabels[classe] || classe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="intitule">Intitulé *</Label>
                <Input
                  id="intitule"
                  value={formData.intitule}
                  onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                  placeholder="Ex: Clients"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => {
                    setFormData({ 
                      ...formData, 
                      type: value,
                      nature: (value === "actif" || value === "charge" || value === "tresorerie") ? "debit" : "credit"
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="passif">Passif</SelectItem>
                    <SelectItem value="charge">Charge</SelectItem>
                    <SelectItem value="produit">Produit</SelectItem>
                    <SelectItem value="tresorerie">Trésorerie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nature">Nature *</Label>
                <Select
                  value={formData.nature}
                  onValueChange={(value: any) => setFormData({ ...formData, nature: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Débit</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.numero || !formData.intitule || !formData.classe}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour éditer un compte */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-numero">Numéro *</Label>
                <Input
                  id="edit-numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-classe">Classe *</Label>
                <Select
                  value={formData.classe}
                  onValueChange={(value) => setFormData({ ...formData, classe: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classe => (
                      <SelectItem key={classe} value={classe}>
                        Classe {classe} - {classLabels[classe] || classe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-intitule">Intitulé *</Label>
                <Input
                  id="edit-intitule"
                  value={formData.intitule}
                  onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="passif">Passif</SelectItem>
                    <SelectItem value="charge">Charge</SelectItem>
                    <SelectItem value="produit">Produit</SelectItem>
                    <SelectItem value="tresorerie">Trésorerie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nature">Nature *</Label>
                <Select
                  value={formData.nature}
                  onValueChange={(value: any) => setFormData({ ...formData, nature: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Débit</SelectItem>
                    <SelectItem value="credit">Crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-actif">Statut</Label>
                <Select
                  value={formData.actif ? "active" : "inactive"}
                  onValueChange={(value) => setFormData({ ...formData, actif: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.numero || !formData.intitule || !formData.classe}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      </div>
  );
}
