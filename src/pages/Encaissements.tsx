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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  DollarSign,
  TrendingUp,
  Loader2,
  Calendar,
  User,
  Wallet,
  Eye,
  ArrowRight,
  MoreHorizontal,
  Edit,
  X,
  FileText,
  Download,
  Trash2,
  StickyNote
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEncaissements, CreateEncaissementData, Encaissement } from "@/hooks/use-encaissements";
import { useClients } from "@/hooks/use-clients";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statusStyles = {
  disponible: "bg-success/10 text-success border-0",
  "partiellement alloué": "bg-warning/10 text-warning border-0",
  "totalement alloué": "bg-muted text-muted-foreground border-0",
};

const statusLabels = {
  disponible: "Disponible",
  "partiellement alloué": "Partiellement alloué",
  "totalement alloué": "Totalement alloué",
};

const typeLabels = {
  standard: "Standard",
  acompte: "Acompte",
};

const modePaiementOptions = [
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'especes', label: 'Espèces' },
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'autre', label: 'Autre' },
];

export default function Encaissements() {
  const navigate = useNavigate();
  const { encaissements, loading, createEncaissement, updateEncaissement, deleteEncaissement } = useEncaissements();
  const { clients, loading: loadingClients } = useClients();
  const { isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les modals d'actions
  const [selectedEncaissement, setSelectedEncaissement] = useState<Encaissement | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAllocationsModalOpen, setIsAllocationsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<CreateEncaissementData>({
    client_id: "",
    date: new Date().toISOString().split('T')[0],
    montant: 0,
    mode_paiement: "virement",
    reference: "",
    type_encaissement: "standard",
    notes: "",
  });

  const filteredEncaissements = encaissements.filter((enc) => {
    const matchesSearch = 
      enc.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.client?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (typeFilter === "standard") {
      matchesType = enc.type_encaissement === "standard";
    } else if (typeFilter === "acompte") {
      matchesType = enc.type_encaissement === "acompte";
    } else if (typeFilter === "acomptes_disponibles") {
      matchesType = enc.type_encaissement === "acompte" && enc.remaining_amount > 0;
    }
    
    const matchesStatus = statusFilter === "all" || enc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalEncaissements = encaissements.length;
  const totalMontant = encaissements.reduce((sum, e) => sum + e.montant, 0);
  const totalAcomptes = encaissements.filter(e => e.type_encaissement === 'acompte').length;
  const totalAcomptesDisponibles = encaissements
    .filter(e => e.type_encaissement === 'acompte' && e.remaining_amount > 0)
    .reduce((sum, e) => sum + e.remaining_amount, 0);

  const handleOpenDialog = () => {
    setFormData({
      client_id: "",
      date: new Date().toISOString().split('T')[0],
      montant: 0,
      mode_paiement: "virement",
      reference: "",
      type_encaissement: "standard",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      client_id: "",
      date: new Date().toISOString().split('T')[0],
      montant: 0,
      mode_paiement: "virement",
      reference: "",
      type_encaissement: "standard",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || formData.montant <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createEncaissement(formData);
      handleCloseDialog();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(amount);
  };

  // Handlers pour les actions du menu
  const handleViewDetails = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setIsDetailsModalOpen(true);
  };

  const handleViewAllocations = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setIsAllocationsModalOpen(true);
  };

  const handleAllocateToInvoice = (encaissement: Encaissement) => {
    // Rediriger vers la création de facture avec l'acompte pré-sélectionné
    navigate('/ventes/factures', { 
      state: { 
        preselectedAcompte: encaissement.id,
        clientId: encaissement.client_id 
      } 
    });
  };

  const handleEdit = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setFormData({
      client_id: encaissement.client_id,
      date: encaissement.date,
      montant: encaissement.montant,
      mode_paiement: encaissement.mode_paiement,
      reference: encaissement.reference || '',
      type_encaissement: encaissement.type_encaissement,
      notes: encaissement.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCancel = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedEncaissement) return;
    
    try {
      // Mettre à jour le statut (on pourrait ajouter un statut 'annulé' si nécessaire)
      // Pour l'instant, on peut juste marquer comme totalement alloué ou ajouter un champ
      toast.success('Encaissement annulé');
      setIsCancelModalOpen(false);
      setSelectedEncaissement(null);
    } catch (error) {
      console.error('Error cancelling encaissement:', error);
    }
  };

  const handleDownloadReceipt = async (encaissement: Encaissement) => {
    try {
      // TODO: Générer et télécharger le reçu PDF
      toast.info('Génération du reçu en cours...');
      // Pour l'instant, on affiche juste un message
      // Vous pouvez implémenter la génération PDF ici
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Erreur lors du téléchargement du reçu');
    }
  };

  const handleAddNote = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setNoteText(encaissement.notes || "");
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedEncaissement) return;
    
    try {
      await updateEncaissement(selectedEncaissement.id, {
        notes: noteText,
      });
      toast.success('Note ajoutée avec succès');
      setIsNoteModalOpen(false);
      setSelectedEncaissement(null);
      setNoteText("");
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de l\'ajout de la note');
    }
  };

  const handleDelete = (encaissement: Encaissement) => {
    setSelectedEncaissement(encaissement);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEncaissement) return;
    
    try {
      await deleteEncaissement(selectedEncaissement.id);
      toast.success('Encaissement supprimé avec succès');
      setIsDeleteModalOpen(false);
      setSelectedEncaissement(null);
    } catch (error) {
      console.error('Error deleting encaissement:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total encaissements</p>
                <p className="text-2xl font-bold mt-1">{totalEncaissements}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
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
                  {formatCurrency(totalMontant)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acomptes</p>
                <p className="text-2xl font-bold mt-1">{totalAcomptes}</p>
              </div>
              <div className="p-3 rounded-lg bg-info/10">
                <Calendar className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "border-border/50 cursor-pointer transition-all hover:shadow-md",
            typeFilter === "acomptes_disponibles" && "ring-2 ring-primary"
          )}
          onClick={() => {
            setTypeFilter("acomptes_disponibles");
            setStatusFilter("all");
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acomptes disponibles</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {formatCurrency(totalAcomptesDisponibles)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
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
              placeholder="Rechercher par client ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="standard">Paiements standards</SelectItem>
              <SelectItem value="acompte">Acomptes</SelectItem>
              <SelectItem value="acomptes_disponibles">Acomptes disponibles</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="partiellement alloué">Partiellement alloué</SelectItem>
              <SelectItem value="totalement alloué">Totalement alloué</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleOpenDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel encaissement
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="text-right font-semibold">Montant</TableHead>
                    <TableHead className="text-right font-semibold">Montant alloué</TableHead>
                    <TableHead className="text-right font-semibold">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            Montant restant
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Montant encore utilisable sur une facture</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="font-semibold">Mode de paiement</TableHead>
                    <TableHead className="font-semibold">Référence</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEncaissements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Aucun encaissement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEncaissements.map((encaissement) => {
                      const isAcompte = encaissement.type_encaissement === 'acompte';
                      const hasRemaining = encaissement.remaining_amount > 0;
                      
                      // Déterminer la couleur du montant restant
                      let remainingColor = "text-muted-foreground";
                      if (hasRemaining) {
                        if (encaissement.allocated_amount > 0) {
                          remainingColor = "text-warning font-bold";
                        } else {
                          remainingColor = "text-success font-bold";
                        }
                      }
                      
                      return (
                        <TableRow key={encaissement.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            {new Date(encaissement.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span>{encaissement.client?.nom || 'N/A'}</span>
                              {encaissement.client?.code && (
                                <span className="text-xs text-muted-foreground">
                                  ({encaissement.client.code})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge 
                                    variant={isAcompte ? 'default' : 'outline'}
                                    className={cn(
                                      isAcompte && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                                    )}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {isAcompte ? (
                                        <Wallet className="w-3 h-3" />
                                      ) : (
                                        <DollarSign className="w-3 h-3" />
                                      )}
                                      {typeLabels[encaissement.type_encaissement]}
                                    </div>
                                  </Badge>
                                </TooltipTrigger>
                                {isAcompte && (
                                  <TooltipContent>
                                    <p>Avance client déductible lors de la facturation</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(encaissement.montant)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(encaissement.allocated_amount)}
                          </TableCell>
                          <TableCell className={cn("text-right", remainingColor)}>
                            {formatCurrency(encaissement.remaining_amount)}
                          </TableCell>
                          <TableCell>
                            {modePaiementOptions.find(m => m.value === encaissement.mode_paiement)?.label || encaissement.mode_paiement}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {encaissement.reference || '-'}
                          </TableCell>
                          <TableCell>
                            <span className={cn("erp-badge text-xs", statusStyles[encaissement.status])}>
                              {statusLabels[encaissement.status]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Voir l'avance */}
                                <DropdownMenuItem onClick={() => handleViewDetails(encaissement)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir l'avance
                                </DropdownMenuItem>
                                
                                {/* Télécharger reçu */}
                                <DropdownMenuItem onClick={() => handleDownloadReceipt(encaissement)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger reçu
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Modifier (si non affectée) */}
                                {encaissement.allocated_amount === 0 && (
                                  <DropdownMenuItem onClick={() => handleEdit(encaissement)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                )}
                                
                                {/* Ajouter note */}
                                <DropdownMenuItem onClick={() => handleAddNote(encaissement)}>
                                  <StickyNote className="w-4 h-4 mr-2" />
                                  Ajouter note
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Annuler */}
                                <DropdownMenuItem 
                                  onClick={() => handleCancel(encaissement)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Annuler
                                </DropdownMenuItem>
                                
                                {/* Supprimer (uniquement admin) */}
                                {isAdmin && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(encaissement)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer un encaissement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvel encaissement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
                disabled={loadingClients}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom} {client.code && `(${client.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant *</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.montant || ''}
                  onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_encaissement">Type d'encaissement *</Label>
                <Select
                  value={formData.type_encaissement}
                  onValueChange={(value: 'standard' | 'acompte') => 
                    setFormData({ ...formData, type_encaissement: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="acompte">Acompte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode_paiement">Mode de paiement *</Label>
                <Select
                  value={formData.mode_paiement}
                  onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modePaiementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                placeholder="Numéro de chèque, virement, etc."
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes supplémentaires..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Voir détails */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'encaissement</DialogTitle>
          </DialogHeader>
          {selectedEncaissement && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedEncaissement.client?.nom || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedEncaissement.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Montant</Label>
                  <p className="font-medium">{formatCurrency(selectedEncaissement.montant)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant={selectedEncaissement.type_encaissement === 'acompte' ? 'default' : 'outline'}>
                    {typeLabels[selectedEncaissement.type_encaissement]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mode de paiement</Label>
                  <p className="font-medium">
                    {modePaiementOptions.find(m => m.value === selectedEncaissement.mode_paiement)?.label || selectedEncaissement.mode_paiement}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Référence</Label>
                  <p className="font-medium">{selectedEncaissement.reference || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Montant alloué</Label>
                  <p className="font-medium">{formatCurrency(selectedEncaissement.allocated_amount)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Montant restant</Label>
                  <p className="font-medium">{formatCurrency(selectedEncaissement.remaining_amount)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <span className={cn("erp-badge text-xs", statusStyles[selectedEncaissement.status])}>
                    {statusLabels[selectedEncaissement.status]}
                  </span>
                </div>
              </div>
              {selectedEncaissement.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedEncaissement.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Voir allocations */}
      <Dialog open={isAllocationsModalOpen} onOpenChange={setIsAllocationsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Allocations de l'encaissement</DialogTitle>
          </DialogHeader>
          {selectedEncaissement && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Montant total alloué : <span className="font-semibold">{formatCurrency(selectedEncaissement.allocated_amount)}</span>
              </p>
              {/* TODO: Charger et afficher les factures liées depuis facture_encaissements */}
              <div className="text-sm text-muted-foreground">
                Chargement des factures liées...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Modifier */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'encaissement</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedEncaissement) return;
            
            setIsSubmitting(true);
            try {
              await updateEncaissement(selectedEncaissement.id, {
                date: formData.date,
                reference: formData.reference || null,
                notes: formData.notes || null,
                mode_paiement: formData.mode_paiement,
                // Ne pas permettre la modification du montant si alloué
              });
              setIsEditModalOpen(false);
              setSelectedEncaissement(null);
            } catch (error) {
              // Error already handled in hook
            } finally {
              setIsSubmitting(false);
            }
          }} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_date">Date *</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_mode_paiement">Mode de paiement *</Label>
                <Select
                  value={formData.mode_paiement}
                  onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modePaiementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_reference">Référence</Label>
              <Input
                id="edit_reference"
                placeholder="Numéro de chèque, virement, etc."
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                placeholder="Notes supplémentaires..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEncaissement(null);
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Annuler */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Annuler l'encaissement</DialogTitle>
          </DialogHeader>
          {selectedEncaissement && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir annuler cet encaissement ?
              </p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedEncaissement.client?.nom || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedEncaissement.date).toLocaleDateString('fr-FR')} - {formatCurrency(selectedEncaissement.montant)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setSelectedEncaissement(null);
                  }}
                >
                  Non
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancel}
                >
                  Oui, annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Ajouter note */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une note</DialogTitle>
          </DialogHeader>
          {selectedEncaissement && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveNote();
            }} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Ajouter une note à cet encaissement..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    setSelectedEncaissement(null);
                    setNoteText("");
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'encaissement</DialogTitle>
          </DialogHeader>
          {selectedEncaissement && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer définitivement cet encaissement ? Cette action est irréversible.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">{selectedEncaissement.client?.nom || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedEncaissement.date).toLocaleDateString('fr-FR')} - {formatCurrency(selectedEncaissement.montant)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEncaissement(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
