import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusStyles = {
  brouillon: "bg-muted text-muted-foreground",
  validee: "bg-warning/10 text-warning",
  payee: "bg-success/10 text-success",
  annulee: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  brouillon: "Brouillon",
  validee: "Validée",
  payee: "Payée",
  annulee: "Annulée",
};

export function CoreVentesWidget() {
  const { factures, loading } = useFacturesVentes();

  const recentFactures = factures
    ?.filter((f) => f.statut !== "annulee")
    .sort((a, b) => new Date(b.date_facture).getTime() - new Date(a.date_facture).getTime())
    .slice(0, 5) || [];

  if (loading) {
    return (
      <div className="erp-card animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="erp-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Dernières factures</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ventes/factures">Voir tout</Link>
        </Button>
      </div>

      {recentFactures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune facture pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentFactures.map((facture) => (
            <div
              key={facture.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{facture.numero || `FAC-${facture.id.slice(0, 8)}`}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Client #{facture.client_id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-sm">
                    {formatCurrency(Number(facture.montant_ttc || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(facture.date_facture).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <Badge className={cn("whitespace-nowrap", statusStyles[facture.statut as keyof typeof statusStyles])}>
                  {statusLabels[facture.statut as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
