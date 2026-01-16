import { useState, useMemo, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InvoiceCreateModal, InvoiceFormData } from "@/components/invoices/InvoiceCreateModal";
import { useFacturesVentes, type FactureVente, type FactureVenteLigne } from "@/hooks/use-factures-ventes";
import { useClients } from "@/hooks/use-clients";
import { useTaxes } from "@/hooks/use-taxes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyDocumentLayout } from "@/components/documents/CompanyDocumentLayout";
import { InvoiceDocument, type InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { generateInvoicePDF } from "@/components/documents/InvoicePDF";
import { supabase } from "@/integrations/supabase/client";

// Mapping des statuts réels vers les statuts d'affichage
const statusStyles: Record<string, string> = {
  payee: "bg-success/10 text-success border-0",
  validee: "bg-info/10 text-info border-0",
  brouillon: "bg-warning/10 text-warning border-0",
  annulee: "bg-destructive/10 text-destructive border-0",
};

const statusLabels: Record<string, string> = {
  payee: "Payée",
  validee: "Validée",
  brouillon: "Brouillon",
  annulee: "Annulée",
};

export default function Invoices() {
  const { factures, loading, refreshFactures, createFacture } = useFacturesVentes();
  const { clients } = useClients();
  const { taxes } = useTaxes();
  const { company } = useAuth();
  const { formatAmount } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<FactureVente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [invoiceDocumentData, setInvoiceDocumentData] = useState<InvoiceDocumentData | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  // Créer un map des clients pour accès rapide
  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach(client => {
      map[client.id] = client.nom;
    });
    return map;
  }, [clients]);

  // Filtrer les factures
  const filteredInvoices = useMemo(() => {
    return factures.filter((invoice) => {
      const matchesSearch = invoice.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientsMap[invoice.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [factures, searchTerm, statusFilter, clientsMap]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalInvoices = factures.length;
    const totalAmount = factures.reduce((sum, inv) => sum + inv.montant_ttc, 0);
    const paidAmount = factures
      .filter(inv => inv.statut === "payee")
      .reduce((sum, inv) => sum + inv.montant_ttc, 0);
    const pendingAmount = factures
      .filter(inv => inv.statut === "validee")
      .reduce((sum, inv) => sum + inv.montant_restant, 0);
    
    return { totalInvoices, totalAmount, paidAmount, pendingAmount };
  }, [factures]);

  const handleViewInvoice = async (invoice: FactureVente) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
    setLoadingDocument(true);
    
    try {
      // Récupérer les lignes de la facture
      const { data: lignes, error: lignesError } = await supabase
        .from('facture_vente_lignes')
        .select('*')
        .eq('facture_vente_id', invoice.id)
        .order('ordre', { ascending: true });

      if (lignesError) {
        throw lignesError;
      }

      // Récupérer le client
      const client = clients.find(c => c.id === invoice.client_id);
      if (!client) {
        toast.error("Client introuvable");
        return;
      }

      // Transformer les lignes
      const documentLines = (lignes || []).map((ligne: FactureVenteLigne) => ({
        description: ligne.description || '',
        quantity: ligne.quantite,
        unit_price: ligne.prix_unitaire,
        total_ht: ligne.montant_ht,
      }));

      // Construire les taxes appliquées
      const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
      
      // Si montant_tva > 0, on ajoute une taxe TVA
      if (invoice.montant_tva > 0) {
        // Trouver le taux de TVA depuis les lignes
        const tauxTVA = (lignes as any)?.[0]?.taux_tva || 19;
        appliedTaxes.push({
          tax_id: 'tva',
          name: 'TVA',
          type: 'percentage',
          rate_or_value: tauxTVA,
          amount: invoice.montant_tva,
        });
      }

      // Construire les données du document
      const data: InvoiceDocumentData = {
        type: 'invoice',
        number: invoice.numero,
        date: invoice.date_facture,
        client: {
          name: client.nom,
          address: client.adresse || null,
        },
        lines: documentLines,
        total_ht: invoice.montant_ht,
        applied_taxes: appliedTaxes,
        total_ttc: invoice.montant_ttc,
        notes: invoice.notes,
      };

      setInvoiceDocumentData(data);
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Erreur lors du chargement de la facture");
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleCreateInvoice = () => {
    setIsCreateModalOpen(true);
  };

  // Handler pour le nouveau modal InvoiceCreateModal
  const handleSaveInvoice = async (data: InvoiceFormData) => {
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

      // Convertir les lignes pour le backend
      const lignes = data.lines.map((line, index) => {
        const lineTotal = line.quantity * line.unitPrice;
        let tauxTVA = 0;
        
        // Utiliser la taxe sélectionnée pour la ligne (si c'est une taxe en pourcentage)
        if (line.taxRateId) {
          const tax = taxes.find(t => t.id === line.taxRateId);
          if (tax && tax.type === 'percentage') {
            tauxTVA = tax.value;
          }
        }

        return {
          description: line.description,
          quantite: line.quantity,
          prix_unitaire: line.unitPrice,
          taux_tva: tauxTVA,
          montant_ht: lineTotal,
          montant_tva: 0, // Sera calculé côté backend
          montant_ttc: lineTotal,
          ordre: index,
        };
      });

      // Créer la facture via le hook
      const factureData = {
        numero: data.reference || '', // Le numéro sera généré automatiquement
        date_facture: data.date,
        client_id: data.clientId,
        notes: data.notes || null,
      };

      await createFacture(factureData, lignes, []);
      
      setIsCreateModalOpen(false);
      toast.success("Facture créée avec succès");
      // Rafraîchir la liste des factures
      await refreshFactures();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Erreur lors de la création de la facture");
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
                  <p className="text-2xl font-bold mt-1">{stats.totalInvoices}</p>
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
                    {formatAmount(stats.totalAmount)}
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
                    {formatAmount(stats.paidAmount)}
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
                    {formatAmount(stats.pendingAmount)}
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
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="validee">Validée</SelectItem>
                <SelectItem value="payee">Payée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
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
                              <span className="font-semibold">{invoice.numero}</span>
                            </div>
                          </TableCell>
                          <TableCell>{clientsMap[invoice.client_id] || "Client inconnu"}</TableCell>
                          <TableCell>{new Date(invoice.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-right">
                            {formatAmount(invoice.montant_ht)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatAmount(invoice.montant_tva)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmount(invoice.montant_ttc)}
                          </TableCell>
                          <TableCell>
                            <span className={cn("erp-badge text-xs", statusStyles[invoice.statut] || statusStyles.brouillon)}>
                              {statusLabels[invoice.statut] || invoice.statut}
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={async () => {
                                  try {
                                    // Charger les données de la facture pour le PDF
                                    const { data: lignes } = await supabase
                                      .from('facture_vente_lignes')
                                      .select('*')
                                      .eq('facture_vente_id', invoice.id)
                                      .order('ordre', { ascending: true });

                                    const client = clients.find(c => c.id === invoice.client_id);
                                    if (!client) {
                                      toast.error("Client introuvable");
                                      return;
                                    }

                                    const documentLines = (lignes || []).map((ligne: any) => ({
                                      description: ligne.description || '',
                                      quantity: ligne.quantite,
                                      unit_price: ligne.prix_unitaire,
                                      total_ht: ligne.montant_ht,
                                    }));

                                    const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
                                    if (invoice.montant_tva > 0) {
                                      const tauxTVA = (lignes as any)?.[0]?.taux_tva || 19;
                                      appliedTaxes.push({
                                        tax_id: 'tva',
                                        name: 'TVA',
                                        type: 'percentage',
                                        rate_or_value: tauxTVA,
                                        amount: invoice.montant_tva,
                                      });
                                    }

                                    const invoiceData: InvoiceDocumentData = {
                                      type: 'invoice',
                                      number: invoice.numero,
                                      date: invoice.date_facture,
                                      client: {
                                        name: client.nom,
                                        address: client.adresse || null,
                                      },
                                      lines: documentLines,
                                      total_ht: invoice.montant_ht,
                                      applied_taxes: appliedTaxes,
                                      total_ttc: invoice.montant_ttc,
                                      notes: invoice.notes,
                                    };

                                    const pdfBlob = generateInvoicePDF(invoiceData, company || null);
                                    const url = URL.createObjectURL(pdfBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `facture-${invoice.numero}.pdf`;
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour créer une nouvelle facture */}
      <InvoiceCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleSaveInvoice}
      />

      {/* Modal pour voir une facture existante */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedInvoice?.numero}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    if (invoiceDocumentData) {
                      const pdfBlob = generateInvoicePDF(invoiceDocumentData, company || null);
                      const url = URL.createObjectURL(pdfBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `facture-${invoiceDocumentData.number}.pdf`;
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success('PDF téléchargé avec succès');
                    }
                  }}
                  disabled={!invoiceDocumentData}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6 bg-gray-50">
            {loadingDocument ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : invoiceDocumentData ? (
              <div className="flex justify-center">
                <CompanyDocumentLayout>
                  <InvoiceDocument data={invoiceDocumentData} />
                </CompanyDocumentLayout>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Erreur lors du chargement du document</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
