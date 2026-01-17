import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useExpenseNotes, type ExpenseNote } from "@/hooks/use-expense-notes";
import { useState } from "react";
import { toast } from "sonner";

interface ExpenseNoteRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseNote: ExpenseNote | null;
  onSuccess?: () => void;
}

export function ExpenseNoteRejectModal({
  open,
  onOpenChange,
  expenseNote,
  onSuccess,
}: ExpenseNoteRejectModalProps) {
  const { rejectExpenseNote } = useExpenseNotes();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!expenseNote) return;

    if (!reason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }

    setLoading(true);
    try {
      const success = await rejectExpenseNote(expenseNote.id, reason);
      if (success) {
        onOpenChange(false);
        setReason("");
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter la note de frais</DialogTitle>
          <DialogDescription>
            Indiquez la raison du rejet de la note de frais {expenseNote?.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du rejet *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi cette note de frais est rejetée..."
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setReason("");
            }}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Rejet en cours..." : "Rejeter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
