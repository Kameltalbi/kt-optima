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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  Package,
  Briefcase,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import type { ProductCategory } from "@/types/database";

export default function Categories() {
  const { categories, products, services, createCategory, updateCategory, deleteCategory } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "product" as ProductCategory['type'],
    description: "",
    active: true,
  });

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || category.type === typeFilter;
    const matchesActive = activeFilter === "all" ||
      (activeFilter === "active" && category.active) ||
      (activeFilter === "inactive" && !category.active);
    return matchesSearch && matchesType && matchesActive;
  });

  const productCategories = categories.filter(c => c.type === 'product').length;
  const serviceCategories = categories.filter(c => c.type === 'service').length;
  const activeCategories = categories.filter(c => c.active).length;

  const handleCreate = () => {
    setFormData({
      name: "",
      type: "product",
      description: "",
      active: true,
    });
    setSelectedCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      name: formData.name,
      type: formData.type,
      description: formData.description || undefined,
      active: formData.active,
    };

    if (selectedCategory) {
      updateCategory(selectedCategory.id, categoryData);
    } else {
      createCategory(categoryData);
    }
    setIsCreateModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || "",
      active: category.active,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    // Vérifier si la catégorie est utilisée
    const usedInProducts = products.some(p => p.category_id === id);
    const usedInServices = services.some(s => s.category_id === id);

    if (usedInProducts || usedInServices) {
      alert("Cette catégorie est utilisée par des produits ou services. Veuillez d'abord la retirer des éléments concernés.");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      deleteCategory(id);
    }
  };

  const getCategoryUsage = (categoryId: string) => {
    const productCount = products.filter(p => p.category_id === categoryId).length;
    const serviceCount = services.filter(s => s.category_id === categoryId).length;
    return { productCount, serviceCount };
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total catégories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Folder className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Catégories produits</p>
                <p className="text-2xl font-bold text-blue-600">{productCategories}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Catégories services</p>
                <p className="text-2xl font-bold text-green-600">{serviceCategories}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Catégories</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="product">Produit</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune catégorie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => {
                    const usage = getCategoryUsage(category.id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant={category.type === 'product' ? 'default' : 'secondary'}>
                            {category.type === 'product' ? (
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                Produit
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                Service
                              </div>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {category.description ? (
                            <span className="text-sm text-muted-foreground">{category.description}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {category.type === 'product' ? (
                              <span>{usage.productCount} produit{usage.productCount > 1 ? 's' : ''}</span>
                            ) : (
                              <span>{usage.serviceCount} service{usage.serviceCount > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.active ? "default" : "secondary"}>
                            {category.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              Créer ou modifier une catégorie pour structurer les produits et services
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Informatique, Formation..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ProductCategory['type'] })}
                disabled={!!selectedCategory} // Ne pas permettre de changer le type lors de l'édition
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-xs text-muted-foreground">
                  Le type ne peut pas être modifié après création
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Description de la catégorie..."
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  La catégorie est disponible pour les produits/services
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedCategory(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedCategory ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
