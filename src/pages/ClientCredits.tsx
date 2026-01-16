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
import { CreditNoteCreateModal, CreditNoteFormData } from "@/components/credit-notes/CreditNoteCreateModal";
import type { ClientCredit } from "@/types/database";
import { useTaxes } from "@/hooks/use-taxes";
import { generateDocumentPDF } from "@/components/documents/DocumentPDF";
import type { InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { useClients } from "@/hooks/use-clients";
import { toast } from "sonner";


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
  const { company } = useAuth();
  const { clientCredits, createClientCredit, applyClientCredit, refundClientCredit } = useCredits();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const { taxes, calculateTax } = useTaxes();
  const { clients } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCredit, setSelectedCredit] = useState<ClientCredit | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleViewCredit = (credit: ClientCredit) => {
    setSelectedCredit(credit);
    setIsViewModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedCredit) return;
    
    try {
      const client = clients.find(c => c.id === selectedCredit.client_id);
      if (!client) {
        toast.error("Client introuvable");
        return;
      }

      // Pour les avoirs, on utilise les données de base (subtotal, tax, total)
      // Les lignes ne sont pas stockées dans la table ClientCredit actuellement
      // On crée une ligne fictive avec le total
      const documentLines = [{
        description: 'Avoir client',
        quantity: 1,
        unit_price: selectedCredit.subtotal,
        total_ht: selectedCredit.subtotal,
      }];

      const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
      if (selectedCredit.tax > 0) {
        const taxRate = selectedCredit.subtotal > 0 
          ? (selectedCredit.tax / selectedCredit.subtotal) * 100 
          : 19;
        appliedTaxes.push({
          tax_id: 'tva',
          name: 'TVA',
          type: 'percentage',
          rate_or_value: taxRate,
          amount: selectedCredit.tax,
        });
      }

      const creditData: InvoiceDocumentData = {
        type: 'credit_note',
        number: selectedCredit.number,
        date: selectedCredit.date,
        client: {
          name: client.nom,
          address: client.adresse || null,
        },
        lines: documentLines,
        total_ht: selectedCredit.subtotal,
        applied_taxes: appliedTaxes,
        total_ttc: selectedCredit.total,
        notes: selectedCredit.comments || null,
      };

      const pdfBlob = await generateDocumentPDF(creditData, company || null);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avoir-${selectedCredit.number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleCreateCredit = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveCredit = async (data: CreditNoteFormData) => {
    try {
      // Calculer les totaux
      let totalHT = 0;
      data.lines.forEach((line) => {
        totalHT += line.quantity * line.unitPrice;
      });

      // Appliquer la remise
      let discountAmount = 0;
      if (data.applyDiscount) {
        if (data.discountType === 'percentage') {
          discountAmount = (totalHT * data.discountValue) / 100;
        } else {
          discountAmount = data.discountValue;
        }
      }
      const totalHTAfterDiscount = totalHT - discountAmount;

      // Récupérer les taxes appliquées
      const appliedTaxesList = taxes.filter(t => data.appliedTaxes.includes(t.id));
      const percentageTaxes = appliedTaxesList.filter(t => t.type === 'percentage');
      const fixedTaxes = appliedTaxesList.filter(t => t.type === 'fixed');

      // Calculer les taxes
      let totalTax = 0;
      percentageTaxes.forEach(tax => {
        totalTax += calculateTax(totalHTAfterDiscount, tax);
      });
      fixedTaxes.forEach(tax => {
        totalTax += tax.value;
      });

      const totalTTC = totalHTAfterDiscount + totalTax;

      // Créer l'avoir avec le numéro généré automatiquement
      await createClientCredit({
        invoice_id: data.linkedToInvoice && data.invoiceId ? data.invoiceId : '',
        client_id: data.clientId,
        date: data.date,
        type: 'partial',
        reason: 'other',
        subtotal: totalHTAfterDiscount,
        tax: totalTax,
        total: totalTTC,
        status: 'draft',
        stock_impact: false,
        comments: data.notes || undefined,
      }, data.reference || undefined);

      setIsCreateModalOpen(false);
      toast.success("Avoir créé avec succès");
    } catch (error) {
      console.error("Error saving credit note:", error);
      toast.error("Erreur lors de la création de l'avoir");
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={async () => {
                                try {
                                  const client = clients.find(c => c.id === credit.client_id);
                                  if (!client) {
                                    toast.error("Client introuvable");
                                    return;
                                  }

                                  const documentLines = [{
                                    description: 'Avoir client',
                                    quantity: 1,
                                    unit_price: credit.subtotal,
                                    total_ht: credit.subtotal,
                                  }];

                                  const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
                                  if (credit.tax > 0) {
                                    const taxRate = credit.subtotal > 0 
                                      ? (credit.tax / credit.subtotal) * 100 
                                      : 19;
                                    appliedTaxes.push({
                                      tax_id: 'tva',
                                      name: 'TVA',
                                      type: 'percentage',
                                      rate_or_value: taxRate,
                                      amount: credit.tax,
                                    });
                                  }

                                  const creditData: InvoiceDocumentData = {
                                    type: 'credit_note',
                                    number: credit.number,
                                    date: credit.date,
                                    client: {
                                      name: client.nom,
                                      address: client.adresse || null,
                                    },
                                    lines: documentLines,
                                    total_ht: credit.subtotal,
                                    applied_taxes: appliedTaxes,
                                    total_ttc: credit.total,
                                    notes: credit.comments || null,
                                  };

                                  const pdfBlob = await generateDocumentPDF(creditData, company || null);
                                  const url = URL.createObjectURL(pdfBlob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `avoir-${credit.number}.pdf`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                  toast.success('PDF téléchargé avec succès');
                                } catch (error) {
                                  console.error('Erreur génération PDF:', error);
                                  toast.error('Erreur lors de la génération du PDF');
                                }
                              }}
                            >
                              <Download className="w-4 h-4" />
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
      <CreditNoteCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleSaveCredit}
      />

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
                  onClick={handleDownloadPDF}
                  disabled={!selectedCredit}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6">
            <p className="text-muted-foreground">Prévisualisation du document à implémenter avec CompanyDocumentLayout</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
