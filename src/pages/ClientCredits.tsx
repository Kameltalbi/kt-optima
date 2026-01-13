import { useState } from "react";
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
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useCurrency } from "@/hooks/use-currency";
import { useNavigate, useLocation } from "react-router-dom";
import type { ClientCredit, Invoice } from "@/types/database";

// Mock client invoices (en production, viendrait d'un hook)
const mockClientInvoices: Invoice[] = [
  {
    id: 'inv_1',
    number: 'FAC-2024-001',
    client_id: 'cli_1',
    date: '2024-03-01',
    due_date: '2024-03-31',
    subtotal: 5000,
    tax: 950,
    total: 5950,
    status: 'sent',
    company_id: '1',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'inv_2',
    number: 'FAC-2024-002',
    client_id: 'cli_2',
    date: '2024-03-05',
    due_date: '2024-04-05',
    subtotal: 8000,
    tax: 1520,
    total: 9520,
    status: 'paid',
    company_id: '1',
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
  },
];

const mockClients: Record<string, string> = {
  'cli_1': 'Client Alpha',
  'cli_2': 'Entreprise Beta',
};

const reasonLabels: Record<ClientCredit['reason'], string> = {
  return: 'Retour marchandise',
  price_error: 'Erreur de prix',
  commercial_gesture: 'Geste commercial',
  other: 'Autre',
};

const statusLabels: Record<ClientCredit['status'], string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  applied: 'Imputé',
  refunded: 'Remboursé',
};

const refundMethodLabels: Record<ClientCredit['refund_method'], string> = {
  future_invoice: 'Sur prochaine facture',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  cash: 'Espèces',
};

