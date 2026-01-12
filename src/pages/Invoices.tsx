import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText, Download, Eye, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";

const mockInvoices: Invoice[] = [
  { id: "1", number: "FAC-2024-001", client_id: "1", date: "2024-01-12", total: 15000, tax: 3000, status: "paid", company_id: "1" },
  { id: "2", number: "FAC-2024-002", client_id: "2", date: "2024-01-10", total: 8500, tax: 1700, status: "sent", company_id: "1" },
  { id: "3", number: "FAC-2024-003", client_id: "3", date: "2024-01-05", total: 22300, tax: 4460, status: "overdue", company_id: "1" },
  { id: "4", number: "FAC-2024-004", client_id: "4", date: "2024-01-03", total: 5200, tax: 1040, status: "paid", company_id: "1" },
  { id: "5", number: "FAC-2024-005", client_id: "1", date: "2024-01-02", total: 12800, tax: 2560, status: "draft", company_id: "1" },
];

const clientNames: Record<string, string> = {
  "1": "Société Alpha",
  "2": "Entreprise Beta",
  "3": "Commerce Gamma",
  "4": "Services Delta",
};

const statusStyles = {
  paid: "erp-badge-success",
  sent: "erp-badge-info",
  overdue: "erp-badge-destructive",
  draft: "erp-badge-warning",
};

const statusLabels = {
  paid: "Payée",
  sent: "Envoyée",
  overdue: "En retard",
  draft: "Brouillon",
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientNames[invoice.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout
      title="Facturation"
      subtitle="Gérez vos factures et paiements"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="erp-stat-card">
            <p className="text-sm text-muted-foreground">Total factures</p>
            <p className="text-2xl font-bold">{mockInvoices.length}</p>
          </div>
          <div className="erp-stat-card">
            <p className="text-sm text-muted-foreground">Payées</p>
            <p className="text-2xl font-bold text-success">
              {mockInvoices.filter((i) => i.status === "paid").length}
            </p>
          </div>
          <div className="erp-stat-card">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-accent">
              {mockInvoices.filter((i) => i.status === "sent").length}
            </p>
          </div>
          <div className="erp-stat-card">
            <p className="text-sm text-muted-foreground">En retard</p>
            <p className="text-2xl font-bold text-destructive">
              {mockInvoices.filter((i) => i.status === "overdue").length}
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
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
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une facture</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(clientNames).map(([id, name]) => (
                          <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Articles</Label>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm text-muted-foreground text-center">
                      Ajoutez des produits ou services
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Brouillon</Button>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    Créer la facture
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="erp-card p-0 overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow className="erp-table-header">
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">HT</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{invoice.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{clientNames[invoice.client_id]}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    {(invoice.total - invoice.tax).toLocaleString()} MAD
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.tax.toLocaleString()} MAD
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {invoice.total.toLocaleString()} MAD
                  </TableCell>
                  <TableCell>
                    <span className={cn("erp-badge", statusStyles[invoice.status])}>
                      {statusLabels[invoice.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
