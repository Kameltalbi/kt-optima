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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Package, 
  Download,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface StockItem {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  categorie: string;
  quantite: number;
  unite: string;
  seuilMinimum: number;
  seuilMaximum?: number;
  prixUnitaire: number;
  valeurStock: number;
}

interface StockByWarehouse {
  entrepotId: string;
  entrepotNom: string;
  items: StockItem[];
}

// Mock data
const mockProducts = [
  { id: "P001", nom: "Ordinateur portable HP", reference: "HP-001", categorie: "Informatique", prix: 8500 },
  { id: "P002", nom: "Imprimante Canon", reference: "CAN-002", categorie: "Informatique", prix: 2200 },
  { id: "P003", nom: "Bureau moderne", reference: "BUR-003", categorie: "Mobilier", prix: 3500 },
  { id: "P004", nom: "Chaise ergonomique", reference: "CH-004", categorie: "Mobilier", prix: 1800 },
  { id: "P005", nom: "Fournitures bureau", reference: "FOU-005", categorie: "Consommables", prix: 250 },
  { id: "P006", nom: "Écran LED 24 pouces", reference: "ECR-006", categorie: "Informatique", prix: 3200 },
  { id: "P007", nom: "Clavier mécanique", reference: "CL-007", categorie: "Informatique", prix: 850 },
];

const mockWarehouses = [
  { id: "1", nom: "Entrepôt Principal" },
  { id: "2", nom: "Entrepôt Secondaire" },
  { id: "3", nom: "Dépôt Casablanca" },
];

