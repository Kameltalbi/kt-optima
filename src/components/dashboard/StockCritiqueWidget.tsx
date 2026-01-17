import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Plan Business : Stock critique (alertes visuelles). Placeholder — à connecter au module Stock. */
export function StockCritiqueWidget() {
  const alertes: { nom: string; qte: number; seuil: number }[] = []; // TODO: depuis StockAlerts / inventaire

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-warning" />
            <CardTitle className="text-base">Stock critique</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/stock/alertes">Alertes</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alertes.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
            <AlertTriangle className="w-4 h-4" />
            Aucune alerte de stock
          </div>
        ) : (
          <div className="space-y-2">
            {alertes.map((a, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded bg-warning/10 border border-warning/20 text-sm">
                <span>{a.nom}</span>
                <span className="text-warning">
                  {a.qte} &lt; {a.seuil}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
