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
  Copy,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QuoteCreateModal, QuoteFormData } from "@/components/quotes/QuoteCreateModal";
import { InvoiceCreateModal, InvoiceFormData } from "@/components/invoices/InvoiceCreateModal";
import { useQuotes, Quote, QuoteItem } from "@/hooks/use-quotes";
import { useClients } from "@/hooks/use-clients";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useTaxes } from "@/hooks/use-taxes";
import { generateDocumentPDF } from "@/components/documents/DocumentPDF";
import type { InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { supabase } from "@/integrations/supabase/client";
import { getNextDocumentNumber } from "@/hooks/use-document-numbering";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";

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
  const { quotes, loading, createQuote, updateQuote, deleteQuote, refreshQuotes } = useQuotes();
  const { clients } = useClients();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const { taxes, calculateTax } = useTaxes();
  const { createFacture } = useFacturesVentes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [quoteToConvert, setQuoteToConvert] = useState<Quote | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [invoiceFromQuoteData, setInvoiceFromQuoteData] = useState<InvoiceFormData | null>(null);
  const [editQuoteData, setEditQuoteData] = useState<{
    id: string;
    clientId: string;
    date: string;
    notes: string;
    validityDays: number;
    lines: { id: string; description: string; quantity: number; unitPrice: number; taxRateId: string | null; }[];
  } | null>(null);

  // Créer un map des clients pour accès rapide
  const clientMap = new Map(clients.map(client => [client.id, client]));

  const filteredQuotes = quotes.filter((quote) => {
    const client = clientMap.get(quote.client_id);
    const clientName = client?.nom || '';
    const matchesSearch = quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotes = quotes.length;
  const totalAmount = quotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedAmount = quotes
    .filter(q => q.status === "accepted")
    .reduce((sum, q) => sum + q.total, 0);
  const pendingAmount = quotes
    .filter(q => q.status === "sent" || q.status === "expired")
    .reduce((sum, q) => sum + q.total, 0);

  const handleViewQuote = async (quote: Quote) => {
    setSelectedQuote(quote);
    setIsViewModalOpen(true);
    // Charger les lignes du devis
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setQuoteItems((data || []) as QuoteItem[]);
    } catch (error) {
      console.error('Erreur chargement lignes devis:', error);
      toast.error('Erreur lors du chargement des lignes');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedQuote) return;
    
    try {
      const client = clientMap.get(selectedQuote.client_id);
      if (!client) {
        toast.error("Client introuvable");
        return;
      }

      // Charger les lignes si pas encore chargées
      let items = quoteItems;
      if (items.length === 0) {
        const { data } = await supabase
          .from('quote_items')
          .select('*')
          .eq('quote_id', selectedQuote.id)
          .order('created_at', { ascending: true });
        items = (data || []) as QuoteItem[];
      }

      const documentLines = items.map((item) => ({
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_ht: item.total - (item.total * item.tax_rate / (100 + item.tax_rate)),
      }));

      const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
      if (selectedQuote.tax > 0) {
        // Calculer le taux de TVA moyen
        const avgTaxRate = items.length > 0 
          ? items.reduce((sum, item) => sum + item.tax_rate, 0) / items.length 
          : 19;
        appliedTaxes.push({
          tax_id: 'tva',
          name: 'TVA',
          type: 'percentage',
          rate_or_value: avgTaxRate,
          amount: selectedQuote.tax,
        });
      }

      const totalHTBeforeDiscount = documentLines.reduce((sum, l) => sum + l.total_ht, 0);
      const subtotalAfterDiscount = selectedQuote.subtotal ?? 0;
      const discountAmount = Math.max(0, totalHTBeforeDiscount - subtotalAfterDiscount);

      const quoteData: InvoiceDocumentData = {
        type: 'quote',
        number: selectedQuote.number,
        date: selectedQuote.date,
        client: {
          name: client.nom,
          address: client.adresse || null,
          tax_number: client.numero_fiscal || null,
        },
        lines: documentLines,
        total_ht: totalHTBeforeDiscount,
        discount: discountAmount > 0 ? discountAmount : 0,
        applied_taxes: appliedTaxes,
        fiscal_stamp: selectedQuote.total > 0 ? 1 : 0,
        total_ttc: selectedQuote.total,
        notes: selectedQuote.notes,
      };

      const pdfBlob = await generateDocumentPDF(quoteData, company || null);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${selectedQuote.number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleCreateQuote = () => {
    setEditQuoteData(null);
    setIsCreateModalOpen(true);
  };

  const handleEditQuote = async (quote: Quote) => {
    try {
      // Charger les lignes du devis
      const { data: items, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Transformer les lignes pour le formulaire
      const lines = (items || []).map((item: QuoteItem) => {
        // Trouver la taxe correspondante
        const matchingTax = taxes.find(t => 
          t.type === 'percentage' && Math.abs(t.value - item.tax_rate) < 0.01
        );
        return {
          id: item.id,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unit_price,
          taxRateId: matchingTax?.id || null,
        };
      });
      
      // Calculer les jours de validité restants
      let validityDays = 30;
      if (quote.expires_at) {
        const expiresDate = new Date(quote.expires_at);
        const quoteDate = new Date(quote.date);
        validityDays = Math.max(1, Math.round((expiresDate.getTime() - quoteDate.getTime()) / (24 * 60 * 60 * 1000)));
      }
      
      setEditQuoteData({
        id: quote.id,
        clientId: quote.client_id,
        date: quote.date,
        notes: quote.notes || '',
        validityDays,
        lines,
      });
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      toast.error('Erreur lors du chargement du devis');
    }
  };

  // Handler pour le nouveau modal QuoteCreateModal
  const handleSaveQuote = async (data: QuoteFormData) => {
    try {
      // Calculer le total HT depuis les lignes
      let totalHT = 0;
      data.lines.forEach((line) => {
        totalHT += line.quantity * line.unitPrice;
      });

      // Appliquer la remise si nécessaire
      let discountAmount = 0;
      if (data.applyDiscount) {
        if (data.discountType === 'percentage') {
          discountAmount = (totalHT * data.discountValue) / 100;
        } else {
          discountAmount = data.discountValue;
        }
      }

      const totalHTAfterDiscount = totalHT - discountAmount;

      // Calculer les taxes appliquées
      const appliedTaxesList = taxes.filter(t => data.appliedTaxes.includes(t.id));
      
      const percentageTaxes = appliedTaxesList.filter(t => t.type === 'percentage');
      let totalPercentageTaxes = 0;
      percentageTaxes.forEach(tax => {
        totalPercentageTaxes += calculateTax(totalHTAfterDiscount, tax);
      });

      const fixedTaxes = appliedTaxesList.filter(t => t.type === 'fixed');
      let totalFixedTaxes = 0;
      fixedTaxes.forEach(tax => {
        totalFixedTaxes += tax.value;
      });

      const totalTax = totalPercentageTaxes + totalFixedTaxes;
      const totalTTC = totalHTAfterDiscount + totalTax;

      // Créer les items avec les taxes par ligne
      const items = data.lines.map(line => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const lineTax = line.taxRateId 
          ? calculateTax(lineSubtotal, taxes.find(t => t.id === line.taxRateId)!)
          : 0;
        return {
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          tax_rate: line.taxRateId 
            ? (taxes.find(t => t.id === line.taxRateId)?.value || 0)
            : 0,
          total: lineSubtotal + lineTax,
        };
      });

      if (editQuoteData) {
        // MODE ÉDITION : supprimer les anciennes lignes et mettre à jour
        await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', editQuoteData.id);
        
        // Insérer les nouvelles lignes
        if (items.length > 0) {
          await supabase
            .from('quote_items')
            .insert(items.map(item => ({
              ...item,
              quote_id: editQuoteData.id,
            })));
        }
        
        // Mettre à jour le devis avec la remise
        await updateQuote(editQuoteData.id, {
          client_id: data.clientId,
          date: data.date,
          expires_at: data.validityDays ? new Date(new Date(data.date).getTime() + data.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          subtotal: totalHTAfterDiscount,
          tax: totalTax,
          total: totalTTC,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
          notes: data.notes || null,
        });
        
        setEditQuoteData(null);
      } else {
        // MODE CRÉATION avec la remise
        await createQuote({
          client_id: data.clientId,
          date: data.date,
          expires_at: data.validityDays ? new Date(new Date(data.date).getTime() + data.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          subtotal: totalHTAfterDiscount,
          tax: totalTax,
          total: totalTTC,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
          status: 'draft',
          notes: data.notes || null,
          items: items,
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error saving quote:", error);
    }
  };


  const handleConvertToInvoice = async (quote: Quote) => {
    try {
      // Charger les lignes du devis
      const { data: quoteItemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      const items = (quoteItemsData || []) as QuoteItem[];

      // Trouver les taxes par défaut
      const defaultTaxes = taxes.filter(t => t.type === 'percentage' && t.enabled);
      const defaultTaxId = defaultTaxes.length > 0 ? defaultTaxes[0].id : null;

      // Transformer les lignes pour le formulaire de facture
      const invoiceLines = items.map((item) => {
        // Trouver la taxe correspondante
        const matchingTax = taxes.find(t => 
          t.type === 'percentage' && Math.abs(t.value - item.tax_rate) < 0.01
        );
        return {
          id: `line_${item.id}`,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unit_price,
          taxRateId: matchingTax?.id || defaultTaxId,
        };
      });

      // Pré-remplir les données du formulaire de facture
      const invoiceData: InvoiceFormData = {
        clientId: quote.client_id,
        date: new Date().toISOString().split('T')[0],
        reference: '',
        currency: company?.currency || 'TND',
        appliedTaxes: defaultTaxes.map(t => t.id),
        applyDiscount: false,
        discountType: 'percentage',
        discountValue: 0,
        lines: invoiceLines.length > 0 ? invoiceLines : [{
          id: `line_${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRateId: defaultTaxId,
        }],
        notes: quote.notes || '',
        hasAcompte: false,
        acompteType: 'percentage',
        acompteValue: 0,
        devisId: quote.id, // Lier au devis source
      };

      setInvoiceFromQuoteData(invoiceData);
      setIsConvertModalOpen(true);
    } catch (error) {
      console.error("Error loading quote for conversion:", error);
      toast.error("Erreur lors du chargement du devis");
    }
  };

  const handleSaveInvoiceFromQuote = async (data: InvoiceFormData, acomptesAllocations?: { encaissements: any[], factures_acompte: any[] }) => {
    try {
      // Cette fonction sera appelée par InvoiceCreateModal
      // Les données sont déjà dans le bon format
      // Le devis_id est déjà dans data.devisId
      // La création de la facture se fera via le hook createFacture dans Invoices.tsx
      // On ferme juste le modal ici
      setIsConvertModalOpen(false);
      setInvoiceFromQuoteData(null);
      toast.success("Facture créée depuis le devis avec succès");
    } catch (error) {
      console.error("Error saving invoice from quote:", error);
      toast.error("Erreur lors de la création de la facture");
    }
  };

  const handleDuplicateQuote = (quote: Quote) => {
    toast.success(`Devis ${quote.number} dupliqué`);
  };

  const handleSendQuote = (quote: Quote) => {
    toast.success(`Devis ${quote.number} envoyé au client`);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quote.number} ?`)) {
      try {
        await deleteQuote(quote.id);
      } catch (error) {
        console.error("Error deleting quote:", error);
      }
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
                    {formatCurrency(totalAmount)}
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
                    {formatCurrency(acceptedAmount)}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredQuotes.length === 0 ? (
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
                        <TableCell>{clientMap.get(quote.client_id)?.nom || '-'}</TableCell>
                        <TableCell>{new Date(quote.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(quote.subtotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(quote.tax)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(quote.total)}
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={async () => {
                                try {
                                  const client = clientMap.get(quote.client_id);
                                  if (!client) {
                                    toast.error("Client introuvable");
                                    return;
                                  }

                                  const { data } = await supabase
                                    .from('quote_items')
                                    .select('*')
                                    .eq('quote_id', quote.id)
                                    .order('created_at', { ascending: true });
                                  
                                  const items = (data || []) as QuoteItem[];

                                  const documentLines = items.map((item) => ({
                                    description: item.description || '',
                                    quantity: item.quantity,
                                    unit_price: item.unit_price,
                                    total_ht: item.total - (item.total * item.tax_rate / (100 + item.tax_rate)),
                                  }));

                                  const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
                                  if (quote.tax > 0) {
                                    const avgTaxRate = items.length > 0 
                                      ? items.reduce((sum, item) => sum + item.tax_rate, 0) / items.length 
                                      : 19;
                                    appliedTaxes.push({
                                      tax_id: 'tva',
                                      name: 'TVA',
                                      type: 'percentage',
                                      rate_or_value: avgTaxRate,
                                      amount: quote.tax,
                                    });
                                  }

                                  const totalHTBeforeDiscount = documentLines.reduce((sum, l) => sum + l.total_ht, 0);
                                  const subtotalAfterDiscount = quote.subtotal ?? 0;
                                  const discountAmount = Math.max(0, totalHTBeforeDiscount - subtotalAfterDiscount);

                                  const quoteData: InvoiceDocumentData = {
                                    type: 'quote',
                                    number: quote.number,
                                    date: quote.date,
                                    client: {
                                      name: client.nom,
                                      address: client.adresse || null,
                                      tax_number: client.numero_fiscal || null,
                                    },
                                    lines: documentLines,
                                    total_ht: totalHTBeforeDiscount,
                                    discount: (quote as any).remise_montant || discountAmount || 0,
                                    discount_type: (quote as any).remise_type || null,
                                    discount_value: (quote as any).remise_valeur || 0,
                                    applied_taxes: appliedTaxes,
                                    fiscal_stamp: quote.total > 0 ? 1 : 0,
                                    total_ttc: quote.total,
                                    notes: quote.notes,
                                  };

                                  const pdfBlob = await generateDocumentPDF(quoteData, company || null);
                                  const url = URL.createObjectURL(pdfBlob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `devis-${quote.number}.pdf`;
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewQuote(quote)} className="gap-2">
                                  <Eye className="w-4 h-4" />
                                  Voir le devis
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditQuote(quote)} className="gap-2">
                                  <Edit className="w-4 h-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)} className="gap-2">
                                  <FileCheck className="w-4 h-4" />
                                  Convertir en facture
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateQuote(quote)} className="gap-2">
                                  <Copy className="w-4 h-4" />
                                  Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendQuote(quote)} className="gap-2">
                                  <Send className="w-4 h-4" />
                                  Envoyer au client
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteQuote(quote)}
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
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
      <QuoteCreateModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditQuoteData(null);
        }}
        onSave={handleSaveQuote}
        editData={editQuoteData}
      />

      {/* Modal pour voir un devis existant */}
      {/* TODO: Créer une page Preview Document avec CompanyDocumentLayout */}
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
                  onClick={handleDownloadPDF}
                  disabled={!selectedQuote}
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

      {/* Modal pour convertir en facture */}
      {invoiceFromQuoteData && (
        <InvoiceCreateModal
          open={isConvertModalOpen}
          onOpenChange={(open) => {
            setIsConvertModalOpen(open);
            if (!open) {
              setInvoiceFromQuoteData(null);
            }
          }}
          onSave={handleSaveInvoiceFromQuote}
          editData={null}
          initialData={invoiceFromQuoteData}
        />
      )}
    </>
  );
}
