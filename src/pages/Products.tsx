import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, Wrench, MoreHorizontal } from "lucide-react";
import type { Product, Service } from "@/types/database";

const mockProducts: Product[] = [
  { id: "1", name: "Ordinateur portable HP", price: 8500, tax_rate: 20, category: "Informatique", company_id: "1" },
  { id: "2", name: "Imprimante Canon", price: 2200, tax_rate: 20, category: "Informatique", company_id: "1" },
  { id: "3", name: "Bureau moderne", price: 3500, tax_rate: 20, category: "Mobilier", company_id: "1" },
  { id: "4", name: "Chaise ergonomique", price: 1800, tax_rate: 20, category: "Mobilier", company_id: "1" },
  { id: "5", name: "Fournitures bureau", price: 250, tax_rate: 20, category: "Consommables", company_id: "1" },
];

const mockServices: Service[] = [
  { id: "1", name: "Consultation", price: 800, tax_rate: 20, company_id: "1" },
  { id: "2", name: "Formation", price: 2500, tax_rate: 20, company_id: "1" },
  { id: "3", name: "Maintenance annuelle", price: 5000, tax_rate: 20, company_id: "1" },
  { id: "4", name: "Support technique", price: 350, tax_rate: 20, company_id: "1" },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MainLayout
      title="Produits & Services"
      subtitle="Gérez votre catalogue"
    >
      <Tabs defaultValue="products" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Wrench className="w-4 h-4" />
              Services
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" placeholder="Nom du produit" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix (MAD)</Label>
                      <Input id="price" type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">TVA (%)</Label>
                      <Input id="tax" type="number" defaultValue="20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input id="category" placeholder="Catégorie" />
                  </div>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="products" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockProducts
              .filter((p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((product) => (
                <div key={product.id} className="erp-card group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-secondary">
                      {product.price.toLocaleString()} MAD
                    </span>
                    <span className="text-xs text-muted-foreground">
                      TVA {product.tax_rate}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockServices
              .filter((s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((service) => (
                <div key={service.id} className="erp-card group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Service</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-accent">
                      {service.price.toLocaleString()} MAD
                    </span>
                    <span className="text-xs text-muted-foreground">
                      TVA {service.tax_rate}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