const mockStock: StockByWarehouse[] = [
  {
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    items: [
      { id: "1", produitId: "P001", produitNom: "Ordinateur portable HP", produitReference: "HP-001", categorie: "Informatique", quantite: 45, unite: "Unité", seuilMinimum: 20, prixUnitaire: 8500, valeurStock: 382500 },
      { id: "2", produitId: "P002", produitNom: "Imprimante Canon", produitReference: "CAN-002", categorie: "Informatique", quantite: 12, unite: "Unité", seuilMinimum: 10, prixUnitaire: 2200, valeurStock: 26400 },
      { id: "3", produitId: "P003", produitNom: "Bureau moderne", produitReference: "BUR-003", categorie: "Mobilier", quantite: 30, unite: "Unité", seuilMinimum: 15, prixUnitaire: 3500, valeurStock: 105000 },
      { id: "4", produitId: "P004", produitNom: "Chaise ergonomique", produitReference: "CH-004", categorie: "Mobilier", quantite: 8, unite: "Unité", seuilMinimum: 10, prixUnitaire: 1800, valeurStock: 14400 },
      { id: "5", produitId: "P005", produitNom: "Fournitures bureau", produitReference: "FOU-005", categorie: "Consommables", quantite: 250, unite: "Unité", seuilMinimum: 100, prixUnitaire: 250, valeurStock: 62500 },
    ],
  },
  {
    entrepotId: "2",
    entrepotNom: "Entrepôt Secondaire",
    items: [
      { id: "6", produitId: "P001", produitNom: "Ordinateur portable HP", produitReference: "HP-001", categorie: "Informatique", quantite: 15, unite: "Unité", seuilMinimum: 20, prixUnitaire: 8500, valeurStock: 127500 },
      { id: "7", produitId: "P006", produitNom: "Écran LED 24 pouces", produitReference: "ECR-006", categorie: "Informatique", quantite: 25, unite: "Unité", seuilMinimum: 15, prixUnitaire: 3200, valeurStock: 80000 },
      { id: "8", produitId: "P007", produitNom: "Clavier mécanique", produitReference: "CL-007", categorie: "Informatique", quantite: 50, unite: "Unité", seuilMinimum: 30, prixUnitaire: 850, valeurStock: 42500 },
    ],
  },
  {
    entrepotId: "3",
    entrepotNom: "Dépôt Casablanca",
    items: [
      { id: "9", produitId: "P002", produitNom: "Imprimante Canon", produitReference: "CAN-002", categorie: "Informatique", quantite: 5, unite: "Unité", seuilMinimum: 10, prixUnitaire: 2200, valeurStock: 11000 },
      { id: "10", produitId: "P003", produitNom: "Bureau moderne", produitReference: "BUR-003", categorie: "Mobilier", quantite: 12, unite: "Unité", seuilMinimum: 15, prixUnitaire: 3500, valeurStock: 42000 },
    ],
  },
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"byWarehouse" | "byProduct">("byWarehouse");

  // Flatten stock for by-product view
  const allStockItems: (StockItem & { entrepotId: string; entrepotNom: string })[] = [];
  mockStock.forEach(warehouse => {
    warehouse.items.forEach(item => {
      allStockItems.push({ ...item, entrepotId: warehouse.entrepotId, entrepotNom: warehouse.entrepotNom });
    });
  });

  // Group by product for by-product view
  const stockByProduct = allStockItems.reduce((acc, item) => {
    if (!acc[item.produitId]) {
      acc[item.produitId] = {
        produitId: item.produitId,
        produitNom: item.produitNom,
        produitReference: item.produitReference,
        categorie: item.categorie,
        unite: item.unite,
        seuilMinimum: item.seuilMinimum,
        prixUnitaire: item.prixUnitaire,
        entrepots: [],
        quantiteTotale: 0,
        valeurStockTotale: 0,
      };
    }
    acc[item.produitId].entrepots.push({
      entrepotId: item.entrepotId,
      entrepotNom: item.entrepotNom,
      quantite: item.quantite,
      valeurStock: item.valeurStock,
    });
    acc[item.produitId].quantiteTotale += item.quantite;
    acc[item.produitId].valeurStockTotale += item.valeurStock;
    return acc;
  }, {} as Record<string, any>);

  const filteredStockByWarehouse = mockStock.map(warehouse => ({
    ...warehouse,
    items: warehouse.items.filter(item => {
      const matchesSearch = item.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produitReference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = warehouseFilter === "all" || warehouse.entrepotId === warehouseFilter;
      const matchesCategory = categoryFilter === "all" || item.categorie === categoryFilter;
      return matchesSearch && matchesWarehouse && matchesCategory;
    }),
  })).filter(warehouse => warehouse.items.length > 0);

  const filteredStockByProduct = Object.values(stockByProduct).filter((product: any) => {
    const matchesSearch = product.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.produitReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categorie === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = allStockItems.reduce((sum, item) => sum + item.valeurStock, 0);
  const totalItems = allStockItems.length;
  const lowStockItems = allStockItems.filter(item => item.quantite < item.seuilMinimum).length;

  const categories = Array.from(new Set(allStockItems.map(item => item.categorie)));

  return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {totalValue.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Références</p>
                  <p className="text-2xl font-bold mt-1">{totalItems}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Package className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dépôts</p>
                  <p className="text-2xl font-bold mt-1">{mockWarehouses.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-info/10">
                  <Warehouse className="w-5 h-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock faible</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {lowStockItems}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par produit ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Dépôt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les dépôts</SelectItem>
                {mockWarehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="byWarehouse">Par dépôt</TabsTrigger>
                <TabsTrigger value="byProduct">Par produit</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Table by Warehouse */}
        {viewMode === "byWarehouse" && (
          <div className="space-y-4">
            {filteredStockByWarehouse.map(warehouse => (
              <Card key={warehouse.entrepotId} className="border-border/50">
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{warehouse.entrepotNom}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {warehouse.items.length} référence{warehouse.items.length > 1 ? 's' : ''} • 
                        Valeur: {warehouse.items.reduce((sum, item) => sum + item.valeurStock, 0).toLocaleString()} MAD
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Référence</TableHead>
                          <TableHead className="font-semibold">Produit</TableHead>
                          <TableHead className="font-semibold">Catégorie</TableHead>
                          <TableHead className="text-right font-semibold">Quantité</TableHead>
                          <TableHead className="text-right font-semibold">Seuil min.</TableHead>
                          <TableHead className="text-right font-semibold">Prix unitaire</TableHead>
                          <TableHead className="text-right font-semibold">Valeur stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouse.items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{item.produitReference}</TableCell>
                            <TableCell>{item.produitNom}</TableCell>
                            <TableCell>{item.categorie}</TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "font-semibold",
                                item.quantite < item.seuilMinimum ? "text-warning" : "text-foreground"
                              )}>
                                {item.quantite} {item.unite}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {item.seuilMinimum} {item.unite}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.prixUnitaire.toLocaleString()} MAD
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.valeurStock.toLocaleString()} MAD
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table by Product */}
        {viewMode === "byProduct" && (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Référence</TableHead>
                      <TableHead className="font-semibold">Produit</TableHead>
                      <TableHead className="font-semibold">Catégorie</TableHead>
                      <TableHead className="font-semibold">Dépôts</TableHead>
                      <TableHead className="text-right font-semibold">Quantité totale</TableHead>
                      <TableHead className="text-right font-semibold">Seuil min.</TableHead>
                      <TableHead className="text-right font-semibold">Prix unitaire</TableHead>
                      <TableHead className="text-right font-semibold">Valeur totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockByProduct.map((product: any) => (
                      <TableRow key={product.produitId} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{product.produitReference}</TableCell>
                        <TableCell>{product.produitNom}</TableCell>
                        <TableCell>{product.categorie}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {product.entrepots.map((entrepot: any) => (
                              <span key={entrepot.entrepotId} className="text-sm">
                                {entrepot.entrepotNom}: <span className="font-semibold">{entrepot.quantite}</span>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "font-semibold",
                            product.quantiteTotale < product.seuilMinimum ? "text-warning" : "text-foreground"
                          )}>
                            {product.quantiteTotale} {product.unite}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.seuilMinimum} {product.unite}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.prixUnitaire.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {product.valeurStockTotale.toLocaleString()} MAD
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredStockByWarehouse.length === 0 && viewMode === "byWarehouse" && (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucun stock trouvé avec les filtres sélectionnés
            </CardContent>
          </Card>
        )}

        {filteredStockByProduct.length === 0 && viewMode === "byProduct" && (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucun produit trouvé avec les filtres sélectionnés
            </CardContent>
          </Card>
        )}
      </div>
  );
}
