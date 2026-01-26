import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  PackageCheck, 
  Eye, 
  X,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Package,
  ShoppingCart,
  Info,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ReceptionLine {
  id: number;
  produitId: string;
  produitNom: string;
  quantiteCommandee: number;
  quantiteDejaRecue: number;
  quantiteRestante: number;
  quantiteRecue: number;
  unite: string;
  ecart: number;
  commentaire: string;
}

interface PurchaseOrderLine {
  id: string;
  produitId: string;
  produitNom: string;
  quantiteCommandee: number;
  quantiteDejaRecue: number;
  quantiteRestante: number;
  unite: string;
}

interface PurchaseOrder {
  id: string;
  number: string;
  fournisseurId: string;
  fournisseurNom: string;
  date: string;
  lignes: PurchaseOrderLine[];
}

interface Reception {
  id: string;
  numero: string;
  dateReception: string;
  fournisseurId: string;
  fournisseurNom: string;
  bonCommandeId: string;
  bonCommandeNumero: string;
  entrepotId: string;
  entrepotNom: string;
  statut: 'draft' | 'partial' | 'complete' | 'closed';
  lignes: ReceptionLine[];
  pieceJointe?: string;
  notes?: string;
}

const supplierNames: Record<string, string> = {};

const entrepots = [
  { id: "1", nom: "Entrepôt Principal" },
  { id: "2", nom: "Entrepôt Secondaire" },
  { id: "3", nom: "Dépôt Casablanca" },
];

const statusStyles = {
  draft: "bg-muted/10 text-muted-foreground border-0",
  partial: "bg-warning/10 text-warning border-0",
  complete: "bg-success/10 text-success border-0",
  closed: "bg-info/10 text-info border-0",
};

const statusLabels = {
  draft: "Brouillon",
  partial: "Partielle",
  complete: "Complète",
  closed: "Clôturée",
};

