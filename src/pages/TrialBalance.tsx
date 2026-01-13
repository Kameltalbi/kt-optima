import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Scale,
  Download,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface BalanceAccount {
  compteNumero: string;
  compteIntitule: string;
  soldeDebit: number;
  soldeCredit: number;
  classe: string;
}

// Mock data
const mockBalance: BalanceAccount[] = [
  // Classe 1 - Financement permanent
  { compteNumero: "11", compteIntitule: "Capital", soldeDebit: 0, soldeCredit: 100000, classe: "1" },
  { compteNumero: "12", compteIntitule: "Réserves", soldeDebit: 0, soldeCredit: 50000, classe: "1" },
  
  // Classe 2 - Actif immobilisé
  { compteNumero: "21", compteIntitule: "Immobilisations incorporelles", soldeDebit: 20000, soldeCredit: 0, classe: "2" },
  { compteNumero: "22", compteIntitule: "Immobilisations corporelles", soldeDebit: 150000, soldeCredit: 0, classe: "2" },
  
  // Classe 3 - Stocks
  { compteNumero: "31", compteIntitule: "Matières premières", soldeDebit: 45000, soldeCredit: 0, classe: "3" },
  { compteNumero: "35", compteIntitule: "Produits finis", soldeDebit: 893900, soldeCredit: 0, classe: "3" },
  
  // Classe 4 - Tiers
  { compteNumero: "411", compteIntitule: "Clients", soldeDebit: 50000, soldeCredit: 0, classe: "4" },
  { compteNumero: "401", compteIntitule: "Fournisseurs", soldeDebit: 0, soldeCredit: 45000, classe: "4" },
  
  // Classe 5 - Trésorerie
  { compteNumero: "512", compteIntitule: "Banques", soldeDebit: 185320, soldeCredit: 0, classe: "5" },
  { compteNumero: "531", compteIntitule: "Caisse", soldeDebit: 12500, soldeCredit: 0, classe: "5" },
  
  // Classe 6 - Charges
  { compteNumero: "601", compteIntitule: "Achats de marchandises", soldeDebit: 52500, soldeCredit: 0, classe: "6" },
  { compteNumero: "611", compteIntitule: "Achats de matières premières", soldeDebit: 30000, soldeCredit: 0, classe: "6" },
  { compteNumero: "641", compteIntitule: "Salaires", soldeDebit: 80000, soldeCredit: 0, classe: "6" },
  
  // Classe 7 - Produits
  { compteNumero: "701", compteIntitule: "Ventes de marchandises", soldeDebit: 0, soldeCredit: 112500, classe: "7" },
  { compteNumero: "707", compteIntitule: "Ventes de produits finis", soldeDebit: 0, soldeCredit: 200000, classe: "7" },
];

const classLabels: Record<string, string> = {
  "1": "Financement permanent",
  "2": "Actif immobilisé",
  "3": "Stocks",
  "4": "Tiers",
  "5": "Trésorerie",
  "6": "Charges",
  "7": "Produits",
};

export default function TrialBalance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [balanceDate, setBalanceDate] = useState("2024-01-31");

  const filteredBalance = mockBalance.filter((account) => {
    const matchesSearch = account.compteNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.compteIntitule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || account.classe === classFilter;
    return matchesSearch && matchesClass;
  });

  const totalDebit = filteredBalance.reduce((sum, acc) => sum + acc.soldeDebit, 0);
  const totalCredit = filteredBalance.reduce((sum, acc) => sum + acc.soldeCredit, 0);
  const equilibre = totalDebit === totalCredit;
  const ecart = Math.abs(totalDebit - totalCredit);

  const groupedByClass = filteredBalance.reduce((acc, account) => {
    if (!acc[account.classe]) {
      acc[account.classe] = [];
    }
    acc[account.classe].push(account);
    return acc;
  }, {} as Record<string, BalanceAccount[]>);

  const classes = Object.keys(groupedByClass).sort();

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page affiche la balance comptable. Les données sont en lecture seule.
          </AlertDescription>
        </Alert>

        {/* Balance Date & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">Date de balance:</Label>
            <Input
              type="date"
              value={balanceDate}
              onChange={(e) => setBalanceDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou intitulé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-48">
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
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Débit</p>
                  <p className="text-2xl font-bold mt-1">
                    {totalDebit.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Crédit</p>
                  <p className="text-2xl font-bold mt-1">
                    {totalCredit.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Scale className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-border/50",
            equilibre ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Équilibre</p>
                  <div className="flex items-center gap-2 mt-1">
                    {equilibre ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-success" />
                        <p className="text-xl font-bold text-success">Équilibrée</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-destructive" />
                        <p className="text-xl font-bold text-destructive">Écart: {ecart.toLocaleString()} MAD</p>
                      </>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-lg",
                  equilibre ? "bg-success/10" : "bg-destructive/10"
                )}>
                  {equilibre ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!equilibre && (
          <Alert className="bg-destructive/5 border-destructive/20">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm text-destructive font-medium">
              La balance n'est pas équilibrée. Il y a un écart de {ecart.toLocaleString()} MAD entre le total débit et le total crédit.
            </AlertDescription>
          </Alert>
        )}

        {/* Balance Table by Class */}
        <div className="space-y-6">
          {classes.map((classe) => {
            const classAccounts = groupedByClass[classe];
            const classTotalDebit = classAccounts.reduce((sum, acc) => sum + acc.soldeDebit, 0);
            const classTotalCredit = classAccounts.reduce((sum, acc) => sum + acc.soldeCredit, 0);
            
            return (
              <Card key={classe} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Classe {classe} - {classLabels[classe] || classe}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Numéro</TableHead>
                          <TableHead className="font-semibold">Intitulé</TableHead>
                          <TableHead className="text-right font-semibold">Solde Débit</TableHead>
                          <TableHead className="text-right font-semibold">Solde Crédit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classAccounts.map((account) => (
                          <TableRow key={account.compteNumero} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{account.compteNumero}</TableCell>
                            <TableCell>{account.compteIntitule}</TableCell>
                            <TableCell className="text-right">
                              {account.soldeDebit > 0 ? account.soldeDebit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.soldeCredit > 0 ? account.soldeCredit.toLocaleString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total classe */}
                        <TableRow className="bg-primary/5 font-bold">
                          <TableCell colSpan={2}>Total Classe {classe}</TableCell>
                          <TableCell className="text-right text-primary">
                            {classTotalDebit > 0 ? classTotalDebit.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {classTotalCredit > 0 ? classTotalCredit.toLocaleString() : '-'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Total Balance */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Balance au {new Date(balanceDate).toLocaleDateString('fr-FR')}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Débit</p>
                    <p className="text-2xl font-bold">{totalDebit.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Crédit</p>
                    <p className="text-2xl font-bold">{totalCredit.toLocaleString()} MAD</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Écart</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      equilibre ? "text-success" : "text-destructive"
                    )}>
                      {equilibre ? "0" : ecart.toLocaleString()} MAD
                    </p>
                  </div>
                </div>
              </div>
              <div className={cn(
                "p-4 rounded-lg",
                equilibre ? "bg-success/10" : "bg-destructive/10"
              )}>
                {equilibre ? (
                  <CheckCircle className="w-8 h-8 text-success" />
                ) : (
                  <XCircle className="w-8 h-8 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
