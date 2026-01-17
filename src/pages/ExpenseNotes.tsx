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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  FileText,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Trash2,
  Edit,
  Send,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useExpenseNotes, type ExpenseNote } from "@/hooks/use-expense-notes";
import { useApp } from "@/context/AppContext";
import { useCurrency } from "@/hooks/use-currency";
import { ExpenseNoteCreateModal } from "@/components/expense-notes/ExpenseNoteCreateModal";
import { ExpenseNoteViewModal } from "@/components/expense-notes/ExpenseNoteViewModal";
import { ExpenseNoteHistoryModal } from "@/components/expense-notes/ExpenseNoteHistoryModal";
import { ExpenseNoteRejectModal } from "@/components/expense-notes/ExpenseNoteRejectModal";

const statusStyles: Record<string, string> = {
  paye: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  valide: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  soumis: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  brouillon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  rejete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels: Record<string, string> = {
  paye: "Payé",
  valide: "Validé",
  soumis: "Soumis",
  brouillon: "Brouillon",
  rejete: "Rejeté",
};

const statusIcons: Record<string, any> = {
  paye: CheckCircle,
  valide: CheckCircle,
  soumis: Clock,
  brouillon: FileText,
  rejete: XCircle,
};

export default function ExpenseNotes() {
  const {
    expenseNotes,
    loading,
    loadExpenseNotes,
    submitExpenseNote,
    validateExpenseNote,
    rejectExpenseNote,
    markAsPaid,
    deleteExpenseNote,
    loadHistory,
  } = useExpenseNotes();
  const { company } = useApp();
  const { formatAmount } = useCurrency({
    companyId: company?.id,
    companyCurrency: company?.currency,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<ExpenseNote | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filtrer les notes de frais
  const filteredNotes = useMemo(() => {
    return expenseNotes.filter((note) => {
      const matchesSearch =
        note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.employee?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.employee?.prenom?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || note.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [expenseNotes, searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: expenseNotes.length,
      brouillon: expenseNotes.filter((n) => n.status === "brouillon").length,
      soumis: expenseNotes.filter((n) => n.status === "soumis").length,
      valide: expenseNotes.filter((n) => n.status === "valide").length,
      paye: expenseNotes.filter((n) => n.status === "paye").length,
      totalAmount: expenseNotes.reduce((sum, n) => sum + n.total_amount, 0),
    };
  }, [expenseNotes]);

  const handleView = (note: ExpenseNote) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const handleEdit = (note: ExpenseNote) => {
    if (note.status !== "brouillon") {
      toast.error("Seules les notes en brouillon peuvent être modifiées");
      return;
    }
    setSelectedNote(note);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (note: ExpenseNote) => {
    if (note.status !== "brouillon") {
      toast.error("Seules les notes en brouillon peuvent être soumises");
      return;
    }
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir soumettre cette note de frais ?"
    );
    if (confirmed) {
      await submitExpenseNote(note.id);
    }
  };

  const handleValidate = async (note: ExpenseNote) => {
    if (note.status !== "soumis") {
      toast.error("Seules les notes soumises peuvent être validées");
      return;
    }
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir valider cette note de frais ?"
    );
    if (confirmed) {
      await validateExpenseNote(note.id);
    }
  };

  const handleReject = (note: ExpenseNote) => {
    if (note.status !== "soumis") {
      toast.error("Seules les notes soumises peuvent être rejetées");
      return;
    }
    setSelectedNote(note);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedNote || !rejectReason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }
    await rejectExpenseNote(selectedNote.id, rejectReason);
    setIsRejectModalOpen(false);
    setRejectReason("");
    setSelectedNote(null);
  };

  const handleMarkAsPaid = async (note: ExpenseNote) => {
    if (note.status !== "valide") {
      toast.error("Seules les notes validées peuvent être marquées comme payées");
      return;
    }
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir marquer cette note de frais comme payée ?"
    );
    if (confirmed) {
      await markAsPaid(note.id);
    }
  };

  const handleDelete = async (note: ExpenseNote) => {
    if (note.status !== "brouillon") {
      toast.error("Seules les notes en brouillon peuvent être supprimées");
      return;
    }
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette note de frais ?"
    );
    if (confirmed) {
      await deleteExpenseNote(note.id);
    }
  };

  const handleViewHistory = async (note: ExpenseNote) => {
    setSelectedNote(note);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Brouillons</div>
              <div className="text-2xl font-bold">{stats.brouillon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Soumis</div>
              <div className="text-2xl font-bold">{stats.soumis}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Validé</div>
              <div className="text-2xl font-bold">{stats.valide}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Montant total</div>
              <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher par numéro, employé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="soumis">Soumis</option>
                  <option value="valide">Validé</option>
                  <option value="paye">Payé</option>
                  <option value="rejete">Rejeté</option>
                </select>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle note de frais
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune note de frais trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotes.map((note) => {
                    const StatusIcon = statusIcons[note.status] || FileText;
                    return (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">{note.number}</TableCell>
                        <TableCell>{new Date(note.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>
                          {note.employee
                            ? `${note.employee.prenom} ${note.employee.nom}`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(note.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(statusStyles[note.status])}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[note.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(note)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              {note.status === "brouillon" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(note)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSubmit(note)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Soumettre
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(note)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                              {note.status === "soumis" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleValidate(note)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Valider
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReject(note)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              {note.status === "valide" && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(note)}>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Marquer comme payé
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewHistory(note)}>
                                <History className="w-4 h-4 mr-2" />
                                Historique
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      {/* Modals */}
      <ExpenseNoteCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        expenseNote={selectedNote}
        onSuccess={() => {
          loadExpenseNotes();
          setSelectedNote(null);
        }}
      />

      <ExpenseNoteViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        expenseNote={selectedNote}
      />

      <ExpenseNoteHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        expenseNote={selectedNote}
      />

      <ExpenseNoteRejectModal
        open={isRejectModalOpen}
        onOpenChange={(open) => {
          setIsRejectModalOpen(open);
          if (!open) {
            setSelectedNote(null);
            setRejectReason("");
          }
        }}
        expenseNote={selectedNote}
        onSuccess={() => {
          loadExpenseNotes();
          setSelectedNote(null);
        }}
      />
    </div>
  );
}