export default function Receptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReception, setSelectedReception] = useState<Reception | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [purchaseOrders] = useState<PurchaseOrder[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Reception>>({
    numero: "",
    dateReception: new Date().toISOString().split('T')[0],
    fournisseurId: "",
    bonCommandeId: "",
    entrepotId: "",
    statut: "draft",
    lignes: [],
  });

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const filteredReceptions = receptions.filter((reception) => {
    const matchesSearch = reception.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reception.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reception.bonCommandeNumero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || reception.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReceptions = receptions.length;
  const completeReceptions = receptions.filter(r => r.statut === "complete").length;
  const partialReceptions = receptions.filter(r => r.statut === "partial").length;

  const handleViewReception = (reception: Reception) => {
    setSelectedReception(reception);
    setIsViewModalOpen(true);
  };

  const handleCreateReception = () => {
    setFormData({
      numero: `REC-${new Date().getFullYear()}-${String(receptions.length + 1).padStart(3, '0')}`,
      dateReception: new Date().toISOString().split('T')[0],
      fournisseurId: "",
      bonCommandeId: "",
      entrepotId: "",
      statut: "draft",
      lignes: [],
    });
    setSelectedPurchaseOrder(null);
    setIsCreateModalOpen(true);
  };

  const handleSelectPurchaseOrder = (orderId: string) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedPurchaseOrder(order);
      setFormData({
        ...formData,
        bonCommandeId: order.id,
        bonCommandeNumero: order.number,
        fournisseurId: order.fournisseurId,
        fournisseurNom: order.fournisseurNom,
        lignes: order.lignes.map((ligne, index) => ({
          id: index + 1,
          produitId: ligne.produitId,
          produitNom: ligne.produitNom,
          quantiteCommandee: ligne.quantiteCommandee,
          quantiteDejaRecue: ligne.quantiteDejaRecue,
          quantiteRestante: ligne.quantiteRestante,
          quantiteRecue: 0,
          unite: ligne.unite,
          ecart: 0,
          commentaire: "",
        })),
      });
    }
  };

  const updateLine = (lineId: number, updates: Partial<ReceptionLine>) => {
    if (!formData.lignes) return;
    
    const updatedLines = formData.lignes.map(line => {
      if (line.id === lineId) {
        const updated = { ...line, ...updates };
        const quantiteRecue = updated.quantiteRecue || 0;
        const quantiteRestante = updated.quantiteRestante || 0;
        
        // Validation : quantité reçue ne peut pas dépasser la quantité restante
        if (quantiteRecue > quantiteRestante) {
          updated.quantiteRecue = quantiteRestante;
        }
        
        // Calcul de l'écart
        const ecart = quantiteRecue - updated.quantiteCommandee;
        updated.ecart = ecart;
        
        return updated;
      }
      return line;
    });
    
    // Déterminer le statut
    let statut: 'draft' | 'partial' | 'complete' = 'draft';
    const totalRecu = updatedLines.reduce((sum, l) => sum + (l.quantiteRecue || 0), 0);
    const totalCommandee = updatedLines.reduce((sum, l) => sum + l.quantiteCommandee, 0);
    
    if (totalRecu > 0 && totalRecu < totalCommandee) {
      statut = 'partial';
    } else if (totalRecu === totalCommandee) {
      statut = 'complete';
    }
    
    setFormData({
      ...formData,
      lignes: updatedLines,
      statut,
    });
  };

  const handleSave = (statut: 'draft' | 'partial' | 'complete') => {
    if (!formData.numero || !formData.bonCommandeId || !formData.entrepotId || !formData.lignes || formData.lignes.length === 0) return;
    
    if (!selectedPurchaseOrder) return;
    
    const newReception: Reception = {
      id: Date.now().toString(),
      numero: formData.numero,
      dateReception: formData.dateReception || new Date().toISOString().split('T')[0],
      fournisseurId: formData.fournisseurId || "",
      fournisseurNom: selectedPurchaseOrder.fournisseurNom,
      bonCommandeId: formData.bonCommandeId,
      bonCommandeNumero: selectedPurchaseOrder.number,
      entrepotId: formData.entrepotId,
      entrepotNom: entrepots.find(e => e.id === formData.entrepotId)?.nom || "",
      statut: statut === 'draft' ? 'draft' : (statut === 'complete' ? 'complete' : 'partial'),
      lignes: formData.lignes,
      notes: formData.notes,
    };
    
    setReceptions([...receptions, newReception]);
    setIsCreateModalOpen(false);
    setFormData({
      numero: `REC-2024-${String(receptionCounter++).padStart(3, '0')}`,
      dateReception: new Date().toISOString().split('T')[0],
      fournisseurId: "",
      bonCommandeId: "",
      entrepotId: "",
      statut: "draft",
      lignes: [],
    });
    setSelectedPurchaseOrder(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Cette page permet d'enregistrer les marchandises reçues après commande fournisseur et de mettre à jour le stock.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total réceptions</p>
                  <p className="text-2xl font-bold mt-1">{totalReceptions}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <PackageCheck className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complètes</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {completeReceptions}
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
                  <p className="text-sm font-medium text-muted-foreground">Partielles</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {partialReceptions}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                  <p className="text-2xl font-bold mt-1 text-muted-foreground">
                    {receptions.filter(r => r.statut === "draft").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10">
                  <Package className="w-5 h-5 text-muted-foreground" />
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
                placeholder="Rechercher par numéro, fournisseur ou bon de commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="partial">Partielle</SelectItem>
                <SelectItem value="complete">Complète</SelectItem>
                <SelectItem value="closed">Clôturée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateReception}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle réception
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Réception</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Fournisseur</TableHead>
                    <TableHead className="font-semibold">Bon de commande</TableHead>
                    <TableHead className="font-semibold">Entrepôt</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune réception trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReceptions.map((reception) => (
                      <TableRow key={reception.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PackageCheck className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{reception.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(reception.dateReception).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{reception.fournisseurNom}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                            <span>{reception.bonCommandeNumero}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-3 h-3 text-muted-foreground" />
                            <span>{reception.entrepotNom}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", statusStyles[reception.statut])}>
                            {statusLabels[reception.statut]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewReception(reception)}
                            >
                              <Eye className="w-4 h-4" />
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

      {/* Modal pour créer une réception */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle réception</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* En-tête de la réception */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">En-tête de la réception</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numéro de réception</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      readOnly
                      className="bg-muted"
                    />
                    <CardDescription className="text-xs">Généré automatiquement</CardDescription>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateReception">Date de réception *</Label>
                    <Input
                      id="dateReception"
                      type="date"
                      value={formData.dateReception}
                      onChange={(e) => setFormData({ ...formData, dateReception: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonCommande">Bon de commande *</Label>
                    <Select
                      value={formData.bonCommandeId}
                      onValueChange={handleSelectPurchaseOrder}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un bon de commande" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.number} - {order.fournisseurNom} ({new Date(order.date).toLocaleDateString('fr-FR')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entrepot">Entrepôt / Dépôt *</Label>
                    <Select
                      value={formData.entrepotId}
                      onValueChange={(value) => setFormData({ ...formData, entrepotId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un entrepôt" />
                      </SelectTrigger>
                      <SelectContent>
                        {entrepots.map((entrepot) => (
                          <SelectItem key={entrepot.id} value={entrepot.id}>{entrepot.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPurchaseOrder && (
                    <>
                      <div className="space-y-2">
                        <Label>Fournisseur</Label>
                        <div className="text-sm font-semibold text-muted-foreground">
                          {selectedPurchaseOrder.fournisseurNom}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Badge className={cn("mt-1", statusStyles[formData.statut || 'draft'])}>
                          {statusLabels[formData.statut || 'draft']}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations du bon de commande */}
            {selectedPurchaseOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations du bon de commande</CardTitle>
                  <CardDescription>Bon de commande : {selectedPurchaseOrder.number}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <Label className="text-muted-foreground">Fournisseur</Label>
                        <p className="font-semibold">{selectedPurchaseOrder.fournisseurNom}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date commande</Label>
                        <p className="font-semibold">{new Date(selectedPurchaseOrder.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Nombre de lignes</Label>
                        <p className="font-semibold">{selectedPurchaseOrder.lignes.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tableau des lignes reçues */}
            {formData.lignes && formData.lignes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lignes reçues</CardTitle>
                  <CardDescription>Quantités commandées, déjà reçues et restantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead className="text-right w-32">Quantité commandée</TableHead>
                          <TableHead className="text-right w-32">Déjà reçue</TableHead>
                          <TableHead className="text-right w-32">Restante</TableHead>
                          <TableHead className="text-right w-32">Quantité reçue</TableHead>
                          <TableHead className="w-24">Unité</TableHead>
                          <TableHead className="text-right w-32">Écart</TableHead>
                          <TableHead className="w-48">Commentaire</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.lignes.map((ligne) => (
                          <TableRow key={ligne.id}>
                            <TableCell className="font-medium">{ligne.produitNom}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {ligne.quantiteCommandee}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {ligne.quantiteDejaRecue}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "font-semibold",
                                ligne.quantiteRestante > 0 ? "text-warning" : "text-success"
                              )}>
                                {ligne.quantiteRestante}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={ligne.quantiteRecue || 0}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  updateLine(ligne.id, { quantiteRecue: value });
                                }}
                                min="0"
                                max={ligne.quantiteRestante}
                                step="1"
                                className="w-32 text-right"
                              />
                            </TableCell>
                            <TableCell>{ligne.unite}</TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "font-semibold",
                                ligne.ecart > 0 ? "text-success" : ligne.ecart < 0 ? "text-destructive" : "text-muted-foreground"
                              )}>
                                {ligne.ecart > 0 ? '+' : ''}{ligne.ecart}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={ligne.commentaire || ""}
                                onChange={(e) => updateLine(ligne.id, { commentaire: e.target.value })}
                                placeholder="Commentaire..."
                                className="w-48"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Alertes visuelles */}
                  {formData.lignes.some(l => l.ecart !== 0) && (
                    <Alert className="mt-4 bg-warning/5 border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <AlertDescription className="text-sm">
                        Des écarts ont été détectés entre les quantités commandées et reçues. Vérifiez les lignes concernées.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pièces jointes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pièces jointes</CardTitle>
                <CardDescription>Téléversez le bon de livraison fournisseur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez un fichier ou cliquez pour sélectionner
                  </p>
                  <Button variant="outline" size="sm">
                    Sélectionner un fichier
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, JPG, PNG (max 10 MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes internes..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={!formData.bonCommandeId || !formData.entrepotId || !formData.lignes || formData.lignes.length === 0}
              >
                Enregistrer en brouillon
              </Button>
              <Button 
                onClick={() => handleSave(formData.statut === 'complete' ? 'complete' : 'partial')}
                disabled={!formData.bonCommandeId || !formData.entrepotId || !formData.lignes || formData.lignes.length === 0}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Valider la réception
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir une réception */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReception?.numero}</DialogTitle>
          </DialogHeader>
          
          {selectedReception && (
            <div className="space-y-6 mt-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Date de réception</Label>
                      <p className="font-semibold">{new Date(selectedReception.dateReception).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fournisseur</Label>
                      <p className="font-semibold">{selectedReception.fournisseurNom}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Bon de commande</Label>
                      <p className="font-semibold">{selectedReception.bonCommandeNumero}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Entrepôt</Label>
                      <p className="font-semibold">{selectedReception.entrepotNom}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Statut</Label>
                      <Badge className={cn("mt-1", statusStyles[selectedReception.statut])}>
                        {statusLabels[selectedReception.statut]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lignes de réception */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lignes reçues</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Quantité commandée</TableHead>
                        <TableHead className="text-right">Déjà reçue</TableHead>
                        <TableHead className="text-right">Restante</TableHead>
                        <TableHead className="text-right">Quantité reçue</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead className="text-right">Écart</TableHead>
                        <TableHead>Commentaire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReception.lignes.map((ligne) => (
                        <TableRow key={ligne.id}>
                          <TableCell className="font-medium">{ligne.produitNom}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{ligne.quantiteCommandee}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{ligne.quantiteDejaRecue}</TableCell>
                          <TableCell className="text-right">{ligne.quantiteRestante}</TableCell>
                          <TableCell className="text-right font-semibold">{ligne.quantiteRecue}</TableCell>
                          <TableCell>{ligne.unite}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              ligne.ecart > 0 ? "text-success" : ligne.ecart < 0 ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {ligne.ecart > 0 ? '+' : ''}{ligne.ecart}
                            </span>
                          </TableCell>
                          <TableCell>{ligne.commentaire || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
