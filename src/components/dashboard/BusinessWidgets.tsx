import { ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { StatCard } from "./StatCard";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/use-plan";

// Mock data - À remplacer par de vraies données
const mockAchats = {
  total: 45000,
  aPayer: 12000,
};

const mockProduits = [
  { nom: "Produit A", ventes: 15000, marge: 4500 },
  { nom: "Produit B", ventes: 12000, marge: 3600 },
  { nom: "Produit C", ventes: 8000, marge: 2400 },
];

const mockStock = {
  valeur: 85000,
  alertes: 3,
};

export function BusinessWidgets() {
  const { features } = usePlan();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  return (
    <div className="space-y-6">
      {/* Achats — uniquement si module Achats (Business, Enterprise) */}
      {features.achats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Achats du mois"
            value={formatCurrency(mockAchats.total)}
            change="Période en cours"
            changeType="neutral"
            icon={ShoppingCart}
            iconColor="accent"
          />
          <StatCard
            title="Factures à payer"
            value={formatCurrency(mockAchats.aPayer)}
            change="En attente"
            changeType={mockAchats.aPayer > 0 ? "negative" : "neutral"}
            icon={ShoppingCart}
            iconColor="sand"
          />
        </div>
      )}

      {/* Produits / Services — tous les plans qui voient BusinessWidgets (Starter, Business, Enterprise) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Top produits / services</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProduits.map((produit, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-sm">{produit.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    Ventes: {formatCurrency(produit.ventes)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-success">
                    Marge: {formatCurrency(produit.marge)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((produit.marge / produit.ventes) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock (uniquement si activé) */}
      {features.stocks && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Package className="w-5 h-5 text-warning" />
              </div>
              <CardTitle>Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valeur du stock</span>
                <span className="text-lg font-bold">{formatCurrency(mockStock.valeur)}</span>
              </div>
              {mockStock.alertes > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">
                    {mockStock.alertes} alerte{mockStock.alertes > 1 ? "s" : ""} stock bas
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
