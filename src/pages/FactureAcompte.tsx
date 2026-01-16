import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  Trash2,
  DollarSign,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useFacturesVentes, type FactureVente } from "@/hooks/use-factures-ventes";
import { InvoiceAcompteCreateModal, InvoiceAcompteFormData } from "@/components/invoices/InvoiceAcompteCreateModal";
import { useTaxes } from "@/hooks/use-taxes";
import { useClients } from "@/hooks/use-clients";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

export default function FactureAcompte() {
  const { factures, loading, createFacture, updateFacture, getLignes, refreshFactures } = useFacturesVentes();
  const { taxes } = useTaxes();
  const { clients } = useClients();
  const { company } = useAuth();
  const { formatAmount } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editAcompteData, setEditAcompteData] = useState<{
    id: string;
    clientId: string;
    date: string;
    reference: string;
    notes: string;
    lines: { id: string; description: string; quantity: number; unitPrice: number; taxRateId: string | null; }[];
  } | null>(null);

  // Filtrer pour n'afficher que les factures d'acompte
  const facturesAcompte = useMemo(() => {
    return factures.filter(f => f.type_facture === 'acompte');
  }, [factures]);

  // Créer un map des clients pour accès rapide
  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach(client => {
      map[client.id] = client.nom;
    });
    return map;
  }, [clients]);

  // Filtrer les factures d'acompte
  const filteredFactures = useMemo(() => {
    return facturesAcompte.filter((facture) => {
      const matchesSearch = facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientsMap[facture.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [facturesAcompte, searchTerm, clientsMap]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalFactures = facturesAcompte.length;
    const totalAmount = facturesAcompte.reduce((sum, f) => sum + f.montant_ttc, 0);
    const paidAmount = facturesAcompte
      .filter(f => f.statut === 'payee')
      .reduce((sum, f) => sum + f.montant_ttc, 0);
    
    return { totalFactures, totalAmount, paidAmount };
  }, [facturesAcompte]);

  const handleOpenDialog = () => {
    setEditAcompteData(null);
    setIsDialogOpen(true);
  };

  // Handler pour modifier une facture d'acompte
  const handleEditAcompte = async (facture: FactureVente) => {
    try {
      // Récupérer les lignes de la facture
      const lignes = await getLignes(facture.id);
      
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

      setEditAcompteData({
        id: facture.id,
        clientId: facture.client_id,
        date: facture.date_facture,
        reference: facture.numero,
        notes: facture.notes || '',
        lines: formLines,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error loading facture acompte for edit:', error);
      toast.error('Erreur lors du chargement de la facture d\'acompte');
    }
  };

  const handleSaveFactureAcompte = async (data: InvoiceAcompteFormData) => {
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

        // Calculer le montant TVA pour cette ligne
        const montantTVA = (lineTotal * tauxTVA) / 100;
        const montantTTC = lineTotal + montantTVA;

        return {
          description: line.description,
          quantite: line.quantity,
          prix_unitaire: line.unitPrice,
          taux_tva: tauxTVA,
          montant_ht: lineTotal,
          montant_tva: montantTVA,
          montant_ttc: montantTTC,
          ordre: index,
        };
      });

      if (editAcompteData) {
        // Mode édition
        // Supprimer les anciennes lignes et ajouter les nouvelles
        await supabase
          .from('facture_vente_lignes')
          .delete()
          .eq('facture_vente_id', editAcompteData.id);

        // Insérer les nouvelles lignes
        if (lignes.length > 0) {
          await supabase
            .from('facture_vente_lignes')
            .insert(lignes.map(l => ({
              ...l,
              facture_vente_id: editAcompteData.id,
            })));
        }

        // Calculer les totaux
        const montant_ht = lignes.reduce((sum, l) => sum + l.montant_ht, 0);
        const montant_tva = lignes.reduce((sum, l) => sum + l.montant_tva, 0);
        const montant_ttc = lignes.reduce((sum, l) => sum + l.montant_ttc, 0);

        // Mettre à jour la facture
        await updateFacture(editAcompteData.id, {
          date_facture: data.date,
          client_id: data.clientId,
          notes: data.notes || null,
          montant_ht,
          montant_tva,
          montant_ttc,
        });

        setIsDialogOpen(false);
        setEditAcompteData(null);
        toast.success("Facture d'acompte modifiée avec succès");
      } else {
        // Mode création
        const factureData = {
          numero: data.reference || '',
          date_facture: data.date,
          client_id: data.clientId,
          type_facture: 'acompte' as const,
          notes: data.notes || null,
        };

        await createFacture(factureData, lignes, []);
        
        setIsDialogOpen(false);
        toast.success("Facture d'acompte créée avec succès");
      }
      
      // Rafraîchir la liste des factures
      await refreshFactures();
    } catch (error) {
      console.error("Error saving invoice acompte:", error);
      toast.error(editAcompteData ? "Erreur lors de la modification" : "Erreur lors de la création de la facture d'acompte");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Factures d'acompte</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion des avances clients formalisées
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture d'acompte
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            À propos des factures d'acompte
          </CardTitle>
          <CardDescription>
            Les factures d'acompte représentent des avances clients qui seront déductibles sur les factures finales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Elles ne génèrent pas de chiffre d'affaires final</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Elles créent un crédit client disponible pour déduction</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Lors du paiement, un encaissement de type "acompte" est automatiquement créé</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total factures</p>
                <p className="text-2xl font-bold mt-1">{stats.totalFactures}</p>
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
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
                  {filteredFactures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune facture d'acompte trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFactures.map((facture) => (
                      <TableRow key={facture.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{facture.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>{clientsMap[facture.client_id] || "Client inconnu"}</TableCell>
                        <TableCell>{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(facture.montant_ht)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(facture.montant_tva)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(facture.montant_ttc)}
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[facture.statut || 'brouillon'])}>
                            {statusLabels[facture.statut || 'brouillon']}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => toast.info('Fonctionnalité à venir : Voir le détail')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => handleEditAcompte(facture)}
                                  className="gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => toast.info('Fonctionnalité à venir : Supprimer')}
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

      {/* Modal pour créer/modifier une facture d'acompte */}
      <InvoiceAcompteCreateModal
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditAcompteData(null);
        }}
        onSave={handleSaveFactureAcompte}
        editData={editAcompteData}
      />
    </div>
  );
}
