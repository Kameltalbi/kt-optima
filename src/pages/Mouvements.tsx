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
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { useFinance, type FinanceTransaction, type CreateTransactionData } from "@/hooks/use-finance";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

export default function Mouvements() {
  const { 
    accounts, 
    transactions, 
    loading, 
    createTransaction, 
    deleteTransaction, 
    fetchTransactions,
    formatCurrency
  } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CreateTransactionData>({
    account_id: "",
    type: "income",
    amount: 0,
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleCreate = async () => {
    try {
      await createTransaction(formData);
      setIsCreateModalOpen(false);
      setFormData({
        account_id: "",
        type: "income",
        amount: 0,
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce mouvement ?")) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Entrée";
      case "expense":
        return "Sortie";
      case "transfer":
        return "Transfert";
      default:
        return type;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "expense":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesAccount = selectedAccount === "all" || t.account_id === selectedAccount;
    const matchesSearch = 
      !searchTerm ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAccount && matchesSearch;
  });

  const totalEntrees = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSorties = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const solde = totalEntrees - totalSorties;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mouvements</h2>
          <p className="text-muted-foreground mt-1">
            Enregistrez et suivez vos entrées et sorties de trésorerie
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau mouvement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau mouvement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account_id">Compte *</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense" | "transfer") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrée</SelectItem>
                    <SelectItem value="expense">Sortie</SelectItem>
                    <SelectItem value="transfer">Transfert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Montant *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Ventes, Achats, Salaires..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du mouvement"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!formData.account_id || !formData.amount || !formData.date}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les comptes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total entrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntrees)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total sorties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSorties)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${solde >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(solde)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des mouvements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun mouvement enregistré
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getTransactionTypeIcon(transaction.type)}
                        {getTransactionTypeLabel(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.account?.name || "-"}</TableCell>
                    <TableCell>{transaction.description || "-"}</TableCell>
                    <TableCell>{transaction.category || "-"}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      transaction.type === "income" ? "text-green-600" : 
                      transaction.type === "expense" ? "text-red-600" : 
                      "text-blue-600"
                    }`}>
                      {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
