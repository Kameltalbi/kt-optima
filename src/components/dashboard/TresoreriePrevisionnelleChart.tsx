import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEncaissements } from "@/hooks/use-encaissements";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";

/** Plan Business : Trésorerie prévisionnelle (encaissements cumulés par mois). */
export function TresoreriePrevisionnelleChart() {
  const { encaissements, loading } = useEncaissements();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const data = useMemo(() => {
    if (!encaissements?.length) return [];
    const now = new Date();
    const out: { month: string; encaisse: number; cumul: number }[] = [];
    let cumul = 0;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const enc = encaissements
        .filter(
          (e) => new Date(e.date).getMonth() === d.getMonth() && new Date(e.date).getFullYear() === d.getFullYear()
        )
        .reduce((s, e) => s + Number(e.montant || 0), 0);
      cumul += enc;
      out.push({ month: key, encaisse: enc, cumul });
    }
    return out;
  }, [encaissements]);

  if (loading) return <div className="rounded-xl border bg-card p-6 h-64 bg-muted animate-pulse" />;

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-bold mb-4">Trésorerie prévisionnelle</h3>
      {!data.length ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Aucune donnée</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tresoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="cumul" stroke="hsl(var(--primary))" fill="url(#tresoGrad)" strokeWidth={2} name="Cumul encaissements" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
