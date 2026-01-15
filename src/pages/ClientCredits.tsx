import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  CheckCircle,
  Download,
  Printer,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import DocumentTemplate, { DocumentFormData, DocumentLine, EntrepriseInfo } from "@/components/documents/DocumentTemplate";
import type { ClientCredit } from "@/types/database";

// Mock invoices for current month
const mockClientInvoices = [
  {
    id: 'inv_1',
    number: 'FAC-2025-001',
    client_id: 'cli_1',
    client_name: 'Client Alpha',
    date: '2025-01-05',
    total: 5950,
  },
  {
    id: 'inv_2',
    number: 'FAC-2025-002',
    client_id: 'cli_1',
    client_name: 'Client Alpha',
    date: '2025-01-10',
    total: 9520,
  },
  {
    id: 'inv_3',
    number: 'FAC-2025-003',
    client_id: 'cli_2',
    client_name: 'Entreprise Beta',
    date: '2025-01-08',
    total: 3200,
  },
];

const statusStyles = {
  draft: "bg-warning/10 text-warning border-0",
  sent: "bg-info/10 text-info border-0",
  applied: "bg-success/10 text-success border-0",
  refunded: "bg-secondary/10 text-secondary border-0",
};

const statusLabels: Record<ClientCredit['status'], string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  applied: 'Imputé',
  refunded: 'Remboursé',
};

