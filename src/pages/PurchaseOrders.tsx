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
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";

// Local type for purchase orders with extended status
type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

interface PurchaseOrder {
  id: string;
  number: string;
  client_id: string;
  date: string;
  total: number;
  tax: number;
  status: PurchaseOrderStatus;
  company_id: string;
}

const supplierNames: Record<string, string> = {};

const statusStyles = {
  confirmed: "bg-success/10 text-success border-0",
  received: "bg-info/10 text-info border-0",
  sent: "bg-warning/10 text-warning border-0",
  draft: "bg-muted/10 text-muted-foreground border-0",
  cancelled: "bg-destructive/10 text-destructive border-0",
};

const statusLabels = {
  confirmed: "Confirmé",
  received: "Reçu",
  sent: "Envoyé",
  draft: "Brouillon",
  cancelled: "Annulé",
};

export default function PurchaseOrders() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [purchaseOrders] = useState<PurchaseOrder[]>([]);

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierNames[order.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = purchaseOrders.length;
  const totalAmount = purchaseOrders.reduce((sum, o) => sum + o.total, 0);
  const confirmedAmount = purchaseOrders
    .filter(o => o.status === "confirmed" || o.status === "received")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingAmount = purchaseOrders
    .filter(o => o.status === "sent")
    .reduce((sum, o) => sum + o.total, 0);

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCreateOrder = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveOrder = () => {
    console.log("Saving purchase order");
    setIsCreateModalOpen(false);
    // TODO: Implémenter la sauvegarde du bon de commande
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
                  <p className="text-sm font-medium text-muted-foreground">Total commandes</p>
                  <p className="text-2xl font-bold mt-1">{totalOrders}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <ShoppingCart className="w-5 h-5 text-primary" />
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
                  <p className="text-sm font-medium text-muted-foreground">Confirmés/Reçus</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {formatCurrency(confirmedAmount)}
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
                placeholder="Rechercher par numéro ou fournisseur..."
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
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreateOrder}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau bon de commande
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Bon de commande</TableHead>
                    <TableHead className="font-semibold">Fournisseur</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">HT</TableHead>
                    <TableHead className="text-right font-semibold">TVA</TableHead>
                    <TableHead className="text-right font-semibold">TTC</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bon de commande trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{order.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{supplierNames[order.client_id]}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total - order.tax)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.tax)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[order.status as keyof typeof statusStyles])}>
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewOrder(order)}
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

      {/* Modal pour créer un nouveau bon de commande */}
      {/* TODO: Créer PurchaseOrderCreateModal avec options fiscales */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau bon de commande</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Modal de création à implémenter</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir un bon de commande existant */}
      {/* TODO: Créer une page Preview Document avec CompanyDocumentLayout */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedOrder?.number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
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
