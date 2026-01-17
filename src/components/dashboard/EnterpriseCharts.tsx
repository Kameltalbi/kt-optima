import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calculator, Users, FileText } from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useExpenseNotes } from "@/hooks/use-expense-notes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface EnterpriseChartsProps {
  period: PeriodType;
  clientId: string | null;
}

/** Plan Enterprise : Performance multi-périodes, Analyse coûts, Répartition (effectifs), Notes de frais. */
export function EnterpriseCharts({ period, clientId }: EnterpriseChartsProps) {
  const { factures, loading: lF } = useFacturesVentes();
  const { expenseNotes, loading: lN } = useExpenseNotes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const perfData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    let f = (factures ?? []).filter(
      (x) =>
        x.statut !== "annulee" &&
        (x.statut === "validee" || x.statut === "payee") &&
        new Date(x.date_facture).getMonth() === d.getMonth() &&
        new Date(x.date_facture).getFullYear() === d.getFullYear()
    );
    if (clientId) f = f.filter((x) => x.client_id === clientId);
    return {
      month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      ca: f.reduce((s, x) => s + Number(x.montant_ttc || 0), 0),
    };
  });

  const depensesByCat = (expenseNotes ?? [])
    .filter((n) => n.status === "valide" || n.status === "paye")
    .reduce((acc, n) => {
      const cat = (n.items?.[0] as any)?.category?.name ?? "Autre";
      acc[cat] = (acc[cat] || 0) + Number(n.total_amount || 0);
      return acc;
    }, {} as Record<string, number>);
  const depData = Object.entries(depensesByCat).map(([name, value]) => ({ name, value }));

  const loading = lF || lN;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Performance multi-périodes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-52 bg-muted rounded animate-pulse" />
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="ca" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Analyse des coûts (notes de frais)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-52 bg-muted rounded animate-pulse" />
          ) : depData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Montant" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Répartition RH (effectifs)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">À connecter (départements)</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Notes de frais par département</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">À connecter (département employé)</div>
        </CardContent>
      </Card>
    </div>
  );
}
