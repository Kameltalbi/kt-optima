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
import { 
  Plus, 
  Search, 
  Building,
  Banknote,
  Wallet,
  Edit,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface BankAccount {
  id: string;
  nom: string;
  type: 'bank' | 'cash' | 'savings';
  banque?: string;
  numeroCompte?: string;
  iban?: string;
  swift?: string;
  solde: number;
  soldeInitial: number;
  actif: boolean;
  description?: string;
  dernierMouvement?: string;
}

// Mock data
const mockAccounts: BankAccount[] = [
  {
    id: "1",
    nom: "Compte principal",
    type: "bank",
    banque: "Banque Populaire",
    numeroCompte: "1234567890123456",
    iban: "MA64 1234 5678 9012 3456 7890 123",
    swift: "BPMAMAMC",
    solde: 185320,
    soldeInitial: 150000,
    actif: true,
    description: "Compte courant principal",
    dernierMouvement: "2024-01-15",
  },
  {
    id: "2",
    nom: "Caisse",
    type: "cash",
    solde: 12500,
    soldeInitial: 10000,
    actif: true,
    description: "Caisse principale",
    dernierMouvement: "2024-01-14",
  },
  {
    id: "3",
    nom: "Épargne",
    type: "savings",
    banque: "Attijariwafa Bank",
    numeroCompte: "9876543210987654",
    iban: "MA64 9876 5432 1098 7654 3210 987",
    swift: "BCMAMAMC",
    solde: 75000,
    soldeInitial: 70000,
    actif: true,
    description: "Compte épargne",
    dernierMouvement: "2024-01-10",
  },
  {
    id: "4",
    nom: "Ancien compte",
    type: "bank",
    banque: "BMCE",
    numeroCompte: "1111111111111111",
    solde: 0,
    soldeInitial: 0,
    actif: false,
    description: "Compte fermé",
  },
];

const accountIcons = {
  bank: Building,
  cash: Banknote,
  savings: Wallet,
};

const typeLabels = {
  bank: "Banque",
  cash: "Caisse",
  savings: "Épargne",
};

export default function Banks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>(mockAccounts);

  // Form state
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    nom: "",
    type: "bank",
    banque: "",
    numeroCompte: "",
    iban: "",
    swift: "",
    solde: 0,
    soldeInitial: 0,
    actif: true,
    description: "",
  });

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.banque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.numeroCompte?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || account.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && account.actif) ||
      (statusFilter === "inactive" && !account.actif);
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeAccounts = accounts.filter(a => a.actif);
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.solde, 0);
  const totalInitial = activeAccounts.reduce((sum, acc) => sum + acc.soldeInitial, 0);

  const handleCreate = () => {
    setFormData({
      nom: "",
      type: "bank",
      banque: "",
      numeroCompte: "",
      iban: "",
      swift: "",
      solde: 0,
      soldeInitial: 0,
      actif: true,
      description: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormData(account);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (isCreateModalOpen) {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        nom: formData.nom || "",
        type: formData.type || "bank",
        banque: formData.banque,
        numeroCompte: formData.numeroCompte,
        iban: formData.iban,
        swift: formData.swift,
        solde: formData.solde || 0,
        soldeInitial: formData.soldeInitial || 0,
        actif: formData.actif ?? true,
        description: formData.description,
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
      nom: "",
      type: "bank",
      banque: "",
      numeroCompte: "",
      iban: "",
      swift: "",
      solde: 0,
      soldeInitial: 0,
      actif: true,
      description: "",
    });
  };

  const handleToggleStatus = (account: BankAccount) => {
    setAccounts(accounts.map(a => 
      a.id === account.id ? { ...a, actif: !a.actif } : a
    ));
  };

  return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total comptes</p>
                  <p className="text-2xl font-bold mt-1">{accounts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde total</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {totalBalance.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde initial</p>
                  <p className="text-2xl font-bold mt-1 text-muted-foreground">
                    {totalInitial.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Wallet className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Variation</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    totalBalance >= totalInitial ? "text-success" : "text-destructive"
                  )}>
                    {totalBalance >= totalInitial ? '+' : ''}
                    {(totalBalance - totalInitial).toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-info/10">
                  <TrendingDown className="w-5 h-5 text-info" />
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
                placeholder="Rechercher par nom, banque ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="bank">Banque</SelectItem>
                <SelectItem value="cash">Caisse</SelectItem>
                <SelectItem value="savings">Épargne</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau compte
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nom</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Banque</TableHead>
                    <TableHead className="font-semibold">Numéro compte</TableHead>
                    <TableHead className="font-semibold">IBAN</TableHead>
                    <TableHead className="text-right font-semibold">Solde</TableHead>
                    <TableHead className="text-right font-semibold">Solde initial</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun compte trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => {
                      const Icon = accountIcons[account.type];
                      return (
                        <TableRow key={account.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{account.nom}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{typeLabels[account.type]}</Badge>
                          </TableCell>
                          <TableCell>{account.banque || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{account.numeroCompte || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{account.iban || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {account.solde.toLocaleString()} MAD
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {account.soldeInitial.toLocaleString()} MAD
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleToggleStatus(account)}
                              >
                                {account.actif ? (
                                  <XCircle className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-success" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
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
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Compte principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Banque</SelectItem>
                    <SelectItem value="cash">Caisse</SelectItem>
                    <SelectItem value="savings">Épargne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "bank" || formData.type === "savings" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="banque">Banque</Label>
                    <Input
                      id="banque"
                      value={formData.banque}
                      onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
                      placeholder="Ex: Banque Populaire"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroCompte">Numéro de compte</Label>
                    <Input
                      id="numeroCompte"
                      value={formData.numeroCompte}
                      onChange={(e) => setFormData({ ...formData, numeroCompte: e.target.value })}
                      placeholder="1234567890123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="MA64 XXXX XXXX XXXX XXXX XXXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swift">SWIFT/BIC</Label>
                    <Input
                      id="swift"
                      value={formData.swift}
                      onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                      placeholder="BPMAMAMC"
                    />
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="soldeInitial">Solde initial (MAD)</Label>
                <Input
                  id="soldeInitial"
                  type="number"
                  value={formData.soldeInitial || 0}
                  onChange={(e) => setFormData({ ...formData, soldeInitial: parseFloat(e.target.value) || 0, solde: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du compte..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.nom || !formData.type}
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
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
                    <SelectItem value="bank">Banque</SelectItem>
                    <SelectItem value="cash">Caisse</SelectItem>
                    <SelectItem value="savings">Épargne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "bank" || formData.type === "savings" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-banque">Banque</Label>
                    <Input
                      id="edit-banque"
                      value={formData.banque}
                      onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-numeroCompte">Numéro de compte</Label>
                    <Input
                      id="edit-numeroCompte"
                      value={formData.numeroCompte}
                      onChange={(e) => setFormData({ ...formData, numeroCompte: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-iban">IBAN</Label>
                    <Input
                      id="edit-iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-swift">SWIFT/BIC</Label>
                    <Input
                      id="edit-swift"
                      value={formData.swift}
                      onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                    />
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="edit-soldeInitial">Solde initial (MAD)</Label>
                <Input
                  id="edit-soldeInitial"
                  type="number"
                  value={formData.soldeInitial || 0}
                  onChange={(e) => setFormData({ ...formData, soldeInitial: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
                disabled={!formData.nom || !formData.type}
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
