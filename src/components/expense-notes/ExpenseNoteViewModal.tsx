import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useExpenseNotes, type ExpenseNote } from "@/hooks/use-expense-notes";
import { useCurrency } from "@/hooks/use-currency";
import { useApp } from "@/context/AppContext";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

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

interface ExpenseNoteViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseNote: ExpenseNote | null;
}

export function ExpenseNoteViewModal({
  open,
  onOpenChange,
  expenseNote,
}: ExpenseNoteViewModalProps) {
  const { company } = useApp();
  const { formatAmount } = useCurrency({
    companyId: company?.id,
    companyCurrency: company?.currency,
  });

  if (!expenseNote) return null;

  const StatusIcon = statusIcons[expenseNote.status] || FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Note de frais {expenseNote.number}</DialogTitle>
              <DialogDescription>
                Détails de la note de frais
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(statusStyles[expenseNote.status])}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabels[expenseNote.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations générales */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">
                    {new Date(expenseNote.date).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Employé</div>
                  <div className="font-medium">
                    {expenseNote.employee
                      ? `${expenseNote.employee.prenom} ${expenseNote.employee.nom}`
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Montant total</div>
                  <div className="text-xl font-bold">
                    {formatAmount(expenseNote.total_amount)}
                  </div>
                </div>
                {expenseNote.validated_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Validé le</div>
                    <div className="font-medium">
                      {new Date(expenseNote.validated_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                )}
                {expenseNote.paid_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Payé le</div>
                    <div className="font-medium">
                      {new Date(expenseNote.paid_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                )}
                {expenseNote.rejection_reason && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Raison du rejet</div>
                    <div className="font-medium text-red-600">
                      {expenseNote.rejection_reason}
                    </div>
                  </div>
                )}
              </div>
              {expenseNote.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="font-medium">{expenseNote.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lignes de dépenses */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-4">Lignes de dépenses</div>
              {expenseNote.items && expenseNote.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant HT</TableHead>
                      <TableHead className="text-right">TVA</TableHead>
                      <TableHead className="text-right">Total TTC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseNote.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.category?.name || "N/A"}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          {new Date(item.date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.tva_rate ? `${item.tva_rate}%` : "0%"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(item.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune ligne de dépense
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
