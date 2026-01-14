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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  AlertCircle,
  FileCheck,
  Send,
  Trash2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DocumentTemplate, { DocumentFormData, DocumentLine, EntrepriseInfo } from "@/components/documents/DocumentTemplate";
import { useAuth } from "@/contexts/AuthContext";

// Local type for quotes with extended status
type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

interface Quote {
  id: string;
  number: string;
  client_id: string;
  date: string;
  total: number;
  tax: number;
  status: QuoteStatus;
  company_id: string;
}

const mockQuotes: Quote[] = [
  { id: "1", number: "DEV-2024-001", client_id: "1", date: "2024-01-12", total: 15000, tax: 3000, status: "sent", company_id: "1" },
  { id: "2", number: "DEV-2024-002", client_id: "2", date: "2024-01-10", total: 8500, tax: 1700, status: "accepted", company_id: "1" },
  { id: "3", number: "DEV-2024-003", client_id: "3", date: "2024-01-05", total: 22300, tax: 4460, status: "expired", company_id: "1" },
  { id: "4", number: "DEV-2024-004", client_id: "4", date: "2024-01-03", total: 5200, tax: 1040, status: "sent", company_id: "1" },
  { id: "5", number: "DEV-2024-005", client_id: "1", date: "2024-01-02", total: 12800, tax: 2560, status: "draft", company_id: "1" },
];

const clientNames: Record<string, string> = {
  "1": "Société Alpha",
  "2": "Entreprise Beta",
  "3": "Commerce Gamma",
  "4": "Services Delta",
};

const statusStyles = {
  accepted: "bg-success/10 text-success border-0",
  sent: "bg-info/10 text-info border-0",
  expired: "bg-destructive/10 text-destructive border-0",
  draft: "bg-warning/10 text-warning border-0",
};

const statusLabels = {
  accepted: "Accepté",
  sent: "Envoyé",
  expired: "Expiré",
  draft: "Brouillon",
};

export default function Quotes() {
  const { company } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [quoteToConvert, setQuoteToConvert] = useState<Quote | null>(null);

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

  const filteredQuotes = mockQuotes.filter((quote) => {
    const matchesSearch = quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientNames[quote.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotes = mockQuotes.length;
  const totalAmount = mockQuotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedAmount = mockQuotes
    .filter(q => q.status === "accepted")
    .reduce((sum, q) => sum + q.total, 0);
  const pendingAmount = mockQuotes
    .filter(q => q.status === "sent" || q.status === "expired")
    .reduce((sum, q) => sum + q.total, 0);

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsViewModalOpen(true);
  };

  const handleCreateQuote = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveQuote = (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => {
    console.log("Saving quote:", data);
    setIsCreateModalOpen(false);
    toast.success("Devis enregistré avec succès");
  };

  const handleConvertToInvoice = (quote: Quote) => {
    setQuoteToConvert(quote);
    setIsConvertModalOpen(true);
  };

  const handleSaveInvoice = (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => {
    console.log("Converting quote to invoice:", quoteToConvert, data);
    setIsConvertModalOpen(false);
    setQuoteToConvert(null);
    toast.success("Facture créée avec succès à partir du devis");
  };

  const handleDuplicateQuote = (quote: Quote) => {
    toast.success(`Devis ${quote.number} dupliqué`);
  };

  const handleSendQuote = (quote: Quote) => {
    toast.success(`Devis ${quote.number} envoyé au client`);
  };

  const handleDeleteQuote = (quote: Quote) => {
    toast.success(`Devis ${quote.number} supprimé`);
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
                  <p className="text-sm font-medium text-muted-foreground">Total devis</p>
                  <p className="text-2xl font-bold mt-1">{totalQuotes}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Acceptés</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {acceptedAmount.toLocaleString()} MAD
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
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateQuote}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Devis</TableHead>
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
                  {filteredQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun devis trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <TableRow key={quote.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{quote.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{clientNames[quote.client_id]}</TableCell>
                        <TableCell>{new Date(quote.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {(quote.total - quote.tax).toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right">
                          {quote.tax.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {quote.total.toLocaleString()} MAD
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[quote.status as keyof typeof statusStyles])}>
                            {statusLabels[quote.status as keyof typeof statusLabels]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewQuote(quote)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  Convertir en facture
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateQuote(quote)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendQuote(quote)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Envoyer au client
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteQuote(quote)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Modal pour créer un nouveau devis */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[95vh]">
            <DocumentTemplate
              docType="devis"
              entreprise={entrepriseInfo}
              readOnly={false}
              onSave={handleSaveQuote}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir un devis existant */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedQuote?.number}
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
              docType="devis"
              entreprise={entrepriseInfo}
              readOnly={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour convertir en facture */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Convertir {quoteToConvert?.number} en facture
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <DocumentTemplate
              docType="facture"
              entreprise={entrepriseInfo}
              readOnly={false}
              onSave={handleSaveInvoice}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
