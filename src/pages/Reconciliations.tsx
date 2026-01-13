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
  Search, 
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  Link as LinkIcon,
  Unlink
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ERPTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'entree' | 'sortie';
  documentNumber?: string;
  documentType?: string;
  reconciled: boolean;
  reconciliationId?: string;
}

interface BankStatement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
  reconciled: boolean;
  reconciliationId?: string;
}

interface Reconciliation {
  id: string;
  erpTransactionId: string;
  bankStatementId: string;
  date: string;
  status: 'matched' | 'discrepancy';
  discrepancy?: number;
}

// Mock data
const mockAccounts = [
  { id: "1", nom: "Compte principal", banque: "Banque Populaire" },
  { id: "2", nom: "Caisse", banque: "" },
];

const mockERPTransactions: ERPTransaction[] = [
  {
    id: "ERP-1",
    date: "2024-01-12",
    description: "Facture client FAC-2024-001",
    amount: 15000,
    type: "entree",
    documentNumber: "FAC-2024-001",
    documentType: "Facture",
    reconciled: true,
    reconciliationId: "REC-1",
  },
  {
    id: "ERP-2",
    date: "2024-01-11",
    description: "Facture fournisseur FAC-FOUR-2024-001",
    amount: 15000,
    type: "sortie",
    documentNumber: "FAC-FOUR-2024-001",
    documentType: "Facture fournisseur",
    reconciled: false,
  },
  {
    id: "ERP-3",
    date: "2024-01-10",
    description: "Paiement espèces",
    amount: 2500,
    type: "entree",
    reconciled: false,
  },
  {
    id: "ERP-4",
    date: "2024-01-05",
    description: "Paie janvier",
    amount: 8000,
    type: "sortie",
    reconciled: true,
    reconciliationId: "REC-2",
  },
  {
    id: "ERP-5",
    date: "2024-01-03",
    description: "Facture client FAC-2023-089",
    amount: 22000,
    type: "entree",
    documentNumber: "FAC-2023-089",
    documentType: "Facture",
    reconciled: false,
  },
];

const mockBankStatements: BankStatement[] = [
  {
    id: "BANK-1",
    date: "2024-01-12",
    description: "VIREMENT RECU - FACTURE FAC-2024-001",
    amount: 15000,
    type: "credit",
    reference: "VIR-2024-001",
    reconciled: true,
    reconciliationId: "REC-1",
  },
  {
    id: "BANK-2",
    date: "2024-01-11",
    description: "VIREMENT EMIS - FOURNISSEUR ALPHA",
    amount: 15000,
    type: "debit",
    reference: "VIR-2024-002",
    reconciled: true,
    reconciliationId: "REC-1",
  },
  {
    id: "BANK-3",
    date: "2024-01-05",
    description: "PRELEVEMENT - SALAIRES JANVIER",
    amount: 8000,
    type: "debit",
    reference: "PRE-2024-001",
    reconciled: true,
    reconciliationId: "REC-2",
  },
  {
    id: "BANK-4",
    date: "2024-01-15",
    description: "FRAIS BANCAIRES",
    amount: 50,
    type: "debit",
    reference: "FRAIS-001",
    reconciled: false,
  },
  {
    id: "BANK-5",
    date: "2024-01-14",
    description: "VIREMENT RECU - CLIENT BETA",
    amount: 8500,
    type: "credit",
    reference: "VIR-2024-003",
    reconciled: false,
  },
];

const mockReconciliations: Reconciliation[] = [
  {
    id: "REC-1",
    erpTransactionId: "ERP-1",
    bankStatementId: "BANK-1",
    date: "2024-01-12",
    status: "matched",
  },
  {
    id: "REC-2",
    erpTransactionId: "ERP-4",
    bankStatementId: "BANK-3",
    date: "2024-01-05",
    status: "matched",
  },
];

