import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface EvolutionCAChartProps {
  period: PeriodType;
  clientId: string | null;
}

/** Plan Business : Évolution du CA (ligne). */
export function EvolutionCAChart({ period, clientId }: EvolutionCAChartProps) {
  const { factures, loading } = useFacturesVentes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const data = useMemo(() => {
    if (!factures?.length) return [];
    const now = new Date();
    const nb = 6;
    const out: { month: string; ca: number }[] = [];
    for (let i = nb - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      let f = factures.filter(
        (x) =>
          x.statut !== "annulee" &&
          (x.statut === "validee" || x.statut === "payee") &&
          new Date(x.date_facture).getMonth() === d.getMonth() &&
          new Date(x.date_facture).getFullYear() === d.getFullYear()
      );
      if (clientId) f = f.filter((x) => x.client_id === clientId);
      out.push({ month: key, ca: f.reduce((s, x) => s + Number(x.montant_ttc || 0), 0) });
    }
    return out;
  }, [factures, clientId]);

  if (loading) return <div className="rounded-xl border bg-card p-6 h-64 bg-muted animate-pulse" />;

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-bold mb-4">Évolution du CA</h3>
      {!data.length ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Aucune donnée</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="ca" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="CA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
