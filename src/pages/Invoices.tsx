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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Eye, 
  MoreHorizontal,
  Printer,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";
import DocumentTemplate, { DocumentFormData, DocumentLine, EntrepriseInfo } from "@/components/documents/DocumentTemplate";
import { useAuth } from "@/contexts/AuthContext";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";

const mockInvoices: Invoice[] = [
  { id: "1", number: "FAC-2024-001", client_id: "1", date: "2024-01-12", total: 15000, tax: 3000, status: "paid", company_id: "1" },
  { id: "2", number: "FAC-2024-002", client_id: "2", date: "2024-01-10", total: 8500, tax: 1700, status: "sent", company_id: "1" },
  { id: "3", number: "FAC-2024-003", client_id: "3", date: "2024-01-05", total: 22300, tax: 4460, status: "overdue", company_id: "1" },
  { id: "4", number: "FAC-2024-004", client_id: "4", date: "2024-01-03", total: 5200, tax: 1040, status: "paid", company_id: "1" },
  { id: "5", number: "FAC-2024-005", client_id: "1", date: "2024-01-02", total: 12800, tax: 2560, status: "draft", company_id: "1" },
];

const clientNames: Record<string, string> = {
  "1": "Société Alpha",
  "2": "Entreprise Beta",
  "3": "Commerce Gamma",
  "4": "Services Delta",
};

const statusStyles = {
  paid: "bg-success/10 text-success border-0",
  sent: "bg-info/10 text-info border-0",
  overdue: "bg-destructive/10 text-destructive border-0",
  draft: "bg-warning/10 text-warning border-0",
};

const statusLabels = {
  paid: "Payée",
  sent: "Envoyée",
  overdue: "En retard",
  draft: "Brouillon",
};

export default function Invoices() {
  const { company } = useAuth();
  const { createFacture } = useFacturesVentes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientNames[invoice.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = mockInvoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = mockInvoices
    .filter(inv => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveInvoice = async (data: { formData: DocumentFormData; lignes: DocumentLine[]; acomptesAlloues?: Array<{ encaissement_id: string; montant_alloue: number }> }) => {
    try {
      // Convertir les données du formulaire
      const factureData = {
        numero: data.formData.numero,
        date_facture: data.formData.date,
        client_id: data.formData.clientId,
        notes: data.formData.notes || null,
      };

      // Convertir les lignes
      const lignes = data.lignes.map((ligne, index) => {
        const sousTotal = ligne.quantite * ligne.prixHT;
        const montantRemise = sousTotal * (ligne.remise / 100);
        const htApresRemise = sousTotal - montantRemise;
        const montantTVA = htApresRemise * (ligne.tva / 100);
        const montantTTC = htApresRemise + montantTVA;

        return {
          description: ligne.designation,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prixHT,
          taux_tva: ligne.tva,
          montant_ht: htApresRemise,
          montant_tva: montantTVA,
          montant_ttc: montantTTC,
          ordre: index,
        };
      });

      // Convertir les acomptes alloués
      const acomptesAlloues = data.acomptesAlloues || [];

      // Créer la facture via le hook
      await createFacture(factureData, lignes, acomptesAlloues);
      
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
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
                  <p className="text-sm font-medium text-muted-foreground">Total factures</p>
                  <p className="text-2xl font-bold mt-1">{totalInvoices}</p>
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
                    {totalAmount.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payées</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {paidAmount.toLocaleString()} MAD
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
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold mt-1 text-accent">
                    {pendingAmount.toLocaleString()} MAD
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
                placeholder="Rechercher par numéro ou client..."
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
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateInvoice}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Facture</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">HT</TableHead>
                    <TableHead className="text-right font-semibold">TVA</TableHead>
                    <TableHead className="text-right font-semibold">TTC</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune facture trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{invoice.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{clientNames[invoice.client_id]}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {(invoice.total - invoice.tax).toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.tax.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {invoice.total.toLocaleString()} MAD
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[invoice.status])}>
                            {statusLabels[invoice.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
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

      {/* Modal pour créer une nouvelle facture */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[95vh]">
            <DocumentTemplate
              docType="facture"
              entreprise={entrepriseInfo}
              readOnly={false}
              onSave={handleSaveInvoice}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir une facture existante */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedInvoice?.number}
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
              docType="facture"
              entreprise={entrepriseInfo}
              readOnly={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