export default function Reconciliations() {
  const [selectedAccount, setSelectedAccount] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "unreconciled" | "reconciled">("unreconciled");
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>(mockReconciliations);
  const [erpTransactions, setErpTransactions] = useState<ERPTransaction[]>(mockERPTransactions);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(mockBankStatements);

  const filteredERPTransactions = erpTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = viewMode === "all" || 
      (viewMode === "unreconciled" && !t.reconciled) ||
      (viewMode === "reconciled" && t.reconciled);
    return matchesSearch && matchesView;
  });

  const filteredBankStatements = bankStatements.filter(s => {
    const matchesSearch = s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = viewMode === "all" || 
      (viewMode === "unreconciled" && !s.reconciled) ||
      (viewMode === "reconciled" && s.reconciled);
    return matchesSearch && matchesView;
  });

  const unreconciledERP = erpTransactions.filter(t => !t.reconciled).length;
  const unreconciledBank = bankStatements.filter(s => !s.reconciled).length;
  const totalReconciled = reconciliations.length;

  const handleReconcile = (erpId: string, bankId: string) => {
    const erpTrans = erpTransactions.find(t => t.id === erpId);
    const bankStmt = bankStatements.find(s => s.id === bankId);
    
    if (!erpTrans || !bankStmt) return;

    const discrepancy = Math.abs(erpTrans.amount - bankStmt.amount);
    const newReconciliation: Reconciliation = {
      id: `REC-${Date.now()}`,
      erpTransactionId: erpId,
      bankStatementId: bankId,
      date: new Date().toISOString().split('T')[0],
      status: discrepancy === 0 ? "matched" : "discrepancy",
      discrepancy: discrepancy > 0 ? discrepancy : undefined,
    };

    setReconciliations([...reconciliations, newReconciliation]);
    setErpTransactions(erpTransactions.map(t => 
      t.id === erpId ? { ...t, reconciled: true, reconciliationId: newReconciliation.id } : t
    ));
    setBankStatements(bankStatements.map(s => 
      s.id === bankId ? { ...s, reconciled: true, reconciliationId: newReconciliation.id } : s
    ));
  };

  const handleUnreconcile = (reconciliationId: string) => {
    const reconciliation = reconciliations.find(r => r.id === reconciliationId);
    if (!reconciliation) return;

    setReconciliations(reconciliations.filter(r => r.id !== reconciliationId));
    setErpTransactions(erpTransactions.map(t => 
      t.reconciliationId === reconciliationId ? { ...t, reconciled: false, reconciliationId: undefined } : t
    ));
    setBankStatements(bankStatements.map(s => 
      s.reconciliationId === reconciliationId ? { ...s, reconciled: false, reconciliationId: undefined } : s
    ));
  };

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page permet de comparer les transactions enregistrées dans l'ERP avec les relevés bancaires et d'associer les mouvements correspondants.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Non rapprochés ERP</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {unreconciledERP}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Non rapprochés banque</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {unreconciledBank}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rapprochés</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {totalReconciled}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compte</p>
                  <p className="text-lg font-bold mt-1">
                    {mockAccounts.find(a => a.id === selectedAccount)?.nom || "Sélectionner"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Compte" />
            </SelectTrigger>
            <SelectContent>
              {mockAccounts.map(account => (
                <SelectItem key={account.id} value={account.id}>{account.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unreconciled">Non rapprochés</SelectItem>
              <SelectItem value="reconciled">Rapprochés</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importer relevé
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ERP Transactions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Transactions ERP</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredERPTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucune transaction
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredERPTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>{new Date(transaction.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{transaction.description}</div>
                              {transaction.documentNumber && (
                                <div className="text-xs text-muted-foreground">{transaction.documentNumber}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            transaction.type === "entree" ? "text-success" : "text-destructive"
                          )}>
                            {transaction.type === "entree" ? '+' : '-'}
                            {transaction.amount.toLocaleString()} MAD
                          </TableCell>
                          <TableCell>
                            {transaction.reconciled ? (
                              <Badge className="bg-success/10 text-success border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Rapproché
                              </Badge>
                            ) : (
                              <Badge variant="outline">Non rapproché</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Bank Statements */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Relevé bancaire</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBankStatements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucun mouvement
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBankStatements.map((statement) => (
                        <TableRow key={statement.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>{new Date(statement.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{statement.description}</div>
                              {statement.reference && (
                                <div className="text-xs text-muted-foreground">{statement.reference}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            statement.type === "credit" ? "text-success" : "text-destructive"
                          )}>
                            {statement.type === "credit" ? '+' : '-'}
                            {statement.amount.toLocaleString()} MAD
                          </TableCell>
                          <TableCell>
                            {statement.reconciled ? (
                              <Badge className="bg-success/10 text-success border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Rapproché
                              </Badge>
                            ) : (
                              <Badge variant="outline">Non rapproché</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reconciliations List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Rapprochements effectués</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Transaction ERP</TableHead>
                    <TableHead className="font-semibold">Mouvement banque</TableHead>
                    <TableHead className="text-right font-semibold">Montant ERP</TableHead>
                    <TableHead className="text-right font-semibold">Montant banque</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun rapprochement effectué
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciliations.map((reconciliation) => {
                      const erpTrans = erpTransactions.find(t => t.id === reconciliation.erpTransactionId);
                      const bankStmt = bankStatements.find(s => s.id === reconciliation.bankStatementId);
                      
                      return (
                        <TableRow key={reconciliation.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>{new Date(reconciliation.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div className="text-sm">{erpTrans?.description}</div>
                            <div className="text-xs text-muted-foreground">{erpTrans?.documentNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bankStmt?.description}</div>
                            <div className="text-xs text-muted-foreground">{bankStmt?.reference}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            {erpTrans?.amount.toLocaleString()} MAD
                          </TableCell>
                          <TableCell className="text-right">
                            {bankStmt?.amount.toLocaleString()} MAD
                          </TableCell>
                          <TableCell>
                            {reconciliation.status === "matched" ? (
                              <Badge className="bg-success/10 text-success border-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Correspondance
                              </Badge>
                            ) : (
                              <Badge className="bg-warning/10 text-warning border-0">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Écart: {reconciliation.discrepancy?.toLocaleString()} MAD
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnreconcile(reconciliation.id)}
                              className="gap-2"
                            >
                              <Unlink className="w-4 h-4" />
                              Dissocier
                            </Button>
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

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pour rapprocher une transaction ERP avec un mouvement bancaire, sélectionnez les deux lignes correspondantes et utilisez le bouton "Rapprocher".
            Les montants doivent correspondre pour un rapprochement automatique.
          </AlertDescription>
        </Alert>
      </div>
  );
}
