import { useState, useMemo } from "react";
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
  Download, 
  Eye, 
  MoreHorizontal,
  Printer,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Truck,
  Loader2,
  Send,
  Copy,
  Trash2,
  FileText,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useDeliveryNotes, type BonLivraison, type BonLivraisonLigne } from "@/hooks/use-delivery-notes";
import { useClients } from "@/hooks/use-clients";
import { useTaxes } from "@/hooks/use-taxes";
import { DeliveryNoteCreateModal, DeliveryNoteFormData } from "@/components/delivery-notes/DeliveryNoteCreateModal";
import { generateDocumentPDF } from "@/components/documents/DocumentPDF";
import type { InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  livre: "bg-success/10 text-success border-0",
  valide: "bg-info/10 text-info border-0",
  brouillon: "bg-muted/10 text-muted-foreground border-0",
  annule: "bg-destructive/10 text-destructive border-0",
};

const statusLabels: Record<string, string> = {
  livre: "Livré",
  valide: "Validé",
  brouillon: "Brouillon",
  annule: "Annulé",
};

export default function DeliveryNotes() {
  const { company } = useAuth();
  const { formatAmount } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const { bonsLivraison, loading, refreshBonsLivraison, createBonLivraison, updateBonLivraison, deleteBonLivraison, getLignes } = useDeliveryNotes();
  const { clients } = useClients();
  const { taxes, calculateTax } = useTaxes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<BonLivraison | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editDeliveryNoteData, setEditDeliveryNoteData] = useState<{
    id: string;
    clientId: string;
    date: string;
    reference: string;
    deliveryAddress: string;
    notes: string;
    lines: { id: string; description: string; quantity: number; unitPrice: number; taxRateId: string | null; unite?: string; }[];
  } | null>(null);

  // Créer un map des clients pour accès rapide
  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach(client => {
      map[client.id] = client.nom;
    });
    return map;
  }, [clients]);

  // Filtrer les bons de livraison
  const filteredDeliveryNotes = useMemo(() => {
    return bonsLivraison.filter((note) => {
      const matchesSearch = note.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientsMap[note.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || note.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bonsLivraison, searchTerm, statusFilter, clientsMap]);

  // Calculer les statistiques (pour l'instant, on ne peut pas calculer les totaux sans les lignes)
  // On utilisera 0 pour les montants car ils ne sont pas stockés dans la table principale
  const stats = useMemo(() => {
    const totalDeliveryNotes = bonsLivraison.length;
    const totalAmount = 0; // À calculer depuis les lignes si nécessaire
    const deliveredAmount = 0; // À calculer depuis les lignes si nécessaire
    const pendingAmount = 0; // À calculer depuis les lignes si nécessaire
    
    return { totalDeliveryNotes, totalAmount, deliveredAmount, pendingAmount };
  }, [bonsLivraison]);

  const handleViewDeliveryNote = (note: BonLivraison) => {
    setSelectedDeliveryNote(note);
    setIsViewModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedDeliveryNote) return;
    
    try {
      const client = clients.find(c => c.id === selectedDeliveryNote.client_id);
      if (!client) {
        toast.error("Client introuvable");
        return;
      }

      // Charger les lignes du bon de livraison
      const lignes = await getLignes(selectedDeliveryNote.id);

      const documentLines = lignes.map((ligne) => ({
        description: ligne.description || 'Article',
        quantity: ligne.quantite,
        unit_price: 0, // Les bons de livraison n'ont généralement pas de prix
        total_ht: 0,
      }));

      const deliveryNoteData: InvoiceDocumentData = {
        type: 'quote',
        number: selectedDeliveryNote.numero,
        date: selectedDeliveryNote.date_livraison,
        client: {
          name: client.nom,
          address: selectedDeliveryNote.adresse_livraison || client.adresse || null,
          tax_number: client.numero_fiscal || null,
        },
        lines: documentLines,
        total_ht: 0,
        discount: (selectedDeliveryNote as any).remise_montant || 0,
        discount_type: (selectedDeliveryNote as any).remise_type || null,
        discount_value: (selectedDeliveryNote as any).remise_valeur || 0,
        applied_taxes: [],
        total_ttc: 0,
        notes: selectedDeliveryNote.notes,
      };

      const pdfBlob = await generateDocumentPDF(deliveryNoteData, company || null);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bon-livraison-${selectedDeliveryNote.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleCreateDeliveryNote = () => {
    setEditDeliveryNoteData(null);
    setIsCreateModalOpen(true);
  };

  // Handler pour modifier un bon de livraison
  const handleEditDeliveryNote = async (note: BonLivraison) => {
    try {
      // Récupérer les lignes du bon de livraison
      const lignes = await getLignes(note.id);
      
      // Convertir les lignes pour le formulaire
      const formLines = lignes.map(ligne => ({
        id: ligne.id,
        description: ligne.description || '',
        quantity: ligne.quantite,
        unitPrice: 0, // Bon de livraison n'a pas de prix
        taxRateId: null,
        unite: ligne.unite || 'unité',
      }));

      setEditDeliveryNoteData({
        id: note.id,
        clientId: note.client_id,
        date: note.date_livraison,
        reference: note.numero,
        deliveryAddress: note.adresse_livraison || '',
        notes: note.notes || '',
        lines: formLines,
      });
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Error loading delivery note for edit:', error);
      toast.error('Erreur lors du chargement du bon de livraison');
    }
  };

  const handleSaveDeliveryNote = async (data: DeliveryNoteFormData) => {
    try {
      // Convertir les lignes pour le backend
      const lignes = data.lines.map((line, index) => ({
        description: line.description,
        quantite: line.quantity,
        unite: line.unite || 'unité',
        ordre: index,
      }));

      if (editDeliveryNoteData) {
        // Mode édition avec remise
        // Calculer la remise
        let discountAmount = 0;
        if (data.applyDiscount && data.discountValue > 0) {
          // Les BL n'ont pas de prix, mais on stocke quand même les infos de remise
          discountAmount = data.discountType === 'percentage' ? 0 : data.discountValue;
        }

        await updateBonLivraison(editDeliveryNoteData.id, {
          date_livraison: data.date,
          client_id: data.clientId,
          adresse_livraison: data.deliveryAddress || null,
          notes: data.notes || null,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
        }, lignes);
        
        setIsCreateModalOpen(false);
        setEditDeliveryNoteData(null);
        toast.success("Bon de livraison modifié avec succès");
      } else {
        // Mode création avec remise
        let discountAmount = 0;
        if (data.applyDiscount && data.discountValue > 0) {
          discountAmount = data.discountType === 'percentage' ? 0 : data.discountValue;
        }

        const bonLivraisonData = {
          numero: data.reference || '',
          date_livraison: data.date,
          client_id: data.clientId,
          adresse_livraison: data.deliveryAddress || null,
          notes: data.notes || null,
          remise_type: data.applyDiscount && data.discountValue > 0 ? data.discountType : null,
          remise_valeur: data.discountValue || 0,
          remise_montant: discountAmount,
        };

        await createBonLivraison(bonLivraisonData, lignes);
        
        setIsCreateModalOpen(false);
        toast.success("Bon de livraison créé avec succès");
      }
      
      await refreshBonsLivraison();
    } catch (error) {
      console.error("Error saving delivery note:", error);
      toast.error(editDeliveryNoteData ? "Erreur lors de la modification" : "Erreur lors de la création du bon de livraison");
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
                  <p className="text-sm font-medium text-muted-foreground">Total bons</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalDeliveryNotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Truck className="w-5 h-5 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground">Livrés</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {formatAmount(stats.deliveredAmount)}
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
                <SelectItem value="valide">Validé</SelectItem>
                <SelectItem value="livre">Livré</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateDeliveryNote}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau bon de livraison
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
                      <TableHead className="font-semibold">N° Bon de livraison</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Adresse</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="w-32 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveryNotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun bon de livraison trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeliveryNotes.map((note) => (
                        <TableRow key={note.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{note.numero}</span>
                            </div>
                          </TableCell>
                          <TableCell>{clientsMap[note.client_id] || "Client inconnu"}</TableCell>
                          <TableCell>{new Date(note.date_livraison).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {note.adresse_livraison || "-"}
                          </TableCell>
                          <TableCell>
                            <span className={cn("erp-badge text-xs", statusStyles[note.statut] || statusStyles.brouillon)}>
                              {statusLabels[note.statut] || note.statut}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewDeliveryNote(note)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={async () => {
                                  try {
                                    const client = clients.find(c => c.id === note.client_id);
                                    if (!client) {
                                      toast.error("Client introuvable");
                                      return;
                                    }

                                    const lignes = await getLignes(note.id);

                                    const documentLines = lignes.map((ligne) => ({
                                      description: ligne.description || 'Article',
                                      quantity: ligne.quantite,
                                      unit_price: 0,
                                      total_ht: 0,
                                    }));

                                    const deliveryNoteData: InvoiceDocumentData = {
                                      type: 'quote',
                                      number: note.numero,
                                      date: note.date_livraison,
                                      client: {
                                        name: client.nom,
                                        address: note.adresse_livraison || client.adresse || null,
                                        tax_number: client.numero_fiscal || null,
                                      },
                                      lines: documentLines,
                                      total_ht: 0,
                                      applied_taxes: [],
                                      total_ttc: 0,
                                      notes: note.notes,
                                    };

                                    const pdfBlob = await generateDocumentPDF(deliveryNoteData, company || null);
                                    const url = URL.createObjectURL(pdfBlob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `bon-livraison-${note.numero}.pdf`;
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
                                    onClick={() => handleViewDeliveryNote(note)}
                                    className="gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Voir le bon
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditDeliveryNote(note)}
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => toast.info('Fonctionnalité à venir : Convertir en facture')}
                                    className="gap-2"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Convertir en facture
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => toast.info('Fonctionnalité à venir : Dupliquer')}
                                    className="gap-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Dupliquer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => toast.info('Fonctionnalité à venir : Envoyer par email')}
                                    className="gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Envoyer par email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={async () => {
                                      if (confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ?')) {
                                        try {
                                          await deleteBonLivraison(note.id);
                                          toast.success('Bon de livraison supprimé');
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

      {/* Modal pour créer/modifier un bon de livraison */}
      <DeliveryNoteCreateModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditDeliveryNoteData(null);
        }}
        onSave={handleSaveDeliveryNote}
        editData={editDeliveryNoteData}
      />

      {/* Modal pour voir un bon de livraison existant */}
      {/* TODO: Créer une page Preview Document avec CompanyDocumentLayout */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedDeliveryNote?.numero}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleDownloadPDF}
                  disabled={!selectedDeliveryNote}
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
