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
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import DocumentTemplate, { DocumentFormData, DocumentLine } from "@/components/documents/DocumentTemplate";

// Local type for delivery notes with extended status
type DeliveryNoteStatus = 'draft' | 'pending' | 'in_transit' | 'delivered';

interface DeliveryNote {
  id: string;
  number: string;
  client_id: string;
  date: string;
  total: number;
  tax: number;
  status: DeliveryNoteStatus;
  company_id: string;
}

const mockDeliveryNotes: DeliveryNote[] = [
  { id: "1", number: "BL-2024-001", client_id: "1", date: "2024-01-12", total: 15000, tax: 3000, status: "delivered", company_id: "1" },
  { id: "2", number: "BL-2024-002", client_id: "2", date: "2024-01-10", total: 8500, tax: 1700, status: "in_transit", company_id: "1" },
  { id: "3", number: "BL-2024-003", client_id: "3", date: "2024-01-05", total: 22300, tax: 4460, status: "pending", company_id: "1" },
  { id: "4", number: "BL-2024-004", client_id: "4", date: "2024-01-03", total: 5200, tax: 1040, status: "delivered", company_id: "1" },
  { id: "5", number: "BL-2024-005", client_id: "1", date: "2024-01-02", total: 12800, tax: 2560, status: "draft", company_id: "1" },
];

const clientNames: Record<string, string> = {
  "1": "Société Alpha",
  "2": "Entreprise Beta",
  "3": "Commerce Gamma",
  "4": "Services Delta",
};

const statusStyles = {
  delivered: "bg-success/10 text-success border-0",
  in_transit: "bg-info/10 text-info border-0",
  pending: "bg-warning/10 text-warning border-0",
  draft: "bg-muted/10 text-muted-foreground border-0",
};

const statusLabels = {
  delivered: "Livré",
  in_transit: "En transit",
  pending: "En attente",
  draft: "Brouillon",
};

export default function DeliveryNotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredDeliveryNotes = mockDeliveryNotes.filter((note) => {
    const matchesSearch = note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientNames[note.client_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDeliveryNotes = mockDeliveryNotes.length;
  const totalAmount = mockDeliveryNotes.reduce((sum, n) => sum + n.total, 0);
  const deliveredAmount = mockDeliveryNotes
    .filter(n => n.status === "delivered")
    .reduce((sum, n) => sum + n.total, 0);
  const pendingAmount = mockDeliveryNotes
    .filter(n => n.status === "in_transit" || n.status === "pending")
    .reduce((sum, n) => sum + n.total, 0);

  const handleViewDeliveryNote = (note: DeliveryNote) => {
    setSelectedDeliveryNote(note);
    setIsViewModalOpen(true);
  };

  const handleCreateDeliveryNote = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveDeliveryNote = (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => {
    console.log("Saving delivery note:", data);
    setIsCreateModalOpen(false);
    // Ici vous pouvez ajouter la logique pour sauvegarder le bon de livraison
  };

  return (
    <MainLayout
      title="Bons de livraison"
      subtitle="Gérez vos bons de livraison"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total bons</p>
                  <p className="text-2xl font-bold mt-1">{totalDeliveryNotes}</p>
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
                    {totalAmount.toLocaleString()} MAD
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
                    {deliveredAmount.toLocaleString()} MAD
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
                    {pendingAmount.toLocaleString()} MAD
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
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Bon de livraison</TableHead>
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
                  {filteredDeliveryNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bon de livraison trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliveryNotes.map((note) => (
                      <TableRow key={note.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{note.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{clientNames[note.client_id]}</TableCell>
                        <TableCell>{new Date(note.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-right">
                          {(note.total - note.tax).toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right">
                          {note.tax.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {note.total.toLocaleString()} MAD
                        </TableCell>
                        <TableCell>
                          <span className={cn("erp-badge text-xs", statusStyles[note.status as keyof typeof statusStyles])}>
                            {statusLabels[note.status as keyof typeof statusLabels]}
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

      {/* Modal pour créer un nouveau bon de livraison */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[95vh]">
            <DocumentTemplate
              docType="bon_livraison"
              readOnly={false}
              onSave={handleSaveDeliveryNote}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour voir un bon de livraison existant */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {selectedDeliveryNote?.number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setTimeout(() => {
                      const pdfButton = document.querySelector('[data-pdf-button]') as HTMLElement;
                      if (pdfButton) {
                        pdfButton.click();
                      }
                    }, 100);
                  }}
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setTimeout(() => {
                      const printButton = document.querySelector('[data-print-button]') as HTMLElement;
                      if (printButton) {
                        printButton.click();
                      }
                    }, 100);
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <DocumentTemplate
              docType="bon_livraison"
              readOnly={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