export default function ClientCredits() {
  const { company, refreshCompany } = useAuth();
  const { clientCredits, createClientCredit, updateClientCredit, applyClientCredit, refundClientCredit } = useCredits();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCredit, setSelectedCredit] = useState<ClientCredit | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Toggle pour avoir liée à une facture
  const [isLinkedToInvoice, setIsLinkedToInvoice] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");

  // Construire les infos entreprise depuis le contexte Auth
  const entrepriseInfo: EntrepriseInfo | undefined = company ? {
    nom: company.name,
    adresse: company.address || '',
    ville: '',
    tel: company.phone || '',
    email: company.email || '',
    mf: company.tax_number || '',
    logo: company.logo || undefined,
    piedDePage: company.footer || ''
  } : undefined;

  // Obtenir les clients uniques
  const uniqueClients = Array.from(
    new Map(mockClientInvoices.map(inv => [inv.client_id, { id: inv.client_id, name: inv.client_name }])).values()
  );

  // Filtrer les factures du client sélectionné pour le mois en cours
  const currentMonthInvoices = mockClientInvoices.filter(inv => {
    if (!selectedClientId) return false;
    const invoiceDate = new Date(inv.date);
    const now = new Date();
    return inv.client_id === selectedClientId && 
           invoiceDate.getMonth() === now.getMonth() && 
           invoiceDate.getFullYear() === now.getFullYear();
  });

  const filteredCredits = clientCredits.filter((credit) => {
    const matchesSearch = credit.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCredits = clientCredits.length;
  const totalAmount = clientCredits.reduce((sum, c) => sum + c.total, 0);
  const appliedAmount = clientCredits
    .filter(c => c.status === 'applied')
    .reduce((sum, c) => sum + c.total, 0);
  const pendingAmount = clientCredits
    .filter(c => c.status === 'draft' || c.status === 'sent')
    .reduce((sum, c) => sum + c.total, 0);

  const handleViewCredit = async (credit: ClientCredit) => {
    await refreshCompany();
    setSelectedCredit(credit);
    setIsViewModalOpen(true);
  };

  const handleCreateCredit = async () => {
    await refreshCompany();
    setIsLinkedToInvoice(false);
    setSelectedClientId("");
    setSelectedInvoiceId("");
    setIsCreateModalOpen(true);
  };

  const handleSaveCredit = async (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => {
    try {
      // Calculer les totaux depuis les lignes
      const totaux = data.lignes.reduce((acc, ligne) => {
        const sousTotal = ligne.quantite * ligne.prixHT;
        const montantRemise = sousTotal * (ligne.remise / 100);
        const htApresRemise = sousTotal - montantRemise;
        const montantTVA = htApresRemise * (ligne.tva / 100);
        const totalTTC = htApresRemise + montantTVA;
        
        return {
          subtotal: acc.subtotal + htApresRemise,
          tax: acc.tax + montantTVA,
          total: acc.total + totalTTC,
        };
      }, { subtotal: 0, tax: 0, total: 0 });

      // Créer l'avoir avec le numéro généré automatiquement
      await createClientCredit({
        invoice_id: isLinkedToInvoice && selectedInvoiceId ? selectedInvoiceId : '',
        client_id: data.formData.clientId,
        date: data.formData.date,
        type: 'partial', // Par défaut, peut être modifié plus tard
        reason: 'other',
        subtotal: totaux.subtotal,
        tax: totaux.tax,
        total: totaux.total,
        status: 'draft',
        stock_impact: false,
        comments: data.formData.notes || undefined,
      }, data.formData.numero); // Passer le numéro généré par DocumentTemplate

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error saving credit note:", error);
    }
  };

  const handleApply = (id: string) => {
    if (confirm("Imputer cet avoir sur la prochaine facture client ?")) {
      applyClientCredit(id);
    }
  };

  const handleRefund = (id: string) => {
    if (confirm("Marquer cet avoir comme remboursé ?")) {
      refundClientCredit(id);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total avoirs</p>
                  <p className="text-2xl font-bold mt-1">{totalCredits}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <TrendingDown className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Imputés</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {formatCurrency(appliedAmount)}
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
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold mt-1 text-accent">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <AlertCircle className="w-5 h-5 text-accent" />
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
                placeholder="Rechercher par numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="applied">Imputé</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateCredit}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel avoir
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Avoir</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Facture liée</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">HT</TableHead>
                    <TableHead className="text-right font-semibold">TVA</TableHead>
                    <TableHead className="text-right font-semibold">TTC</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun avoir trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCredits.map((credit) => (
                      <TableRow key={credit.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{credit.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{credit.client_id}</TableCell>
                        <TableCell>
                          {credit.invoice_id ? (
                            <Badge variant="outline" className="text-xs">
                              {credit.invoice_id}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(credit.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(credit.subtotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(credit.tax)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(credit.total)}
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[credit.status])}>
                            {statusLabels[credit.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewCredit(credit)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {credit.status !== 'applied' && credit.status !== 'refunded' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => handleApply(credit.id)}
                                >
                                  Imputer
                                </Button>
                              </>
                            )}
                            {credit.status === 'applied' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleRefund(credit.id)}
                              >
                                Rembourser
                              </Button>
                            )}
                          </div>
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

      {/* Modal pour créer un nouvel avoir */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[95vh]">
            {/* Section toggle avoir liée */}
            <div className="px-8 pt-6 pb-4 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Type d'avoir</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="linked-invoice"
                    checked={isLinkedToInvoice}
                    onCheckedChange={setIsLinkedToInvoice}
                  />
                  <Label htmlFor="linked-invoice" className="font-medium">
                    Avoir lié à une facture
                  </Label>
                </div>
              </div>

              {isLinkedToInvoice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                  <div className="space-y-2">
                    <Label htmlFor="client-select">Client</Label>
                    <Select value={selectedClientId} onValueChange={(val) => {
                      setSelectedClientId(val);
                      setSelectedInvoiceId("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-select">Facture du mois en cours</Label>
                    <Select 
                      value={selectedInvoiceId} 
                      onValueChange={setSelectedInvoiceId}
                      disabled={!selectedClientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedClientId ? "Sélectionner une facture" : "Choisir d'abord un client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentMonthInvoices.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Aucune facture ce mois
                          </SelectItem>
                        ) : (
                          currentMonthInvoices.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.number} - {formatCurrency(invoice.total)} ({new Date(invoice.date).toLocaleDateString('fr-FR')})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInvoiceId && (
                    <div className="col-span-2 p-3 bg-info/10 rounded-lg border border-info/20">
                      <p className="text-sm text-info">
                        <strong>Facture sélectionnée :</strong> {mockClientInvoices.find(i => i.id === selectedInvoiceId)?.number} 
                        {" - "}
                        {formatCurrency(mockClientInvoices.find(i => i.id === selectedInvoiceId)?.total || 0)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isLinkedToInvoice && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm text-warning">
                    Cet avoir ne sera pas lié à une facture spécifique. Il pourra être imputé sur n'importe quelle facture future du client.
                  </p>
                </div>
              )}
            </div>

            <DocumentTemplate
              docType="avoir"
              entreprise={entrepriseInfo}
              readOnly={false}
              onSave={handleSaveCredit}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir un avoir existant */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedCredit?.number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setTimeout(() => {
                      const pdfButton = document.querySelector('[data-pdf-button]') as HTMLElement;
                      if (pdfButton) {
                        pdfButton.click();
                      }
                    }, 100);
                  }}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setTimeout(() => {
                      const printButton = document.querySelector('[data-print-button]') as HTMLElement;
                      if (printButton) {
                        printButton.click();
                      }
                    }, 100);
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <DocumentTemplate
              docType="avoir"
              entreprise={entrepriseInfo}
              readOnly={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
