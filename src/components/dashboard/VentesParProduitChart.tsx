import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Plan Business : Ventes par produit/service. Placeholder — à connecter à facture_vente_lignes + produits. */
export function VentesParProduitChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Ventes par produit / service</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/ventes/factures">Ventes</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Données à connecter depuis les lignes de factures
        </div>
      </CardContent>
    </Card>
  );
}
