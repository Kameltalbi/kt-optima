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
  Search, 
  BookOpen,
  Download,
  Info,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface LedgerEntry {
  id: string;
  date: string;
  numeroEcriture: string;
  journal: string;
  libelle: string;
  debit: number;
  credit: number;
  soldeDebit: number;
  soldeCredit: number;
}

interface LedgerAccount {
  compteNumero: string;
  compteIntitule: string;
  soldeInitialDebit: number;
  soldeInitialCredit: number;
  mouvements: LedgerEntry[];
  soldeFinalDebit: number;
  soldeFinalCredit: number;
}

// Mock data
const mockAccounts = [
  { numero: "411", intitule: "Clients" },
  { numero: "401", intitule: "Fournisseurs" },
  { numero: "512", intitule: "Banques" },
  { numero: "701", intitule: "Ventes de marchandises" },
  { numero: "601", intitule: "Achats de marchandises" },
];

const mockLedger: LedgerAccount[] = [
  {
    compteNumero: "411",
    compteIntitule: "Clients",
    soldeInitialDebit: 50000,
    soldeInitialCredit: 0,
    mouvements: [
      {
        id: "1",
        date: "2024-01-12",
        numeroEcriture: "ECR-2024-001",
        journal: "Ventes",
        libelle: "Facture client FAC-2024-001",
        debit: 15000,
        credit: 0,
        soldeDebit: 65000,
        soldeCredit: 0,
      },
      {
        id: "2",
        date: "2024-01-12",
        numeroEcriture: "ECR-2024-003",
        journal: "Banque",
        libelle: "Paiement facture FAC-2024-001",
        debit: 0,
        credit: 15000,
        soldeDebit: 50000,
        soldeCredit: 0,
      },
    ],
    soldeFinalDebit: 50000,
    soldeFinalCredit: 0,
  },
  {
    compteNumero: "512",
    compteIntitule: "Banques",
    soldeInitialDebit: 150000,
    soldeInitialCredit: 0,
    mouvements: [
      {
        id: "3",
        date: "2024-01-12",
        numeroEcriture: "ECR-2024-003",
        journal: "Banque",
        libelle: "Paiement facture FAC-2024-001",
        debit: 15000,
        credit: 0,
        soldeDebit: 165000,
        soldeCredit: 0,
      },
    ],
    soldeFinalDebit: 165000,
    soldeFinalCredit: 0,
  },
  {
    compteNumero: "701",
    compteIntitule: "Ventes de marchandises",
    soldeInitialDebit: 0,
    soldeInitialCredit: 100000,
    mouvements: [
      {
        id: "4",
        date: "2024-01-12",
        numeroEcriture: "ECR-2024-001",
        journal: "Ventes",
        libelle: "Facture client FAC-2024-001",
        debit: 0,
        credit: 12500,
        soldeDebit: 0,
        soldeCredit: 112500,
      },
    ],
    soldeFinalDebit: 0,
    soldeFinalCredit: 112500,
  },
  {
    compteNumero: "401",
    compteIntitule: "Fournisseurs",
    soldeInitialDebit: 0,
    soldeInitialCredit: 30000,
    mouvements: [
      {
        id: "5",
        date: "2024-01-15",
        numeroEcriture: "ECR-2024-002",
        journal: "Achats",
        libelle: "Facture fournisseur FAC-FOUR-2024-001",
        debit: 0,
        credit: 15000,
        soldeDebit: 0,
        soldeCredit: 45000,
      },
    ],
    soldeFinalDebit: 0,
    soldeFinalCredit: 45000,
  },
  {
    compteNumero: "601",
    compteIntitule: "Achats de marchandises",
    soldeInitialDebit: 40000,
    soldeInitialCredit: 0,
    mouvements: [
      {
        id: "6",
        date: "2024-01-15",
        numeroEcriture: "ECR-2024-002",
        journal: "Achats",
        libelle: "Facture fournisseur FAC-FOUR-2024-001",
        debit: 12500,
        credit: 0,
        soldeDebit: 52500,
        soldeCredit: 0,
      },
    ],
    soldeFinalDebit: 52500,
    soldeFinalCredit: 0,
  },
];

export default function GeneralLedger() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-01-31");

  const filteredLedger = mockLedger.filter(account => {
    const matchesSearch = account.compteNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.compteIntitule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = selectedAccount === "all" || account.compteNumero === selectedAccount;
    return matchesSearch && matchesAccount;
  }).map(account => ({
    ...account,
    mouvements: account.mouvements.filter(m => {
      return m.date >= dateFrom && m.date <= dateTo;
    }),
  }));

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page affiche les mouvements comptables par compte. Les données sont en lecture seule.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou intitulé de compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              {mockAccounts.map(account => (
                <SelectItem key={account.numero} value={account.numero}>
                  {account.numero} - {account.intitule}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Date début"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="Date fin"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Ledger by Account */}
        <div className="space-y-6">
          {filteredLedger.map((account) => (
            <Card key={account.compteNumero} className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {account.compteNumero} - {account.compteIntitule}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Période: {new Date(dateFrom).toLocaleDateString('fr-FR')} au {new Date(dateTo).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">N° Écriture</TableHead>
                        <TableHead className="font-semibold">Journal</TableHead>
                        <TableHead className="font-semibold">Libellé</TableHead>
                        <TableHead className="text-right font-semibold">Débit</TableHead>
                        <TableHead className="text-right font-semibold">Crédit</TableHead>
                        <TableHead className="text-right font-semibold">Solde Débit</TableHead>
                        <TableHead className="text-right font-semibold">Solde Crédit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Solde initial */}
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell colSpan={4}>Solde initial</TableCell>
                        <TableCell className="text-right">
                          {account.soldeInitialDebit > 0 ? account.soldeInitialDebit.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {account.soldeInitialCredit > 0 ? account.soldeInitialCredit.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {account.soldeInitialDebit > 0 ? account.soldeInitialDebit.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {account.soldeInitialCredit > 0 ? account.soldeInitialCredit.toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                      
                      {/* Mouvements */}
                      {account.mouvements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                            Aucun mouvement pour cette période
                          </TableCell>
                        </TableRow>
                      ) : (
                        account.mouvements.map((mouvement) => (
                          <TableRow key={mouvement.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell>{new Date(mouvement.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                <span className="font-medium">{mouvement.numeroEcriture}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{mouvement.journal}</Badge>
                            </TableCell>
                            <TableCell>{mouvement.libelle}</TableCell>
                            <TableCell className="text-right">
                              {mouvement.debit > 0 ? mouvement.debit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {mouvement.credit > 0 ? mouvement.credit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {mouvement.soldeDebit > 0 ? mouvement.soldeDebit.toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {mouvement.soldeCredit > 0 ? mouvement.soldeCredit.toLocaleString() : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      
                      {/* Solde final */}
                      <TableRow className="bg-primary/5 font-bold">
                        <TableCell colSpan={4}>Solde final</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right text-primary">
                          {account.soldeFinalDebit > 0 ? account.soldeFinalDebit.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right text-primary">
                          {account.soldeFinalCredit > 0 ? account.soldeFinalCredit.toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLedger.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucun compte trouvé avec les filtres sélectionnés
            </CardContent>
          </Card>
        )}
      </div>
  );
}