export default function ClientCredits() {
  const { clientCredits, createClientCredit, updateClientCredit, applyClientCredit, refundClientCredit } = useCredits();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer invoice_id depuis l'URL si présent
  const searchParams = new URLSearchParams(location.search);
  const invoiceIdFromUrl = searchParams.get('invoice_id');

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCredit, setSelectedCredit] = useState<ClientCredit | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!invoiceIdFromUrl);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: invoiceIdFromUrl || "",
    client_id: "",
    date: new Date().toISOString().split('T')[0],
    type: "partial" as ClientCredit['type'],
    reason: "commercial_gesture" as ClientCredit['reason'],
    subtotal: 0,
    tax: 0,
    total: 0,
    stock_impact: false,
    refund_method: "future_invoice" as ClientCredit['refund_method'],
    comments: "",
  });

  const filteredCredits = clientCredits.filter((credit) => {
    const matchesSearch =
      credit.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCredits = clientCredits.reduce((sum, c) => sum + c.total, 0);
  const appliedCredits = clientCredits.filter(c => c.status === 'applied').length;

  const handleCreate = () => {
    if (!invoiceIdFromUrl) {
      setFormData({
        invoice_id: "",
        client_id: "",
        date: new Date().toISOString().split('T')[0],
        type: "partial",
        reason: "commercial_gesture",
        subtotal: 0,
        tax: 0,
        total: 0,
        stock_impact: false,
        refund_method: "future_invoice",
        comments: "",
      });
    } else {
      const invoice = mockClientInvoices.find(i => i.id === invoiceIdFromUrl);
      if (invoice) {
        setFormData({
          invoice_id: invoice.id,
          client_id: invoice.client_id,
          date: new Date().toISOString().split('T')[0],
          type: "partial",
          reason: "commercial_gesture",
          subtotal: invoice.subtotal * 0.1,
          tax: invoice.tax * 0.1,
          total: invoice.total * 0.1,
          stock_impact: false,
          refund_method: "future_invoice",
          comments: "",
        });
      }
    }
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoice_id) {
      alert("Vous devez sélectionner une facture client d'origine");
      return;
    }

    if (selectedCredit) {
      updateClientCredit(selectedCredit.id, formData);
    } else {
      createClientCredit(formData);
    }
    setIsCreateModalOpen(false);
    setSelectedCredit(null);
    navigate(location.pathname, { replace: true });
  };

  const handleEdit = (credit: ClientCredit) => {
    setSelectedCredit(credit);
    const invoice = mockClientInvoices.find(i => i.id === credit.invoice_id);
    setFormData({
      invoice_id: credit.invoice_id,
      client_id: credit.client_id,
      date: credit.date,
      type: credit.type,
      reason: credit.reason,
      subtotal: credit.subtotal,
      tax: credit.tax,
      total: credit.total,
      stock_impact: credit.stock_impact,
      refund_method: credit.refund_method,
      comments: credit.comments || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (credit: ClientCredit) => {
    setSelectedCredit(credit);
    setIsViewModalOpen(true);
  };

  const handleApply = (id: string) => {
    if (confirm("Imputer cet avoir sur la prochaine facture client ?")) {
      applyClientCredit(id);
    }
  };

  const handleRefund = (id: string) => {
    if (confirm("Marquer cet avoir comme remboursé ?")) {
      refundClientCredit(id);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = mockClientInvoices.find(i => i.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        subtotal: invoice.subtotal * 0.1,
        tax: invoice.tax * 0.1,
        total: invoice.total * 0.1,
      });
    }
  };

  const selectedInvoice = mockClientInvoices.find(i => i.id === formData.invoice_id);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total avoirs</p>
                <p className="text-2xl font-bold">{clientCredits.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avoirs imputés</p>
                <p className="text-2xl font-bold text-green-600">{appliedCredits}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Avoirs clients</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un avoir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="applied">Imputé</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Facture d'origine</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Aucun avoir trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCredits.map((credit) => {
                    const invoice = mockClientInvoices.find(i => i.id === credit.invoice_id);
                    return (
                      <TableRow key={credit.id}>
                        <TableCell className="font-medium">{credit.number}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => navigate(`/ventes/factures?invoice_id=${credit.invoice_id}`)}
                          >
                            {invoice?.number || 'N/A'}
                          </Button>
                        </TableCell>
                        <TableCell>{mockClients[credit.client_id] || credit.client_id}</TableCell>
                        <TableCell>
                          {new Date(credit.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {credit.type === 'full' ? 'Total' : 'Partiel'}
                          </Badge>
                        </TableCell>
                        <TableCell>{reasonLabels[credit.reason]}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(credit.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              credit.status === 'applied' ? 'default' :
                              credit.status === 'refunded' ? 'secondary' :
                              'secondary'
                            }
                          >
                            {statusLabels[credit.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(credit)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {credit.status !== 'applied' && credit.status !== 'refunded' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(credit)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApply(credit.id)}
                                >
                                  Imputer
                                </Button>
                              </>
                            )}
                            {credit.status === 'applied' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefund(credit.id)}
                              >
                                Rembourser
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCredit ? "Modifier l'avoir client" : "Créer un avoir client"}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Facture d'origine : {selectedInvoice.number}</p>
                  <p className="text-xs text-muted-foreground">
                    Montant facture : {formatCurrency(selectedInvoice.total)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_id">Facture client d'origine *</Label>
              <Select
                value={formData.invoice_id}
                onValueChange={handleInvoiceChange}
                required
                disabled={!!selectedCredit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une facture" />
                </SelectTrigger>
                <SelectContent>
                  {mockClientInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.number} - {formatCurrency(invoice.total)} - {mockClients[invoice.client_id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                L'avoir doit être lié à une facture client existante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ClientCredit['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Avoir total</SelectItem>
                    <SelectItem value="partial">Avoir partiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motif *</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => setFormData({ ...formData, reason: value as ClientCredit['reason'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">Retour marchandise</SelectItem>
                  <SelectItem value="price_error">Erreur de prix</SelectItem>
                  <SelectItem value="commercial_gesture">Geste commercial</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtotal">Sous-total HT (TND) *</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.subtotal}
                  onChange={(e) => {
                    const subtotal = parseFloat(e.target.value) || 0;
                    const tax = subtotal * 0.19; // TVA 19%
                    setFormData({
                      ...formData,
                      subtotal,
                      tax,
                      total: subtotal + tax,
                    });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">TVA (TND)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={formData.tax}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total TTC (TND) *</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={formData.total}
                  readOnly
                  className="bg-muted font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stock_impact"
                  checked={formData.stock_impact}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, stock_impact: checked as boolean })
                  }
                />
                <Label htmlFor="stock_impact" className="cursor-pointer">
                  Impact sur le stock (retour marchandise)
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund_method">Méthode de remboursement</Label>
                <Select
                  value={formData.refund_method}
                  onValueChange={(value) => setFormData({ ...formData, refund_method: value as ClientCredit['refund_method'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="future_invoice">Sur prochaine facture</SelectItem>
                    <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                    <SelectItem value="check">Chèque</SelectItem>
                    <SelectItem value="cash">Espèces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={3}
                placeholder="Notes supplémentaires..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedCredit(null);
                  navigate(location.pathname, { replace: true });
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedCredit ? "Modifier" : "Créer l'avoir"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCredit?.number}</DialogTitle>
            <DialogDescription>Détails de l'avoir client</DialogDescription>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Facture d'origine</p>
                  <p className="font-medium">
                    {mockClientInvoices.find(i => i.id === selectedCredit.invoice_id)?.number || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">
                    {mockClients[selectedCredit.client_id] || selectedCredit.client_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedCredit.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">
                    {selectedCredit.type === 'full' ? 'Total' : 'Partiel'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Motif</p>
                  <p className="font-medium">{reasonLabels[selectedCredit.reason]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode de remboursement</p>
                  <p className="font-medium">{refundMethodLabels[selectedCredit.refund_method]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium text-lg">{formatCurrency(selectedCredit.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={selectedCredit.status === 'applied' ? 'default' : 'secondary'}>
                    {statusLabels[selectedCredit.status]}
                  </Badge>
                </div>
              </div>
              {selectedCredit.comments && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Commentaires</p>
                  <p className="text-sm">{selectedCredit.comments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
