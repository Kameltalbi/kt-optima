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
  Package,
  TrendingUp,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Product } from "@/types/database";

export default function Products() {
  const { company } = useAuth();
  const { products, categories, createProduct, updateProduct, deleteProduct, getProductCategories } = useProducts();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const productCategories = getProductCategories();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category_id: "",
    purchase_price: "",
    sale_price: "",
    tax_rate: 19,
    unit: "pièce",
    stockable: true,
    active: true,
    description: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    const matchesActive = activeFilter === "all" ||
      (activeFilter === "active" && product.active) ||
      (activeFilter === "inactive" && !product.active);
    return matchesSearch && matchesCategory && matchesActive;
  });

  const activeProducts = products.filter(p => p.active).length;
  const stockableProducts = products.filter(p => p.stockable && p.active).length;

  const handleCreate = () => {
    setFormData({
      code: "",
      name: "",
      category_id: "",
      purchase_price: "",
      sale_price: "",
      tax_rate: 19,
      unit: "pièce",
      stockable: true,
      active: true,
      description: "",
    });
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Le code et le libellé sont obligatoires");
      return;
    }

    if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
      toast.error("Le prix de vente doit être supérieur à 0");
      return;
    }

    try {
      const productData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        category_id: formData.category_id || undefined,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        sale_price: parseFloat(formData.sale_price),
        tax_rate: formData.tax_rate,
        unit: formData.unit || undefined,
        stockable: formData.stockable,
        active: formData.active,
        description: formData.description || undefined,
      };

      if (selectedProduct) {
        updateProduct(selectedProduct.id, productData);
        toast.success("Produit modifié avec succès");
      } else {
        createProduct(productData);
        toast.success("Produit créé avec succès");
      }
      
      setIsCreateModalOpen(false);
      setSelectedProduct(null);
      setFormData({
        code: "",
        name: "",
        category_id: "",
        purchase_price: "",
        sale_price: "",
        tax_rate: 19,
        unit: "pièce",
        stockable: true,
        active: true,
        description: "",
      });
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde du produit");
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category_id: product.category_id || "",
      purchase_price: product.purchase_price?.toString() || "",
      sale_price: product.sale_price.toString(),
      tax_rate: product.tax_rate,
      unit: product.unit || "pièce",
      stockable: product.stockable,
      active: product.active,
      description: product.description || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProduct(id);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    updateProduct(id, { active });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produits actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stockables</p>
                <p className="text-2xl font-bold text-blue-600">{stockableProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Produits</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par code ou libellé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {productCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix d'achat</TableHead>
                  <TableHead>Prix de vente</TableHead>
                  <TableHead>TVA</TableHead>
                  <TableHead>Stockable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const category = categories.find(c => c.id === product.category_id);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant="outline">{category.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.purchase_price ? formatCurrency(product.purchase_price) : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.sale_price)}
                        </TableCell>
                        <TableCell>{product.tax_rate}%</TableCell>
                        <TableCell>
                          <Badge variant={product.stockable ? "default" : "outline"}>
                            {product.stockable ? "Oui" : "Non"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
            <DialogDescription>
              Créer ou modifier un produit du référentiel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code produit *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="PROD-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Libellé *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Catégorie</Label>
              <Select
                value={formData.category_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {productCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Prix d'achat (TND)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Prix de vente (TND) *</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">TVA (%) *</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pièce">Pièce</SelectItem>
                    <SelectItem value="kg">Kilogramme</SelectItem>
                    <SelectItem value="g">Gramme</SelectItem>
                    <SelectItem value="m">Mètre</SelectItem>
                    <SelectItem value="m²">Mètre carré</SelectItem>
                    <SelectItem value="m³">Mètre cube</SelectItem>
                    <SelectItem value="L">Litre</SelectItem>
                    <SelectItem value="unité">Unité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="stockable">Produit stockable</Label>
                <p className="text-sm text-muted-foreground">
                  Ce produit peut être géré en stock
                </p>
              </div>
              <Switch
                id="stockable"
                checked={formData.stockable}
                onCheckedChange={(checked) => setFormData({ ...formData, stockable: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="active">Actif</Label>
                <p className="text-sm text-muted-foreground">
                  Le produit est disponible dans les modules métier
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Description du produit..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedProduct(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedProduct ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
