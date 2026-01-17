import { useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExpenseNotes, type ExpenseCategory } from "@/hooks/use-expense-notes";
import { useCurrency } from "@/hooks/use-currency";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function ExpenseCategories() {
  const { company } = useApp();
  const { formatAmount } = useCurrency({
    companyId: company?.id,
    companyCurrency: company?.currency,
  });
  const { categories, loadCategories } = useExpenseNotes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    plafond_mensuel: "",
    plafond_annuel: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      code: "",
      plafond_mensuel: "",
      plafond_annuel: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      code: category.code || "",
      plafond_mensuel: category.plafond_mensuel?.toString() || "",
      plafond_annuel: category.plafond_annuel?.toString() || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const categoryData: any = {
        name: formData.name,
        description: formData.description || null,
        code: formData.code || null,
        plafond_mensuel: formData.plafond_mensuel ? parseFloat(formData.plafond_mensuel) : null,
        plafond_annuel: formData.plafond_annuel ? parseFloat(formData.plafond_annuel) : null,
        company_id: company?.id,
      };

      if (selectedCategory) {
        // Mise à jour
        const { error } = await supabase
          .from("expense_categories")
          .update(categoryData)
          .eq("id", selectedCategory.id);

        if (error) throw error;
        toast.success("Catégorie mise à jour");
      } else {
        // Création
        const { error } = await supabase
          .from("expense_categories")
          .insert(categoryData);

        if (error) throw error;
        toast.success("Catégorie créée");
      }

      setIsCreateModalOpen(false);
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        code: "",
        plafond_mensuel: "",
        plafond_annuel: "",
      });
      loadCategories();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: ExpenseCategory) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return;
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("expense_categories")
        .update({ actif: false })
        .eq("id", category.id);

      if (error) throw error;
      toast.success("Catégorie désactivée");
      loadCategories();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Catégories de dépenses</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez les catégories pour organiser les notes de frais
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Plafond mensuel</TableHead>
                  <TableHead className="text-right">Plafond annuel</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune catégorie. Créez-en une pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.code || "-"}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {category.plafond_mensuel
                          ? formatAmount(category.plafond_mensuel)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {category.plafond_annuel ? formatAmount(category.plafond_annuel) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal création/édition */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory
                  ? "Modifiez les informations de la catégorie"
                  : "Créez une nouvelle catégorie de dépenses"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Transport, Repas, Hôtel..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: TRSP, REPAS, HOTEL..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plafond_mensuel">Plafond mensuel</Label>
                  <Input
                    id="plafond_mensuel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.plafond_mensuel}
                    onChange={(e) =>
                      setFormData({ ...formData, plafond_mensuel: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plafond_annuel">Plafond annuel</Label>
                  <Input
                    id="plafond_annuel"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.plafond_annuel}
                    onChange={(e) =>
                      setFormData({ ...formData, plafond_annuel: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Enregistrement..." : selectedCategory ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
