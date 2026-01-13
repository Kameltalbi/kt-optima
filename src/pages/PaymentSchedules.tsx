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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccounting } from "@/hooks/use-accounting";

// Types
interface PaymentSchedule {
  id: string;
  type: 'client' | 'fournisseur';
  documentNumber: string;
  documentType: string;
  clientOrSupplierId: string;
  clientOrSupplierName: string;
  dateEcheance: string;
  montant: number;
  montantPaye: number;
  soldeRestant: number;
  statut: 'pending' | 'paid' | 'overdue';
  dateFacture: string;
  conditionsPaiement: string;
}

// Mock data
const mockPayments: PaymentSchedule[] = [
  {
    id: "1",
    type: "client",
    documentNumber: "FAC-2024-002",
    documentType: "Facture",
    clientOrSupplierId: "2",
    clientOrSupplierName: "Entreprise Beta",
    dateEcheance: "2024-01-20",
    montant: 8500,
    montantPaye: 0,
    soldeRestant: 8500,
    statut: "pending",
    dateFacture: "2024-01-10",
    conditionsPaiement: "30j",
  },
  {
    id: "2",
    type: "fournisseur",
    documentNumber: "FAC-FOUR-2024-001",
    documentType: "Facture fournisseur",
    clientOrSupplierId: "1",
    clientOrSupplierName: "Fournisseur Alpha",
    dateEcheance: "2024-01-22",
    montant: 15000,
    montantPaye: 0,
    soldeRestant: 15000,
    statut: "pending",
    dateFacture: "2024-01-15",
    conditionsPaiement: "30j",
  },
  {
    id: "3",
    type: "client",
    documentNumber: "FAC-2024-003",
    documentType: "Facture",
    clientOrSupplierId: "3",
    clientOrSupplierName: "Commerce Gamma",
    dateEcheance: "2024-01-25",
    montant: 22300,
    montantPaye: 0,
    soldeRestant: 22300,
    statut: "pending",
    dateFacture: "2024-01-05",
    conditionsPaiement: "30j",
  },
  {
    id: "4",
    type: "fournisseur",
    documentNumber: "FAC-FOUR-2024-002",
    documentType: "Facture fournisseur",
    clientOrSupplierId: "2",
    clientOrSupplierName: "Entreprise Beta Supply",
    dateEcheance: "2024-01-28",
    montant: 9600,
    montantPaye: 0,
    soldeRestant: 9600,
    statut: "pending",
    dateFacture: "2024-01-10",
    conditionsPaiement: "30j",
  },
  {
    id: "5",
    type: "client",
    documentNumber: "FAC-2024-001",
    documentType: "Facture",
    clientOrSupplierId: "1",
    clientOrSupplierName: "Société Alpha",
    dateEcheance: "2024-01-12",
    montant: 15000,
    montantPaye: 15000,
    soldeRestant: 0,
    statut: "paid",
    dateFacture: "2024-01-12",
    conditionsPaiement: "Comptant",
  },
  {
    id: "6",
    type: "client",
    documentNumber: "FAC-2023-089",
    documentType: "Facture",
    clientOrSupplierId: "4",
    clientOrSupplierName: "Services Delta",
    dateEcheance: "2024-01-03",
    montant: 5200,
    montantPaye: 0,
    soldeRestant: 5200,
    statut: "overdue",
    dateFacture: "2023-12-20",
    conditionsPaiement: "30j",
  },
];

const statusStyles = {
  pending: "bg-warning/10 text-warning border-0",
  paid: "bg-success/10 text-success border-0",
  overdue: "bg-destructive/10 text-destructive border-0",
};

const statusLabels = {
  pending: "En attente",
  paid: "Payé",
  overdue: "En retard",
};

