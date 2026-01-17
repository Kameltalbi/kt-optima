import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";

/** Plan Départ : Chiffre d'affaires mensuel (barres simples). 6 derniers mois. */
export function CaMensuelBarChart() {
  const { factures, loading } = useFacturesVentes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const data = useMemo(() => {
    if (!factures?.length) return [];
    const now = new Date();
    const out: { month: string; ca: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const ca = factures
        .filter(
          (f) =>
            f.statut !== "annulee" &&
            (f.statut === "validee" || f.statut === "payee") &&
            new Date(f.date_facture).getMonth() === d.getMonth() &&
            new Date(f.date_facture).getFullYear() === d.getFullYear()
        )
        .reduce((s, f) => s + Number(f.montant_ttc || 0), 0);
      out.push({ month: key, ca });
    }
    return out;
  }, [factures]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">Chiffre d'affaires mensuel</h3>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-bold mb-4">Chiffre d'affaires mensuel</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Aucune donnée</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="ca" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
