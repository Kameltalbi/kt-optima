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
  DialogFooter,
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
  Building,
  Banknote,
  Wallet,
  Edit,
  Trash2,
} from "lucide-react";
import { useFinance, type FinanceAccount, type CreateAccountData } from "@/hooks/use-finance";

export default function Comptes() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount, fetchAccounts, formatCurrency } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<FinanceAccount | null>(null);
  const [formData, setFormData] = useState<CreateAccountData>({
    name: "",
    type: "bank",
    account_number: "",
    bank_name: "",
    iban: "",
    bic: "",
    balance: 0,
  });

  const handleCreate = async () => {
    try {
      await createAccount(formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        type: "bank",
        account_number: "",
        bank_name: "",
        iban: "",
        bic: "",
        balance: 0,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = async () => {
    if (!selectedAccount) return;
    try {
      await updateAccount(selectedAccount.id, formData);
      setIsEditModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      try {
        await deleteAccount(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const openEditModal = (account: FinanceAccount) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      account_number: account.account_number || "",
      bank_name: account.bank_name || "",
      iban: account.iban || "",
      bic: account.bic || "",
      balance: account.balance,
    });
    setIsEditModalOpen(true);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "bank":
        return "Banque";
      case "cash":
        return "Caisse";
      case "savings":
        return "Épargne";
      default:
        return type;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "savings":
        return <Wallet className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Comptes</h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos comptes bancaires et caisse
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau compte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du compte *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Compte principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "bank" | "cash" | "savings") =>
                    setFormData({ ...formData, type: value })
                  }
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
              {formData.type === "bank" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Nom de la banque</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="Ex: Banque Populaire"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Numéro de compte</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="Ex: 1234567890123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="Ex: MA64 1234 5678 9012 3456 7890 123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bic">BIC/SWIFT</Label>
                    <Input
                      id="bic"
                      value={formData.bic}
                      onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                      placeholder="Ex: BPMAMAMC"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="balance">Solde initial</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total trésorerie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre de comptes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {accounts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comptes actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {accounts.filter((a) => a.active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des comptes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun compte enregistré
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead>Numéro de compte</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getAccountTypeIcon(account.type)}
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.bank_name || "-"}</TableCell>
                    <TableCell>{account.account_number || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du compte *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "bank" | "cash" | "savings") =>
                  setFormData({ ...formData, type: value })
                }
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
            {formData.type === "bank" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-bank_name">Nom de la banque</Label>
                  <Input
                    id="edit-bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-account_number">Numéro de compte</Label>
                  <Input
                    id="edit-account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
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
                  <Label htmlFor="edit-bic">BIC/SWIFT</Label>
                  <Input
                    id="edit-bic"
                    value={formData.bic}
                    onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