export default function PaymentSchedules() {
  const { generateEntryFromClientPayment, generateEntryFromSupplierPayment, config } = useAccounting();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payments, setPayments] = useState<PaymentSchedule[]>(mockPayments);
  const [activeTab, setActiveTab] = useState<"all" | "clients" | "fournisseurs">("all");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientOrSupplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.statut === statusFilter;
    const matchesDateFrom = !dateFrom || payment.dateEcheance >= dateFrom;
    const matchesDateTo = !dateTo || payment.dateEcheance <= dateTo;
    const matchesTab = activeTab === "all" || 
      (activeTab === "clients" && payment.type === "client") ||
      (activeTab === "fournisseurs" && payment.type === "fournisseur");
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesTab;
  });

  const clientPayments = payments.filter(p => p.type === "client");
  const supplierPayments = payments.filter(p => p.type === "fournisseur");
  
  const totalClientPending = clientPayments
    .filter(p => p.statut === "pending")
    .reduce((sum, p) => sum + p.soldeRestant, 0);
  
  const totalSupplierPending = supplierPayments
    .filter(p => p.statut === "pending")
    .reduce((sum, p) => sum + p.soldeRestant, 0);

  const totalOverdue = payments
    .filter(p => p.statut === "overdue")
    .reduce((sum, p) => sum + p.soldeRestant, 0);

  const handleMarkAsPaid = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Générer l'écriture comptable automatiquement
    if (config.enabled) {
      if (payment.type === "client") {
        // Encaissement client
        generateEntryFromClientPayment(
          payment.documentNumber,
          today,
          payment.clientOrSupplierName,
          payment.montant,
          'bank' // Par défaut banque, pourrait être configurable
        );
      } else if (payment.type === "fournisseur") {
        // Paiement fournisseur
        generateEntryFromSupplierPayment(
          payment.documentNumber,
          today,
          payment.clientOrSupplierName,
          payment.montant,
          'bank' // Par défaut banque, pourrait être configurable
        );
      }
    }

    // Mettre à jour le statut du paiement
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, statut: "paid" as const, montantPaye: p.montant, soldeRestant: 0 }
        : p
    ));
  };

  return (
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Les échéances sont générées automatiquement à partir des factures enregistrées dans les modules Achats et Ventes.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">À recevoir (clients)</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {totalClientPending.toLocaleString()} MAD
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
                  <p className="text-sm font-medium text-muted-foreground">À payer (fournisseurs)</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {totalSupplierPending.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En retard</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {totalOverdue.toLocaleString()} MAD
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
                  <p className="text-sm font-medium text-muted-foreground">Total échéances</p>
                  <p className="text-2xl font-bold mt-1">
                    {payments.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="w-4 h-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="fournisseurs">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Fournisseurs
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par document ou client/fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
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
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="font-semibold">Client / Fournisseur</TableHead>
                    <TableHead className="font-semibold">Date facture</TableHead>
                    <TableHead className="font-semibold">Échéance</TableHead>
                    <TableHead className="text-right font-semibold">Montant</TableHead>
                    <TableHead className="text-right font-semibold">Payé</TableHead>
                    <TableHead className="text-right font-semibold">Solde</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Aucune échéance trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => {
                      const echeanceDate = new Date(payment.dateEcheance);
                      const isOverdue = echeanceDate < today && payment.statut !== "paid";
                      
                      return (
                        <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <Badge variant="outline">
                              {payment.type === "client" ? "Client" : "Fournisseur"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{payment.documentNumber}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{payment.documentType}</div>
                          </TableCell>
                          <TableCell>{payment.clientOrSupplierName}</TableCell>
                          <TableCell>{new Date(payment.dateFacture).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div className={cn(
                              "flex items-center gap-2",
                              isOverdue && "text-destructive font-semibold"
                            )}>
                              <Calendar className="w-3 h-3" />
                              {new Date(payment.dateEcheance).toLocaleDateString('fr-FR')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {payment.montant.toLocaleString()} MAD
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {payment.montantPaye.toLocaleString()} MAD
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              payment.soldeRestant > 0 ? "text-warning" : "text-success"
                            )}>
                              {payment.soldeRestant.toLocaleString()} MAD
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", statusStyles[payment.statut])}>
                              {statusLabels[payment.statut]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.statut === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.id)}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Marquer payé
                              </Button>
                            )}
                            {payment.statut === "paid" && (
                              <CheckCircle className="w-5 h-5 text-success mx-auto" />
                            )}
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
      </div>
  );
}
