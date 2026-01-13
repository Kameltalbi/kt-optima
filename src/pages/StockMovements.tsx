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
import { 
  Search, 
  ArrowDownCircle,
  ArrowUpCircle,
  PackageCheck,
  Truck,
  Package,
  Download,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface StockMovement {
  id: string;
  date: string;
  type: 'entree' | 'sortie' | 'ajustement';
  origine: string;
  origineNumero: string;
  produitId: string;
  produitNom: string;
  produitReference: string;
  entrepotId: string;
  entrepotNom: string;
  quantite: number;
  unite: string;
  motif?: string;
}

// Mock data
const mockMovements: StockMovement[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "entree",
    origine: "Réception",
    origineNumero: "REC-2024-001",
    produitId: "P001",
    produitNom: "Ordinateur portable HP",
    produitReference: "HP-001",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: 100,
    unite: "Unité",
  },
  {
    id: "2",
    date: "2024-01-15",
    type: "entree",
    origine: "Réception",
    origineNumero: "REC-2024-001",
    produitId: "P002",
    produitNom: "Imprimante Canon",
    produitReference: "CAN-002",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: 50,
    unite: "Unité",
  },
  {
    id: "3",
    date: "2024-01-14",
    type: "sortie",
    origine: "Livraison",
    origineNumero: "BL-2024-001",
    produitId: "P001",
    produitNom: "Ordinateur portable HP",
    produitReference: "HP-001",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: -25,
    unite: "Unité",
  },
  {
    id: "4",
    date: "2024-01-13",
    type: "entree",
    origine: "Réception",
    origineNumero: "REC-2024-002",
    produitId: "P004",
    produitNom: "Chaise ergonomique",
    produitReference: "CH-004",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: 30,
    unite: "Unité",
  },
  {
    id: "5",
    date: "2024-01-12",
    type: "sortie",
    origine: "Livraison",
    origineNumero: "BL-2024-002",
    produitId: "P003",
    produitNom: "Bureau moderne",
    produitReference: "BUR-003",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: -15,
    unite: "Unité",
  },
  {
    id: "6",
    date: "2024-01-10",
    type: "ajustement",
    origine: "Inventaire",
    origineNumero: "AJ-2024-001",
    produitId: "P005",
    produitNom: "Fournitures bureau",
    produitReference: "FOU-005",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: -5,
    unite: "Unité",
    motif: "Casse constatée lors de l'inventaire",
  },
  {
    id: "7",
    date: "2024-01-10",
    type: "ajustement",
    origine: "Inventaire",
    origineNumero: "AJ-2024-001",
    produitId: "P006",
    produitNom: "Écran LED 24 pouces",
    produitReference: "ECR-006",
    entrepotId: "2",
    entrepotNom: "Entrepôt Secondaire",
    quantite: 2,
    unite: "Unité",
    motif: "Retour client non facturé",
  },
  {
    id: "8",
    date: "2024-01-08",
    type: "entree",
    origine: "Réception",
    origineNumero: "REC-2024-003",
    produitId: "P007",
    produitNom: "Clavier mécanique",
    produitReference: "CL-007",
    entrepotId: "2",
    entrepotNom: "Entrepôt Secondaire",
    quantite: 50,
    unite: "Unité",
  },
  {
    id: "9",
    date: "2024-01-07",
    type: "sortie",
    origine: "Livraison",
    origineNumero: "BL-2024-003",
    produitId: "P002",
    produitNom: "Imprimante Canon",
    produitReference: "CAN-002",
    entrepotId: "3",
    entrepotNom: "Dépôt Casablanca",
    quantite: -8,
    unite: "Unité",
  },
  {
    id: "10",
    date: "2024-01-05",
    type: "sortie",
    origine: "Livraison",
    origineNumero: "BL-2024-004",
    produitId: "P001",
    produitNom: "Ordinateur portable HP",
    produitReference: "HP-001",
    entrepotId: "1",
    entrepotNom: "Entrepôt Principal",
    quantite: -30,
    unite: "Unité",
  },
];

const typeStyles = {
  entree: "bg-success/10 text-success border-0",
  sortie: "bg-destructive/10 text-destructive border-0",
  ajustement: "bg-warning/10 text-warning border-0",
};

const typeLabels = {
  entree: "Entrée",
  sortie: "Sortie",
  ajustement: "Ajustement",
};

const typeIcons = {
  entree: ArrowDownCircle,
  sortie: ArrowUpCircle,
  ajustement: Package,
};

export default function StockMovements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const mockWarehouses = [
    { id: "1", nom: "Entrepôt Principal" },
    { id: "2", nom: "Entrepôt Secondaire" },
    { id: "3", nom: "Dépôt Casablanca" },
  ];

  const filteredMovements = mockMovements.filter((movement) => {
    const matchesSearch = movement.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.produitReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.origineNumero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    const matchesWarehouse = warehouseFilter === "all" || movement.entrepotId === warehouseFilter;
    const matchesDateFrom = !dateFrom || movement.date >= dateFrom;
    const matchesDateTo = !dateTo || movement.date <= dateTo;
    return matchesSearch && matchesType && matchesWarehouse && matchesDateFrom && matchesDateTo;
  });

  const totalEntries = mockMovements.filter(m => m.type === "entree").reduce((sum, m) => sum + Math.abs(m.quantite), 0);
  const totalExits = mockMovements.filter(m => m.type === "sortie").reduce((sum, m) => sum + Math.abs(m.quantite), 0);
  const totalAdjustments = mockMovements.filter(m => m.type === "ajustement").length;

  return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total entrées</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {totalEntries}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total sorties</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {totalExits}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ajustements</p>
                  <p className="text-2xl font-bold mt-1 text-warning">
                    {totalAdjustments}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <Package className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total mouvements</p>
                  <p className="text-2xl font-bold mt-1">
                    {mockMovements.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <ArrowDownCircle className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par produit, référence ou origine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="entree">Entrées</SelectItem>
              <SelectItem value="sortie">Sorties</SelectItem>
              <SelectItem value="ajustement">Ajustements</SelectItem>
            </SelectContent>
          </Select>
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
          <Input
            type="date"
            placeholder="Date début"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="Date fin"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
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
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Origine</TableHead>
                    <TableHead className="font-semibold">Référence</TableHead>
                    <TableHead className="font-semibold">Produit</TableHead>
                    <TableHead className="font-semibold">Dépôt</TableHead>
                    <TableHead className="text-right font-semibold">Quantité</TableHead>
                    <TableHead className="font-semibold">Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun mouvement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements.map((movement) => {
                      const Icon = typeIcons[movement.type];
                      return (
                        <TableRow key={movement.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            {new Date(movement.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs", typeStyles[movement.type])}>
                              <Icon className="w-3 h-3 mr-1 inline" />
                              {typeLabels[movement.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {movement.type === "entree" && <PackageCheck className="w-4 h-4 text-success" />}
                              {movement.type === "sortie" && <Truck className="w-4 h-4 text-destructive" />}
                              {movement.type === "ajustement" && <Package className="w-4 h-4 text-warning" />}
                              <span className="font-medium">{movement.origine}</span>
                              <span className="text-muted-foreground">({movement.origineNumero})</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{movement.produitReference}</TableCell>
                          <TableCell>{movement.produitNom}</TableCell>
                          <TableCell>{movement.entrepotNom}</TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              movement.quantite > 0 ? "text-success" : "text-destructive"
                            )}>
                              {movement.quantite > 0 ? '+' : ''}{movement.quantite} {movement.unite}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {movement.motif || '-'}
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
