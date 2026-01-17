import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface FacturesPayeesImpayeesPieProps {
  period: PeriodType;
  clientId: string | null;
}

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

/** Plan Starter : Factures payées vs impayées (camembert). */
export function FacturesPayeesImpayeesPie({ period, clientId }: FacturesPayeesImpayeesPieProps) {
  const { factures, loading } = useFacturesVentes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const data = useMemo(() => {
    if (!factures?.length) return [];
    const now = new Date();
    let start: Date;
    if (period === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else start = new Date(now.getFullYear(), 0, 1);

    let f = factures.filter((x) => new Date(x.date_facture) >= start && x.statut !== "annulee" && (x.statut === "validee" || x.statut === "payee"));
    if (clientId) f = f.filter((x) => x.client_id === clientId);

    const payees = f.filter((x) => x.statut === "payee").reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const impayees = f.filter((x) => x.statut === "validee").reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const out: { name: string; value: number }[] = [];
    if (payees > 0) out.push({ name: "Payées", value: payees });
    if (impayees > 0) out.push({ name: "Impayées", value: impayees });
    if (out.length === 0) out.push({ name: "Aucune", value: 1 });
    return out;
  }, [factures, period, clientId]);

  if (loading) return <div className="rounded-xl border bg-card p-6 h-64 bg-muted animate-pulse" />;

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-bold mb-4">Factures payées vs impayées</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
