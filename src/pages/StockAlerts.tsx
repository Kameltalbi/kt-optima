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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  AlertTriangle,
  Package,
  Warehouse,
  TrendingDown,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface StockAlert {
  id: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  categorie: string;
  entrepotId: string;
  entrepotNom: string;
  quantiteActuelle: number;
  seuilMinimum: number;
  ecart: number;
  pourcentageStock: number;
  prixUnitaire: number;
  valeurStock: number;
  dernierMouvement?: string;
}

// Mock data
const mockAlerts: StockAlert[] = [
  {
    id: "1",
    produitId: "P004",
    produitNom: "Chaise ergonomique",
    produitReference: "CH-004",
    categorie: "Mobilier",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantiteActuelle: 8,
    seuilMinimum: 10,
    ecart: -2,
    pourcentageStock: 80,
    prixUnitaire: 1800,
    valeurStock: 14400,
    dernierMouvement: "2024-01-13",
  },
  {
    id: "2",
    produitId: "P001",
    produitNom: "Ordinateur portable HP",
    produitReference: "HP-001",
    categorie: "Informatique",
    entrepotId: "2",
    entrepotNom: "Entrepôt Secondaire",
    quantiteActuelle: 15,
    seuilMinimum: 20,
    ecart: -5,
    pourcentageStock: 75,
    prixUnitaire: 8500,
    valeurStock: 127500,
    dernierMouvement: "2024-01-15",
  },
  {
    id: "3",
    produitId: "P002",
    produitNom: "Imprimante Canon",
    produitReference: "CAN-002",
    categorie: "Informatique",
    entrepotId: "3",
    entrepotNom: "Dépôt Casablanca",
    quantiteActuelle: 5,
    seuilMinimum: 10,
    ecart: -5,
    pourcentageStock: 50,
    prixUnitaire: 2200,
    valeurStock: 11000,
    dernierMouvement: "2024-01-07",
  },
  {
    id: "4",
    produitId: "P003",
    produitNom: "Bureau moderne",
    produitReference: "BUR-003",
    categorie: "Mobilier",
    entrepotId: "3",
    entrepotNom: "Dépôt Casablanca",
    quantiteActuelle: 12,
    seuilMinimum: 15,
    ecart: -3,
    pourcentageStock: 80,
    prixUnitaire: 3500,
    valeurStock: 42000,
    dernierMouvement: "2024-01-12",
  },
  {
    id: "5",
    produitId: "P005",
    produitNom: "Fournitures bureau",
    produitReference: "FOU-005",
    categorie: "Consommables",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantiteActuelle: 95,
    seuilMinimum: 100,
    ecart: -5,
    pourcentageStock: 95,
    prixUnitaire: 250,
    valeurStock: 23750,
    dernierMouvement: "2024-01-10",
  },
];

const mockWarehouses = [
  { id: "1", nom: "Entrepôt Principal" },
  { id: "2", nom: "Entrepôt Secondaire" },
  { id: "3", nom: "Dépôt Casablanca" },
];

const categories = Array.from(new Set(mockAlerts.map(alert => alert.categorie)));

export default function StockAlerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const getSeverity = (pourcentage: number): 'critical' | 'warning' | 'low' => {
    if (pourcentage < 50) return 'critical';
    if (pourcentage < 80) return 'warning';
    return 'low';
  };

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch = alert.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.produitReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = warehouseFilter === "all" || alert.entrepotId === warehouseFilter;
    const matchesCategory = categoryFilter === "all" || alert.categorie === categoryFilter;
    const severity = getSeverity(alert.pourcentageStock);
    const matchesSeverity = severityFilter === "all" || severity === severityFilter;
    return matchesSearch && matchesWarehouse && matchesCategory && matchesSeverity;
  });

  const criticalAlerts = filteredAlerts.filter(a => getSeverity(a.pourcentageStock) === 'critical').length;
  const warningAlerts = filteredAlerts.filter(a => getSeverity(a.pourcentageStock) === 'warning').length;
  const lowAlerts = filteredAlerts.filter(a => getSeverity(a.pourcentageStock) === 'low').length;
  const totalValue = filteredAlerts.reduce((sum, alert) => sum + alert.valeurStock, 0);

  return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total alertes</p>
                  <p className="text-2xl font-bold mt-1">
                    {filteredAlerts.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critiques</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {criticalAlerts}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avertissements</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {warningAlerts}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faibles</p>
                  <p className="text-2xl font-bold mt-1 text-info">
                    {lowAlerts}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-info/10">
                  <TrendingDown className="w-5 h-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {totalValue.toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Package className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Message */}
        {filteredAlerts.length > 0 && (
          <Alert className={cn(
            "border-2",
            criticalAlerts > 0 ? "bg-destructive/5 border-destructive/20" : 
            warningAlerts > 0 ? "bg-warning/5 border-warning/20" : 
            "bg-info/5 border-info/20"
          )}>
            <AlertTriangle className={cn(
              "h-4 w-4",
              criticalAlerts > 0 ? "text-destructive" : 
              warningAlerts > 0 ? "text-warning" : 
              "text-info"
            )} />
            <AlertDescription className="text-sm font-medium">
              {criticalAlerts > 0 && `${criticalAlerts} produit(s) en stock critique nécessitent une réapprovisionnement urgente. `}
              {warningAlerts > 0 && `${warningAlerts} produit(s) approchent du seuil minimum. `}
              {lowAlerts > 0 && `${lowAlerts} produit(s) sont légèrement en dessous du seuil.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par produit ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
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
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Gravité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Référence</TableHead>
                    <TableHead className="font-semibold">Produit</TableHead>
                    <TableHead className="font-semibold">Catégorie</TableHead>
                    <TableHead className="font-semibold">Dépôt</TableHead>
                    <TableHead className="text-right font-semibold">Stock actuel</TableHead>
                    <TableHead className="text-right font-semibold">Seuil minimum</TableHead>
                    <TableHead className="text-right font-semibold">Écart</TableHead>
                    <TableHead className="text-center font-semibold">Niveau</TableHead>
                    <TableHead className="text-right font-semibold">Valeur stock</TableHead>
                    <TableHead className="font-semibold">Dernier mouvement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Aucune alerte trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlerts.map((alert) => {
                      const severity = getSeverity(alert.pourcentageStock);
                      const severityStyles = {
                        critical: "bg-destructive/10 text-destructive border-destructive/20",
                        warning: "bg-warning/10 text-warning border-warning/20",
                        low: "bg-info/10 text-info border-info/20",
                      };
                      const severityLabels = {
                        critical: "Critique",
                        warning: "Avertissement",
                        low: "Faible",
                      };
                      return (
                        <TableRow key={alert.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">{alert.produitReference}</TableCell>
                          <TableCell>{alert.produitNom}</TableCell>
                          <TableCell>{alert.categorie}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Warehouse className="w-4 h-4 text-muted-foreground" />
                              {alert.entrepotNom}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              severity === 'critical' ? "text-destructive" :
                              severity === 'warning' ? "text-warning" : "text-info"
                            )}>
                              {alert.quantiteActuelle}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {alert.seuilMinimum}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-destructive">
                              {alert.ecart}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={cn("text-xs", severityStyles[severity])}>
                              {severityLabels[severity]}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.pourcentageStock}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {alert.valeurStock.toLocaleString()} MAD
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {alert.dernierMouvement ? new Date(alert.dernierMouvement).toLocaleDateString('fr-FR') : '-'}
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
      </div>
  );
}
