import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useExpenseNotes, type ExpenseNote, type ExpenseNoteHistory } from "@/hooks/use-expense-notes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ExpenseNoteHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseNote: ExpenseNote | null;
}

export function ExpenseNoteHistoryModal({
  open,
  onOpenChange,
  expenseNote,
}: ExpenseNoteHistoryModalProps) {
  const { loadHistory } = useExpenseNotes();
  const [history, setHistory] = useState<ExpenseNoteHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && expenseNote) {
      setLoading(true);
      loadHistory(expenseNote.id).then((data) => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [open, expenseNote, loadHistory]);

  const actionLabels: Record<string, string> = {
    created: "Créé",
    submitted: "Soumis",
    validated: "Validé",
    rejected: "Rejeté",
    paid: "Payé",
    updated: "Modifié",
  };

  if (!expenseNote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique - Note de frais {expenseNote.number}</DialogTitle>
          <DialogDescription>
            Historique complet des actions sur cette note de frais
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun historique disponible
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Statut précédent</TableHead>
                    <TableHead>Nouveau statut</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {actionLabels[entry.action] || entry.action}
                      </TableCell>
                      <TableCell>
                        {entry.old_status ? (
                          <span className="text-muted-foreground">{entry.old_status}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.new_status ? (
                          <span className="font-medium">{entry.new_status}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.comment || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
