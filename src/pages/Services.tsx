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
  Briefcase,
  TrendingUp,
  Download,
  Upload,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Service } from "@/types/database";
import { generateNextCode } from "@/utils/numbering";

export default function Services() {
  const { company } = useAuth();
  const { services, categories, createService, updateService, deleteService, getServiceCategories } = useProducts();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const serviceCategories = getServiceCategories();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category_id: "",
    price: "",
    tax_rate: 19,
    billing_type: "fixed" as Service['billing_type'],
    active: true,
    description: "",
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category_id === categoryFilter;
    const matchesActive = activeFilter === "all" ||
      (activeFilter === "active" && service.active) ||
      (activeFilter === "inactive" && !service.active);
    return matchesSearch && matchesCategory && matchesActive;
  });

  const activeServices = services.filter(s => s.active).length;

  const handleCreate = () => {
    setFormData({
      code: "",
      name: "",
      category_id: "",
      price: "",
      tax_rate: 19,
      billing_type: "fixed",
      active: true,
      description: "",
    });
    setSelectedService(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Le libellé est obligatoire");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Le prix doit être supérieur à 0");
      return;
    }

    // Générer le code automatiquement si non saisi
    let finalCode = formData.code.trim();
    if (!finalCode) {
      finalCode = generateNextCode(services, "SERV", (s) => s.code);
    }

    const serviceData = {
      code: finalCode,
      name: formData.name.trim(),
      category_id: formData.category_id || undefined,
      price: parseFloat(formData.price),
      tax_rate: formData.tax_rate,
      billing_type: formData.billing_type,
      active: formData.active,
      description: formData.description || undefined,
    };

    if (selectedService) {
      updateService(selectedService.id, serviceData);
    } else {
      createService(serviceData);
    }
    setIsCreateModalOpen(false);
    setSelectedService(null);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      code: service.code,
      name: service.name,
      category_id: service.category_id || "",
      price: service.price.toString(),
      tax_rate: service.tax_rate,
      billing_type: service.billing_type,
      active: service.active,
      description: service.description || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeServices}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Services</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                const exportData = services.map(s => ({
                  code: s.code,
                  name: s.name,
                  category: s.category_id || "",
                  price: s.price,
                  tax_rate: s.tax_rate,
                  billing_type: s.billing_type,
                  active: s.active ? "Oui" : "Non",
                  description: s.description || "",
                }));
                if (exportData.length === 0) {
                  toast.error("Aucune donnée à exporter");
                  return;
                }
                const headers = Object.keys(exportData[0]);
                const csvContent = [
                  headers.join(","),
                  ...exportData.map(row => 
                    headers.map(header => {
                      const value = row[header];
                      if (value === null || value === undefined) return "";
                      if (typeof value === "string" && value.includes(",")) {
                        return `"${value.replace(/"/g, '""')}"`;
                      }
                      return value;
                    }).join(",")
                  )
                ].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `services_${new Date().toISOString().split("T")[0]}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`${exportData.length} service(s) exporté(s) avec succès`);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".csv";
                input.onchange = async (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const lines = text.split("\n").filter((line: string) => line.trim());
                    if (lines.length < 2) {
                      toast.error("Le fichier est vide ou invalide");
                      return;
                    }
                    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/^"|"$/g, ""));
                    const data: any[] = [];
                    for (let i = 1; i < lines.length; i++) {
                      const values = lines[i].split(",").map((v: string) => v.trim().replace(/^"|"$/g, ""));
                      if (values.length !== headers.length) continue;
                      const row: any = {};
                      headers.forEach((header: string, index: number) => {
                        row[header] = values[index] || "";
                      });
                      data.push(row);
                    }
                    let successCount = 0;
                    let errorCount = 0;
                    for (const row of data) {
                      try {
                        // Générer le code automatiquement si non fourni
                        let serviceCode = row.code?.trim() || "";
                        if (!serviceCode) {
                          serviceCode = generateNextCode(services, "SERV", (s) => s.code);
                        }
                        await createService({
                          code: serviceCode,
                          name: row.name || "",
                          category_id: row.category || "",
                          price: parseFloat(row.price) || 0,
                          tax_rate: parseFloat(row.tax_rate) || 19,
                          billing_type: row.billing_type || "fixed",
                          active: row.active === "Oui" || row.active === "true",
                          description: row.description || "",
                        });
                        successCount++;
                      } catch (error: any) {
                        errorCount++;
                      }
                    }
                    if (successCount > 0) {
                      toast.success(`${successCount} service(s) importé(s) avec succès`);
                    }
                    if (errorCount > 0) {
                      toast.warning(`${errorCount} erreur(s) lors de l'import`);
                    }
                  } catch (error: any) {
                    toast.error(`Erreur lors de l'import: ${error.message}`);
                  }
                };
                input.click();
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau service
              </Button>
            </div>
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
                {serviceCategories.map((cat) => (
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
                  <TableHead>Prix de vente</TableHead>
                  <TableHead>TVA</TableHead>
                  <TableHead>Type facturation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Aucun service trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => {
                    const category = categories.find(c => c.id === service.category_id);
                    return (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.code}</TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant="outline">{category.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(service.price)}
                        </TableCell>
                        <TableCell>{service.tax_rate}%</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {service.billing_type === 'fixed' ? 'Forfait' : 'Durée'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.active ? "default" : "secondary"}>
                            {service.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(service.id)}
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
              {selectedService ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
            <DialogDescription>
              Créer ou modifier un service du référentiel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code service</Label>
                <p className="text-xs text-muted-foreground">
                  Laissé vide pour génération automatique (ex: SERV-001)
                </p>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SERV-001"
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
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix de vente (TND) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type">Type de facturation *</Label>
              <Select
                value={formData.billing_type}
                onValueChange={(value) => setFormData({ ...formData, billing_type: value as Service['billing_type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Forfait</SelectItem>
                  <SelectItem value="duration">Durée (par heure/jour)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="active">Actif</Label>
                <p className="text-sm text-muted-foreground">
                  Le service est disponible dans les modules métier
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
                placeholder="Description du service..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedService(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedService ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
