import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSupplierInvoices, type SupplierInvoice } from "@/hooks/use-supplier-invoices";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";
import { useTaxes } from "@/hooks/use-taxes";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-0",
  received: "bg-info/10 text-info border-0",
  draft: "bg-warning/10 text-warning border-0",
  overdue: "bg-destructive/10 text-destructive border-0",
  partial: "bg-orange-100 text-orange-800 border-orange-300",
};

const statusLabels: Record<string, string> = {
  paid: "Payée",
  received: "Reçue",
  draft: "Brouillon",
  overdue: "En retard",
  partial: "Partielle",
};

export default function SupplierInvoices() {
  const { company, user } = useAuth();
  const { invoices, loading, fetchInvoices, createInvoice, updateInvoice, deleteInvoice } = useSupplierInvoices();
  const { formatAmount } = useCurrency({ 
    companyId: company?.id, 
    companyCurrency: company?.currency 
  });
  const { taxes } = useTaxes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<Array<{ id: string; number: string }>>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    number: "",
    supplier_id: "",
    purchase_order_id: "",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
  });
  const [lines, setLines] = useState([
    { description: "", quantity: 1, unit_price: 0, tax_rate: 19, total: 0 },
  ]);

  // Charger les fournisseurs et bons de commande
  useEffect(() => {
    const loadData = async () => {
      if (!company?.id) return;
      
      try {
        // Charger les fournisseurs
        const { data: suppliersData } = await supabase
          .from('suppliers')
          .select('id, name')
          .eq('company_id', company.id)
          .order('name');
        setSuppliers(suppliersData || []);

        // Charger les bons de commande
        const { data: poData } = await supabase
          .from('purchase_orders')
          .select('id, number')
          .eq('company_id', company.id)
          .order('number', { ascending: false });
        setPurchaseOrders(poData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [company?.id]);

  // Créer un map des fournisseurs pour accès rapide
  const suppliersMap = useMemo(() => {
    const map: Record<string, string> = {};
    suppliers.forEach(supplier => {
      map[supplier.id] = supplier.name;
    });
    return map;
  }, [suppliers]);

  // Filtrer les factures
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suppliersMap[invoice.supplier_id]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter, suppliersMap]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === "received" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.total, 0);
    
    return { totalInvoices, totalAmount, paidAmount, pendingAmount };
  }, [invoices]);

  const handleViewInvoice = (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setFormData({
      number: "",
      supplier_id: "",
      purchase_order_id: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      notes: "",
    });
    setLines([{ description: "", quantity: 1, unit_price: 0, tax_rate: 19, total: 0 }]);
    setIsCreateModalOpen(true);
  };

  const handleSaveInvoice = async () => {
    if (!formData.supplier_id || !formData.date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (lines.length === 0 || lines.some(l => !l.description.trim())) {
      toast.error("Veuillez ajouter au moins une ligne avec une description");
      return;
    }

    try {
      // Calculer les totaux
      let subtotal = 0;
      let totalTax = 0;

      lines.forEach(line => {
        const lineTotal = line.quantity * line.unit_price;
        subtotal += lineTotal;
        totalTax += lineTotal * (line.tax_rate / 100);
      });

      const total = subtotal + totalTax;

      // Générer un numéro si vide
      let numero = formData.number;
      if (!numero) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const count = invoices.length + 1;
        numero = `FA-${year}-${month}-${String(count).padStart(3, '0')}`;
      }

      await createInvoice({
        number: numero,
        supplier_id: formData.supplier_id,
        purchase_order_id: formData.purchase_order_id || null,
        date: formData.date,
        due_date: formData.due_date || null,
        subtotal,
        tax: totalTax,
        total,
        status: 'draft',
        notes: formData.notes || null,
        items: lines.map(line => ({
          product_id: null,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate,
          total: line.quantity * line.unit_price * (1 + line.tax_rate / 100),
        })),
      });

      setIsCreateModalOpen(false);
      toast.success("Facture fournisseur créée avec succès");
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        await deleteInvoice(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Recalculer le total de la ligne
    if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate') {
      const line = newLines[index];
      newLines[index].total = line.quantity * line.unit_price * (1 + line.tax_rate / 100);
    }
    
    setLines(newLines);
  };

  return (
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
              <SelectItem value="received">Reçue</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
              <SelectItem value="partial">Partielle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle facture fournisseur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Numéro</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="Auto-généré si vide"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_id">Fournisseur *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Date d'échéance</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_order_id">Bon de commande (optionnel)</Label>
                <Select value={formData.purchase_order_id} onValueChange={(value) => setFormData({ ...formData, purchase_order_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un bon de commande" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {purchaseOrders.map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lignes de facture</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  {lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <Input
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Prix unit."
                          value={line.unit_price}
                          onChange={(e) => updateLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="TVA %"
                          value={line.tax_rate}
                          onChange={(e) => updateLine(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        {lines.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLines(lines.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-sm font-semibold pt-2">
                          {formatAmount(line.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLines([...lines, { description: "", quantity: 1, unit_price: 0, tax_rate: 19, total: 0 }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une ligne
                  </Button>
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total HT: {formatAmount(lines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total TVA: {formatAmount(lines.reduce((sum, l) => sum + (l.quantity * l.unit_price * l.tax_rate / 100), 0))}
                    </p>
                    <p className="text-lg font-bold">
                      Total TTC: {formatAmount(lines.reduce((sum, l) => sum + l.total, 0))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveInvoice} disabled={!formData.supplier_id || !formData.date}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Liste des factures fournisseurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune facture trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">HT</TableHead>
                  <TableHead className="text-right">TVA</TableHead>
                  <TableHead className="text-right">TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{invoice.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{suppliersMap[invoice.supplier_id] || "Fournisseur inconnu"}</TableCell>
                    <TableCell>{format(new Date(invoice.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>
                      {invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy", { locale: fr }) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(invoice.subtotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(invoice.tax)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAmount(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusStyles[invoice.status] || statusStyles.draft)}>
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la facture fournisseur</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Numéro</Label>
                  <p className="font-semibold">{selectedInvoice.number}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Fournisseur</Label>
                  <p>{suppliersMap[selectedInvoice.supplier_id] || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedInvoice.date), "dd MMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Échéance</Label>
                  <p>{selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), "dd MMM yyyy", { locale: fr }) : "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <Badge variant="outline" className={cn("text-xs", statusStyles[selectedInvoice.status] || statusStyles.draft)}>
                    {statusLabels[selectedInvoice.status] || selectedInvoice.status}
                  </Badge>
                </div>
                {selectedInvoice.purchase_order && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Bon de commande</Label>
                    <p>{selectedInvoice.purchase_order.number}</p>
                  </div>
                )}
              </div>
              {selectedInvoice.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Lignes</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-right">TVA %</TableHead>
                        <TableHead className="text-right">Total TTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatAmount(item.unit_price)}</TableCell>
                          <TableCell className="text-right">{item.tax_rate}%</TableCell>
                          <TableCell className="text-right font-semibold">{formatAmount(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <Label className="text-sm text-muted-foreground">Total HT</Label>
                        <p className="text-sm">{formatAmount(selectedInvoice.subtotal)}</p>
                        <Label className="text-sm text-muted-foreground mt-2">Total TVA</Label>
                        <p className="text-sm">{formatAmount(selectedInvoice.tax)}</p>
                        <Label className="text-sm text-muted-foreground mt-2">Total TTC</Label>
                        <p className="text-lg font-bold">{formatAmount(selectedInvoice.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
