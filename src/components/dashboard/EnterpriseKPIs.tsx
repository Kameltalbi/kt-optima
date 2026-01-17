import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { TrendingUp, Calculator, Users, Receipt, Percent } from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useEmployes } from "@/hooks/use-employes";
import { useExpenseNotes } from "@/hooks/use-expense-notes";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface EnterpriseKPIsProps {
  period: PeriodType;
  clientId: string | null;
}

/** Plan Enterprise : CA global, Résultat net, Masse salariale, Dépenses par catégorie, TVA collectée/déductible. */
export function EnterpriseKPIs({ period, clientId }: EnterpriseKPIsProps) {
  const { factures, loading: lF } = useFacturesVentes();
  const { employes, loading: lE } = useEmployes();
  const { expenseNotes, loading: lN } = useExpenseNotes();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const now = new Date();
  let start: Date;
  if (period === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
  } else start = new Date(now.getFullYear(), 0, 1);

  const { ca, depensesTotal, tvaCollectee, tvaDeductible } = useMemo(() => {
    let f = (factures ?? []).filter(
      (x) => new Date(x.date_facture) >= start && x.statut !== "annulee" && (x.statut === "validee" || x.statut === "payee")
    );
    if (clientId) f = f.filter((x) => x.client_id === clientId);
    const ca = f.reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const ht = f.reduce((s, x) => s + Number((x as any).montant_ht || 0), 0);
    const tvaC = f.reduce((s, x) => s + Number((x as any).montant_tva || 0), 0);
    const dep = (expenseNotes ?? []).filter((n) => (n.status === "valide" || n.status === "paye") && new Date(n.date) >= start).reduce((s, n) => s + Number(n.total_amount || 0), 0);
    return { ca, depensesTotal: dep, tvaCollectee: tvaC, tvaDeductible: 0 }; // tvaDeductible à connecter achats/fournisseurs
  }, [factures, expenseNotes, start, clientId]);

  const masseSalariale = useMemo(() => {
    return (employes ?? []).filter((e) => e.actif).reduce((s, e) => s + Number(e.salaire_base || 0), 0);
  }, [employes]);

  const resultatNet = ca - depensesTotal;
  const tvaNette = tvaCollectee - tvaDeductible;

  const loading = lF || lE;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard title="CA global" value={formatCurrency(ca)} change="Période" changeType="neutral" icon={TrendingUp} iconColor="primary" />
      <StatCard title="Résultat net" value={formatCurrency(resultatNet)} change="Estimé" changeType={resultatNet >= 0 ? "positive" : "negative"} icon={Calculator} iconColor="success" />
      <StatCard title="Masse salariale" value={formatCurrency(masseSalariale)} change="Mensuelle" changeType="neutral" icon={Users} iconColor="accent" />
      <StatCard title="Dépenses (cat.)" value={formatCurrency(depensesTotal)} change="Notes de frais" changeType="neutral" icon={Receipt} iconColor="sand" />
      <StatCard title="TVA nette" value={formatCurrency(tvaNette)} change={`Collectée ${formatCurrency(tvaCollectee)}`} changeType="neutral" icon={Percent} iconColor="primary" />
    </div>
  );
}
