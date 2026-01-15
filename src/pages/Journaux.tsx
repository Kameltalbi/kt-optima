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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useComptabilite } from "@/hooks/use-comptabilite";
import { toast } from "sonner";

export default function Journaux() {
  const { journaux, loading, createJournal, fetchJournaux } = useComptabilite();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code_journal: "",
    libelle: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code_journal.trim() || !formData.libelle.trim()) {
      toast.error("Le code et le libellé sont obligatoires");
      return;
    }

    try {
      await createJournal({
        code_journal: formData.code_journal.toUpperCase(),
        libelle: formData.libelle,
      });
      setIsCreateModalOpen(false);
      setFormData({ code_journal: "", libelle: "" });
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journaux Comptables</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestion des journaux comptables
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau journal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journaux.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Aucun journal trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  journaux.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-medium">{journal.code_journal}</TableCell>
                      <TableCell>{journal.libelle}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau journal</DialogTitle>
            <DialogDescription>
              Créez un nouveau journal comptable
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code_journal">Code journal *</Label>
              <Input
                id="code_journal"
                value={formData.code_journal}
                onChange={(e) => setFormData({ ...formData, code_journal: e.target.value })}
                placeholder="Ex: VE, OD, BN"
                required
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="libelle">Libellé *</Label>
              <Input
                id="libelle"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                placeholder="Ex: Journal des Ventes"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setFormData({ code_journal: "", libelle: "" });
                }}
              >
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
