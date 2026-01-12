import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Wallet,
  Building,
  Banknote,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account, Transaction } from "@/types/database";

const mockAccounts: Account[] = [
  { id: "1", name: "Compte principal", type: "bank", balance: 185320, company_id: "1" },
  { id: "2", name: "Caisse", type: "cash", balance: 12500, company_id: "1" },
  { id: "3", name: "Épargne", type: "savings", balance: 75000, company_id: "1" },
];

const mockTransactions: Transaction[] = [
  { id: "1", account_id: "1", type: "income", amount: 15000, category: "Ventes", date: "2024-01-12", description: "Facture FAC-2024-001" },
  { id: "2", account_id: "1", type: "expense", amount: 3500, category: "Fournitures", date: "2024-01-11", description: "Achat matériel bureau" },
  { id: "3", account_id: "2", type: "income", amount: 2500, category: "Ventes", date: "2024-01-10", description: "Paiement espèces" },
  { id: "4", account_id: "1", type: "expense", amount: 8000, category: "Salaires", date: "2024-01-05", description: "Paie janvier" },
  { id: "5", account_id: "1", type: "income", amount: 22000, category: "Ventes", date: "2024-01-03", description: "Facture FAC-2023-089" },
];

const accountIcons = {
  bank: Building,
  cash: Banknote,
  savings: Wallet,
};

export default function Treasury() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const filteredTransactions = selectedAccount === "all" 
    ? mockTransactions 
    : mockTransactions.filter(t => t.account_id === selectedAccount);

  return (
    <MainLayout
      title="Trésorerie"
      subtitle="Gérez vos comptes et transactions"
    >
      <div className="space-y-6">
        {/* Accounts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Balance Card */}
          <div className="erp-stat-card md:col-span-1 gradient-primary text-primary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Solde total</span>
            </div>
            <p className="text-3xl font-bold">{totalBalance.toLocaleString()} MAD</p>
          </div>

          {/* Individual Accounts */}
          {mockAccounts.map((account) => {
            const Icon = accountIcons[account.type];
            return (
              <div key={account.id} className="erp-stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{account.name}</p>
                <p className="text-xl font-bold">{account.balance.toLocaleString()} MAD</p>
              </div>
            );
          })}
        </div>

        {/* Transactions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les comptes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {mockAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Entrée
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle entrée</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Compte</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Montant (MAD)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Input placeholder="ex: Ventes" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Description de la transaction" />
                  </div>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Sortie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle sortie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Compte</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Montant (MAD)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Input placeholder="ex: Fournitures" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Description de la transaction" />
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions List */}
        <div className="erp-card animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Transactions récentes</h3>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const account = mockAccounts.find(a => a.id === transaction.account_id);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        transaction.type === "income"
                          ? "bg-success/10"
                          : "bg-accent/10"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="w-5 h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {account?.name} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        transaction.type === "income"
                          ? "text-success"
                          : "text-accent"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.amount.toLocaleString()} MAD
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
