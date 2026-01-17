import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Upload, File, X } from "lucide-react";
import { useExpenseNotes, type ExpenseNote, type ExpenseNoteItem, type ExpenseCategory } from "@/hooks/use-expense-notes";
import { useEmployes, type Employe } from "@/hooks/use-employes";
import { useCurrency } from "@/hooks/use-currency";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

interface ExpenseNoteCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseNote?: ExpenseNote | null;
  onSuccess?: () => void;
}

export function ExpenseNoteCreateModal({
  open,
  onOpenChange,
  expenseNote,
  onSuccess,
}: ExpenseNoteCreateModalProps) {
  const { company } = useApp();
  const { formatAmount } = useCurrency({
    companyId: company?.id,
    companyCurrency: company?.currency,
  });
  const { categories, createExpenseNote, updateExpenseNote, uploadAttachment } = useExpenseNotes();
  const { employes, loading: loadingEmployees } = useEmployes();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ExpenseNoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemAttachments, setItemAttachments] = useState<Record<number, File[]>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  // Initialiser les données si on édite
  useEffect(() => {
    if (expenseNote && open) {
      setDate(expenseNote.date);
      setEmployeeId(expenseNote.employee_id || "");
      setNotes(expenseNote.notes || "");
      setItems(expenseNote.items || []);
    } else if (open) {
      // Réinitialiser pour une nouvelle note
      setDate(new Date().toISOString().split("T")[0]);
      setEmployeeId("");
      setNotes("");
      setItems([]);
    }
  }, [expenseNote, open]);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        amount: 0,
        date: date,
        tva_rate: 0,
        tva_amount: 0,
        total_amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExpenseNoteItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "amount" || field === "tva_rate") {
      const amount = field === "amount" ? parseFloat(value) || 0 : item.amount;
      const tvaRate = field === "tva_rate" ? parseFloat(value) || 0 : item.tva_rate || 0;
      const tvaAmount = amount * (tvaRate / 100);
      const totalAmount = amount + tvaAmount;

      item.amount = amount;
      item.tva_rate = tvaRate;
      item.tva_amount = tvaAmount;
      item.total_amount = totalAmount;
    } else {
      (item as any)[field] = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total_amount || item.amount), 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins une ligne de dépense");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || !item.description.trim()) {
        toast.error(`Veuillez remplir la description de la ligne ${i + 1}`);
        return;
      }
      if (!item.amount || item.amount <= 0) {
        toast.error(`Veuillez remplir le montant de la ligne ${i + 1}`);
        return;
      }
      if (!item.date) {
        toast.error(`Veuillez remplir la date de la ligne ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const noteData = {
        employee_id: employeeId || undefined,
        date,
        items: items.map((item) => ({
          ...item,
          total_amount: item.total_amount || item.amount,
        })),
        notes: notes || undefined,
      };

      if (expenseNote) {
        // Mise à jour
        const success = await updateExpenseNote(expenseNote.id, noteData);
        if (success) {
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        // Création
        const newNote = await createExpenseNote(noteData);
        if (newNote) {
          // Uploader les justificatifs après la création
          for (let i = 0; i < items.length; i++) {
            const files = itemAttachments[i];
            if (files && files.length > 0) {
              const itemId = newNote.items?.[i]?.id;
              for (const file of files) {
                await uploadAttachment(newNote.id, itemId || null, file);
              }
            }
          }
          onOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expenseNote ? "Modifier la note de frais" : "Nouvelle note de frais"}
          </DialogTitle>
          <DialogDescription>
            {expenseNote
              ? "Modifiez les informations de la note de frais"
              : "Créez une nouvelle note de frais pour un employé"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {employes
                    .filter((e) => e.actif)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.prenom} {employee.nom}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

          {/* Lignes de dépenses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Lignes de dépenses *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                Aucune ligne de dépense. Cliquez sur "Ajouter une ligne" pour commencer.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Catégorie</TableHead>
                      <TableHead>Description *</TableHead>
                      <TableHead className="w-[120px]">Date *</TableHead>
                      <TableHead className="w-[120px]">Montant HT *</TableHead>
                      <TableHead className="w-[100px]">TVA %</TableHead>
                      <TableHead className="w-[120px]">Total TTC</TableHead>
                      <TableHead className="w-[100px]">Justificatif</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.category_id || ""}
                            onValueChange={(value) =>
                              updateItem(index, "category_id", value || undefined)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Aucune</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="Description de la dépense"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) => updateItem(index, "date", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.amount || ""}
                            onChange={(e) =>
                              updateItem(index, "amount", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.tva_rate || 0}
                            onChange={(e) =>
                              updateItem(index, "tva_rate", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(item.total_amount || item.amount)}
                        </TableCell>
                        <TableCell>
                          <input
                            type="file"
                            id={`file-${index}`}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Pour l'instant, on stocke juste le fichier
                              // L'upload se fera après la création de la note
                              const currentFiles = itemAttachments[index] || [];
                              setItemAttachments({
                                ...itemAttachments,
                                [index]: [...currentFiles, file],
                              });
                              toast.success("Fichier ajouté. Il sera uploadé après la création de la note.");
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              document.getElementById(`file-${index}`)?.click();
                            }}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {itemAttachments[index]?.length || 0} fichier(s)
                          </Button>
                          {itemAttachments[index] && itemAttachments[index].length > 0 && (
                            <div className="mt-1 space-y-1">
                              {itemAttachments[index].map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center gap-2 text-xs">
                                  <File className="w-3 h-3" />
                                  <span className="truncate flex-1">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={() => {
                                      const newFiles = itemAttachments[index].filter((_, i) => i !== fileIndex);
                                      setItemAttachments({
                                        ...itemAttachments,
                                        [index]: newFiles,
                                      });
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{formatAmount(calculateTotal())}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : expenseNote ? "Modifier" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
