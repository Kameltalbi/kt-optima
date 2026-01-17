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
  Loader2,
  Copy,
  Send,
  Trash2,
  Edit
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
  const { factures, loading, refreshFactures, createFacture, updateFacture, deleteFacture, getLignes } = useFacturesVentes();
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
  const [editInvoiceData, setEditInvoiceData] = useState<{
    id: string;
    clientId: string;
    date: string;
    reference: string;
    notes: string;
    lines: { id: string; description: string; quantity: number; unitPrice: number; taxRateId: string | null; }[];
  } | null>(null);

  // Créer un map des clients pour accès rapide
  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach(client => {
      map[client.id] = client.nom;
    });
    return map;
  }, [clients]);

  // Filtrer les factures (factures standard + factures d'acompte validées uniquement)
  const filteredInvoices = useMemo(() => {
    return factures.filter((invoice) => {
      // Inclure toutes les factures standard
      // Inclure uniquement les factures d'acompte validées (statut = 'validee' ou 'payee')
      const isStandard = !invoice.type_facture || invoice.type_facture === 'standard';
      const isAcompteValidee = invoice.type_facture === 'acompte' && 
        (invoice.statut === 'validee' || invoice.statut === 'payee');
      
      if (!isStandard && !isAcompteValidee) {
        return false; // Exclure les factures d'acompte en brouillon
      }
      
      const matchesSearch = invoice.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientsMap[invoice.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [factures, searchTerm, statusFilter, clientsMap]);

  // Calculer les statistiques (factures standard + factures d'acompte validées uniquement)
  const stats = useMemo(() => {
    const facturesAInclure = factures.filter(inv => {
      const isStandard = !inv.type_facture || inv.type_facture === 'standard';
      const isAcompteValidee = inv.type_facture === 'acompte' && 
        (inv.statut === 'validee' || inv.statut === 'payee');
      return isStandard || isAcompteValidee;
    });
    
    const totalInvoices = facturesAInclure.length;
    const totalAmount = facturesAInclure.reduce((sum, inv) => sum + inv.montant_ttc, 0);
    const paidAmount = facturesAInclure
      .filter(inv => inv.statut === "payee")
      .reduce((sum, inv) => sum + inv.montant_ttc, 0);
    const pendingAmount = facturesAInclure
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

      // Récupérer les factures d'acompte déduites (via facture_acompte_allocations)
      let acomptesDeduits: Array<{ facture_numero: string; montant: number }> = [];
      if (invoice.facture_parent_id) {
        // Si cette facture est liée à une facture d'acompte, récupérer l'info
        const { data: factureAcompte, error: acompteError } = await supabase
          .from('factures_ventes')
          .select('numero, montant_ttc')
          .eq('id', invoice.facture_parent_id)
          .single();

        if (!acompteError && factureAcompte) {
          acomptesDeduits.push({
            facture_numero: factureAcompte.numero,
            montant: factureAcompte.montant_ttc,
          });
        }
      } else {
        // Sinon, chercher les allocations d'acomptes
        const { data: allocations, error: allocError } = await supabase
          .from('facture_acompte_allocations')
          .select(`
            montant_alloue,
            facture_acompte:factures_ventes!facture_acompte_id(numero)
          `)
          .eq('facture_finale_id', invoice.id);

        if (!allocError && allocations) {
          acomptesDeduits = allocations.map(alloc => ({
            facture_numero: (alloc.facture_acompte as any)?.numero || '',
            montant: alloc.montant_alloue,
          }));
        }
      }

      // Construire les données du document
      const data: InvoiceDocumentData = {
        type: 'invoice',
        number: invoice.numero,
        date: invoice.date_facture,
        client: {
          name: client.nom,
          address: client.adresse || null,
          tax_number: client.numero_fiscal || null,
        },
        lines: documentLines,
        total_ht: invoice.montant_ht,
        applied_taxes: appliedTaxes,
        fiscal_stamp: invoice.montant_ttc > 0 ? 1 : 0,
        total_ttc: invoice.montant_ttc,
        notes: invoice.notes,
        acomptes_deduits: acomptesDeduits.length > 0 ? acomptesDeduits : undefined,
        montant_restant: invoice.montant_restant,
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
    setEditInvoiceData(null);
    setIsCreateModalOpen(true);
  };

  // Handler pour ouvrir le modal en mode édition
  const handleEditInvoice = async (invoice: FactureVente) => {
    try {
      // Récupérer les lignes de la facture
      const lignes = await getLignes(invoice.id);
      
      // Trouver la taxe par défaut (TVA) pour les lignes
      const defaultTax = taxes.find(t => t.type === 'percentage' && t.enabled);
      
      // Convertir les lignes pour le formulaire
      const formLines = lignes.map(ligne => ({
        id: ligne.id,
        description: ligne.description || '',
        quantity: ligne.quantite,
        unitPrice: ligne.prix_unitaire,
        taxRateId: ligne.taux_tva && ligne.taux_tva > 0 
          ? (taxes.find(t => t.type === 'percentage' && t.value === ligne.taux_tva)?.id || defaultTax?.id || null)
          : null,
      }));

      setEditInvoiceData({
        id: invoice.id,
        clientId: invoice.client_id,
        date: invoice.date_facture,
        reference: invoice.numero,
        notes: invoice.notes || '',
        lines: formLines,
      });
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Error loading invoice for edit:', error);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  // Handler pour le nouveau modal InvoiceCreateModal
  const handleSaveInvoice = async (data: InvoiceFormData, acomptesAllocations?: { encaissements: any[], factures_acompte: any[] }) => {
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
        const lineTotalHT = line.quantity * line.unitPrice;
        let tauxTVA = 0;

        // Utiliser la taxe sélectionnée pour la ligne (si c'est une taxe en pourcentage)
        if (line.taxRateId) {
          const tax = taxes.find(t => t.id === line.taxRateId);
          if (tax && tax.type === 'percentage') {
            tauxTVA = tax.value;
          }
        }

        // Calculer la TVA et TTC pour la ligne (sinon la facture reste avec TVA = 0)
        const montantTVA = (lineTotalHT * tauxTVA) / 100;
        const montantTTC = lineTotalHT + montantTVA;

        return {
          description: line.description,
          quantite: line.quantity,
          prix_unitaire: line.unitPrice,
          taux_tva: tauxTVA,
          montant_ht: lineTotalHT,
          montant_tva: montantTVA,
          montant_ttc: montantTTC,
          ordre: index,
        };
      });

      // Mode édition ou création
      if (editInvoiceData) {
        // Supprimer les anciennes lignes et ajouter les nouvelles
        await supabase
          .from('facture_vente_lignes')
          .delete()
          .eq('facture_vente_id', editInvoiceData.id);

        // Insérer les nouvelles lignes
        if (lignes.length > 0) {
          await supabase
            .from('facture_vente_lignes')
            .insert(lignes.map(l => ({
              ...l,
              facture_vente_id: editInvoiceData.id,
            })));
        }

        // Calculer les totaux
        const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
        const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
        const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

        // Mettre à jour la facture avec la remise
        await updateFacture(editInvoiceData.id, {
          date_facture: data.date,
          client_id: data.clientId,
          notes: data.notes || null,
          montant_ht,
          montant_tva,
          montant_ttc,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
        });

        setIsCreateModalOpen(false);
        setEditInvoiceData(null);
        toast.success("Facture modifiée avec succès");
      } else {
        // Créer la facture via le hook avec la remise et l'acompte
        const factureData = {
          numero: data.reference || '', // Le numéro sera généré automatiquement
          date_facture: data.date,
          client_id: data.clientId,
          notes: data.notes || null,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
          // Champs acompte
          acompte_valeur: data.hasAcompte && data.acompteValue > 0 ? data.acompteValue : undefined,
          acompte_type: data.hasAcompte && data.acompteValue > 0 ? data.acompteType : undefined,
          devis_id: data.devisId || null,
        };

        // Convertir les allocations au format attendu par le hook
        const acomptesAlloues = {
          encaissements: (acomptesAllocations?.encaissements || []).map(alloc => ({
            encaissement_id: alloc.encaissement_id,
            montant_alloue: alloc.montant_alloue,
          })),
          factures_acompte: (acomptesAllocations?.factures_acompte || []).map(alloc => ({
            facture_acompte_id: alloc.facture_acompte_id,
            montant_alloue: alloc.montant_alloue,
          })),
        };

        await createFacture(factureData, lignes, acomptesAlloues);
        
        setIsCreateModalOpen(false);
        toast.success("Facture créée avec succès");
      }
      
      // Rafraîchir la liste des factures
      await refreshFactures();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(editInvoiceData ? "Erreur lors de la modification de la facture" : "Erreur lors de la création de la facture");
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
                              {invoice.type_facture === 'acompte' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                                  FA
                                </span>
                              )}
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
                                        tax_number: client.numero_fiscal || null,
                                      },
                                      lines: documentLines,
                                      total_ht: invoice.montant_ht,
                                      discount: (invoice as any).remise_montant || 0,
                                      discount_type: (invoice as any).remise_type || null,
                                      discount_value: (invoice as any).remise_valeur || 0,
                                      applied_taxes: appliedTaxes,
                                      fiscal_stamp: invoice.montant_ttc > 0 ? 1 : 0, // Timbre fiscal 1 TND
                                      total_ttc: invoice.montant_ttc,
                                      notes: invoice.notes,
                                    };

                                    const pdfBlob = await generateInvoicePDF(invoiceData, company || null);
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    onClick={() => handleViewInvoice(invoice)}
                                    className="gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir la facture
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditInvoice(invoice)}
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      toast.info('Fonctionnalité à venir : Dupliquer');
                                    }}
                                    className="gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Dupliquer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      toast.info('Fonctionnalité à venir : Envoyer par email');
                                    }}
                                    className="gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Envoyer par email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={async () => {
                                      if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
                                        try {
                                          await deleteFacture(invoice.id);
                                          toast.success('Facture supprimée');
                                        } catch (error) {
                                          toast.error('Erreur lors de la suppression');
                                        }
                                      }
                                    }}
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour créer/modifier une facture */}
      <InvoiceCreateModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditInvoiceData(null);
        }}
        onSave={handleSaveInvoice}
        editData={editInvoiceData}
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
                  onClick={async () => {
                    if (invoiceDocumentData) {
                      const pdfBlob = await generateInvoicePDF(invoiceDocumentData, company || null);
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
