import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { TrendingUp, FileText } from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useQuotes } from "@/hooks/use-quotes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Plan Départ : Total ventes (mois), Nb factures, Derniers devis/factures. */
export function DepartKPIs() {
  const { factures, loading: loadingF } = useFacturesVentes();
  const { quotes, loading: loadingQ } = useQuotes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const { totalVentes, nbFactures } = useMemo(() => {
    if (!factures?.length) return { totalVentes: 0, nbFactures: 0 };
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const period = factures.filter(
      (f) => new Date(f.date_facture) >= start && f.statut !== "annulee" && (f.statut === "validee" || f.statut === "payee")
    );
    const ca = period.reduce((s, f) => s + Number(f.montant_ttc || 0), 0);
    return { totalVentes: ca, nbFactures: period.length };
  }, [factures]);

  const derniers = useMemo(() => {
    const inv = (factures ?? [])
      .filter((f) => f.statut !== "annulee")
      .map((f) => ({ type: "facture" as const, id: f.id, ref: f.numero || `FAC-${f.id.slice(0, 8)}`, montant: Number(f.montant_ttc || 0), date: f.date_facture }));
    const dev = (quotes ?? [])
      .filter((q) => q.status !== "rejected" && q.status !== "expired")
      .map((q) => ({ type: "devis" as const, id: q.id, ref: q.number, montant: q.total, date: q.date }));
    return [...inv, ...dev]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [factures, quotes]);

  const loading = loadingF || loadingQ;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-28 bg-muted rounded animate-pulse" />
        <div className="h-28 bg-muted rounded animate-pulse" />
        <div className="md:col-span-2 h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total des ventes (mois en cours)"
          value={formatCurrency(totalVentes)}
          change="Mois en cours"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="primary"
        />
        <StatCard
          title="Nombre de factures émises"
          value={nbFactures.toString()}
          change="Sur la période"
          changeType="neutral"
          icon={FileText}
          iconColor="accent"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Derniers devis & factures</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ventes/factures">Voir tout</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {derniers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Aucun devis ou facture</p>
          ) : (
            <div className="space-y-2">
              {derniers.map((d) => (
                <div
                  key={`${d.type}-${d.id}`}
                  className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                >
                  <span className="font-medium text-sm">{d.ref}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(d.montant)} · {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
