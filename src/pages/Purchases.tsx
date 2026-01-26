import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, ShoppingCart, TrendingUp } from "lucide-react";
import type { Purchase, Supplier } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";

export default function Purchases() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const [searchTerm, setSearchTerm] = useState("");
  const [purchases] = useState<(Purchase & { supplier_name: string; status: string })[]>([]);
  const [suppliers] = useState<Supplier[]>([]);

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const pendingAmount = purchases
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.total, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success border-0">Payé</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-0">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Achats" subtitle="Gérez vos achats et fournisseurs">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total achats</p>
                  <p className="text-xl font-semibold">{formatCurrency(totalPurchases)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-xl font-semibold">{formatCurrency(pendingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseurs</p>
                  <p className="text-xl font-semibold">{suppliers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un achat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel achat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel achat</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground text-sm">
                  Formulaire de création d'achat à implémenter.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Liste des achats</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.supplier_name}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{formatCurrency(purchase.total)}</TableCell>
                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
