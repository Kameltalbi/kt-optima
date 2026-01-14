import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo } from "react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";

interface FactureEncaissementChartProps {
  period: "month" | "quarter" | "year";
}

export function FactureEncaissementChart({ period }: FactureEncaissementChartProps) {
  const { factures, loading } = useFacturesVentes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const data = useMemo(() => {
    if (!factures || factures.length === 0) {
      return [];
    }

    const now = new Date();
    let months: number;
    
    switch (period) {
      case "month":
        months = 6;
        break;
      case "quarter":
        months = 6;
        break;
      case "year":
        months = 12;
        break;
    }

    const dataMap = new Map<string, { facture: number; encaisse: number }>();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      dataMap.set(key, { facture: 0, encaisse: 0 });
    }

    factures.forEach((facture) => {
      if (facture.statut === "annulee") return;
      
      const date = new Date(facture.date_facture);
      const key = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      
      if (dataMap.has(key)) {
        const current = dataMap.get(key)!;
        if (facture.statut === "validee" || facture.statut === "payee") {
          current.facture += Number(facture.montant_ttc || 0);
        }
        if (facture.statut === "payee") {
          current.encaisse += Number(facture.montant_ttc || 0);
        }
        dataMap.set(key, current);
      }
    });

    return Array.from(dataMap.entries()).map(([month, values]) => ({
      month,
      facture: values.facture,
      encaisse: values.encaisse,
    }));
  }, [factures, period]);

  if (loading) {
    return (
      <div className="erp-card animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="erp-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Facturé vs Encaissé</h3>
            <p className="text-sm text-muted-foreground">Évolution mensuelle</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Facturé vs Encaissé</h3>
          <p className="text-sm text-muted-foreground">Évolution mensuelle</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="factureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="encaisseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px'
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => value === 'facture' ? 'Facturé' : 'Encaissé'}
            />
            <Line
              type="monotone"
              dataKey="facture"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#factureGradient)"
              name="facture"
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="encaisse"
              stroke="hsl(var(--success))"
              strokeWidth={3}
              fill="url(#encaisseGradient)"
              name="encaisse"
              dot={{ fill: 'hsl(var(--success))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Facturé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Encaissé</span>
        </div>
      </div>
    </div>
  );
}
