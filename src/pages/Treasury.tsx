import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  Building,
  Banknote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Info,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/database";

// Types
interface ForecastEntry {
  date: string;
  type: 'entree' | 'sortie';
  description: string;
  amount: number;
  source: string;
  sourceNumber: string;
}

// Mock data
const mockAccounts: Account[] = [
  { id: "1", name: "Compte principal", type: "bank", balance: 185320, company_id: "1" },
  { id: "2", name: "Caisse", type: "cash", balance: 12500, company_id: "1" },
  { id: "3", name: "Épargne", type: "savings", balance: 75000, company_id: "1" },
];

const mockForecast: ForecastEntry[] = [
  { date: "2024-01-20", type: "entree", description: "Facture client FAC-2024-002", amount: 8500, source: "Ventes", sourceNumber: "FAC-2024-002" },
  { date: "2024-01-22", type: "sortie", description: "Facture fournisseur FAC-FOUR-2024-001", amount: 15000, source: "Achats", sourceNumber: "FAC-FOUR-2024-001" },
  { date: "2024-01-25", type: "entree", description: "Facture client FAC-2024-003", amount: 22300, source: "Ventes", sourceNumber: "FAC-2024-003" },
  { date: "2024-01-28", type: "sortie", description: "Facture fournisseur FAC-FOUR-2024-002", amount: 9600, source: "Achats", sourceNumber: "FAC-FOUR-2024-002" },
  { date: "2024-02-01", type: "entree", description: "Facture client FAC-2024-004", amount: 5200, source: "Ventes", sourceNumber: "FAC-2024-004" },
  { date: "2024-02-05", type: "sortie", description: "Salaires février", amount: 8000, source: "RH", sourceNumber: "PAIE-2024-02" },
  { date: "2024-02-10", type: "entree", description: "Facture client FAC-2024-005", amount: 12800, source: "Ventes", sourceNumber: "FAC-2024-005" },
  { date: "2024-02-15", type: "sortie", description: "Facture fournisseur FAC-FOUR-2024-003", amount: 10800, source: "Achats", sourceNumber: "FAC-FOUR-2024-003" },
];

const accountIcons = {
  bank: Building,
  cash: Banknote,
  savings: Wallet,
};

export default function Treasury() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [forecastDays, setForecastDays] = useState<number>(30);

  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Calculer les entrées et sorties prévues
  const today = new Date();
  const forecastEndDate = new Date();
  forecastEndDate.setDate(today.getDate() + forecastDays);
  
  const upcomingEntries = mockForecast
    .filter(f => {
      const entryDate = new Date(f.date);
      return entryDate >= today && entryDate <= forecastEndDate && f.type === 'entree';
    })
    .reduce((sum, f) => sum + f.amount, 0);
  
  const upcomingExits = mockForecast
    .filter(f => {
      const entryDate = new Date(f.date);
      return entryDate >= today && entryDate <= forecastEndDate && f.type === 'sortie';
    })
    .reduce((sum, f) => sum + f.amount, 0);

  const forecastBalance = totalBalance + upcomingEntries - upcomingExits;

  const filteredForecast = mockForecast
    .filter(f => {
      const entryDate = new Date(f.date);
      return entryDate >= today && entryDate <= forecastEndDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page affiche la situation financière actuelle et les prévisions de trésorerie. Aucune saisie directe n'est autorisée.
          </AlertDescription>
        </Alert>

        {/* Accounts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Balance Card */}
          <Card className="md:col-span-1 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Solde total</span>
              </div>
              <p className="text-3xl font-bold text-primary">{totalBalance.toLocaleString()} MAD</p>
            </CardContent>
          </Card>

          {/* Individual Accounts */}
          {mockAccounts.map((account) => {
            const Icon = accountIcons[account.type];
            return (
              <Card key={account.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{account.name}</p>
                  <p className="text-xl font-bold">{account.balance.toLocaleString()} MAD</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entrées prévues</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {upcomingEntries.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sorties prévues</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {upcomingExits.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <ArrowUpRight className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde prévu</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    forecastBalance >= totalBalance ? "text-success" : "text-warning"
                  )}>
                    {forecastBalance.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
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
                    forecastBalance >= totalBalance ? "text-success" : "text-destructive"
                  )}>
                    {forecastBalance >= totalBalance ? '+' : ''}
                    {(forecastBalance - totalBalance).toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <TrendingDown className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Period Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Prévision sur</span>
            <Select 
              value={forecastDays.toString()} 
              onValueChange={(value) => setForecastDays(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Forecast List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Prévision de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredForecast.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune prévision pour la période sélectionnée
                </p>
              ) : (
                filteredForecast.map((entry, index) => {
                  let runningBalance = totalBalance;
                  for (let i = 0; i < index; i++) {
                    if (filteredForecast[i].type === 'entree') {
                      runningBalance += filteredForecast[i].amount;
                    } else {
                      runningBalance -= filteredForecast[i].amount;
                    }
                  }
                  const newBalance = entry.type === 'entree' 
                    ? runningBalance + entry.amount 
                    : runningBalance - entry.amount;

                  return (
                    <div
                      key={`${entry.date}-${entry.sourceNumber}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            entry.type === "entree"
                              ? "bg-success/10"
                              : "bg-destructive/10"
                          )}
                        >
                          {entry.type === "entree" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.source} • {entry.sourceNumber} • {new Date(entry.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-semibold",
                            entry.type === "entree"
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          {entry.type === "entree" ? "+" : "-"}
                          {entry.amount.toLocaleString()} MAD
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Solde prévu: {newBalance.toLocaleString()} MAD
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
