import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { TrendingUp, Wallet, Package, Receipt, Users, Calendar, FileText } from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useEncaissements } from "@/hooks/use-encaissements";
import { useEmployes } from "@/hooks/use-employes";
import { useExpenseNotes } from "@/hooks/use-expense-notes";
import { usePlan } from "@/hooks/use-plan";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface BusinessKPIsProps {
  period: PeriodType;
  clientId: string | null;
}

/** Plan Business : CA, Résultat prévisionnel, Trésorerie, Valeur stock, Dépenses internes. + RH si activé. */
export function BusinessKPIs({ period, clientId }: BusinessKPIsProps) {
  const { factures, loading: lF } = useFacturesVentes();
  const { encaissements, loading: lE } = useEncaissements();
  const { employes, loading: lEmp } = useEmployes();
  const { expenseNotes, loading: lN } = useExpenseNotes();
  const { features } = usePlan();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const now = new Date();
  let start: Date;
  if (period === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
  } else start = new Date(now.getFullYear(), 0, 1);

  const { ca, tresorerie, depensesInternes } = useMemo(() => {
    let f = (factures ?? []).filter(
      (x) => new Date(x.date_facture) >= start && x.statut !== "annulee" && (x.statut === "validee" || x.statut === "payee")
    );
    if (clientId) f = f.filter((x) => x.client_id === clientId);
    const ca = f.reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const enc = (encaissements ?? []).filter((e) => new Date(e.date) >= start).reduce((s, e) => s + Number(e.montant || 0), 0);
    const dep = (expenseNotes ?? []).filter((n) => (n.status === "valide" || n.status === "paye") && new Date(n.date) >= start).reduce((s, n) => s + Number(n.total_amount || 0), 0);
    return { ca, tresorerie: enc, depensesInternes: dep };
  }, [factures, encaissements, expenseNotes, start, clientId]);

  const resultatPrevisionnel = ca - depensesInternes;
  const valeurStock = 0; // TODO: intégrer stock réel
  const nbEmployes = (employes ?? []).filter((e) => e.actif).length;
  const congesEnCours = 0; // TODO: intégrer congés
  const notesFraisEnAttente = (expenseNotes ?? []).filter((n) => n.status === "soumis").length;

  const loading = lF || lE;

  const periodLabel = period === "month" ? "du mois" : period === "quarter" ? "du trimestre" : "de l'année";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Chiffre d'affaires" value={formatCurrency(ca)} change={`Période ${periodLabel}`} changeType="neutral" icon={TrendingUp} iconColor="primary" />
        <StatCard title="Résultat prévisionnel" value={formatCurrency(resultatPrevisionnel)} change="CA − dépenses" changeType={resultatPrevisionnel >= 0 ? "positive" : "negative"} icon={TrendingUp} iconColor="success" />
        <StatCard title="Trésorerie disponible" value={formatCurrency(tresorerie)} change="Encaissements période" changeType="neutral" icon={Wallet} iconColor="primary" />
        <StatCard title="Valeur du stock" value={formatCurrency(valeurStock)} change="Estimation" changeType="neutral" icon={Package} iconColor="accent" />
        <StatCard title="Dépenses internes" value={formatCurrency(depensesInternes)} change="Notes de frais" changeType="neutral" icon={Receipt} iconColor="sand" />
      </div>

      {features.rh && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Effectif" value={nbEmployes.toString()} change="Employés actifs" changeType="neutral" icon={Users} iconColor="primary" />
          <StatCard title="Congés en cours" value={congesEnCours.toString()} change="En cours" changeType="neutral" icon={Calendar} iconColor="accent" />
          {features.notesFrais && (
            <StatCard title="Notes de frais à valider" value={notesFraisEnAttente.toString()} change="En attente" changeType={notesFraisEnAttente > 0 ? "negative" : "neutral"} icon={FileText} iconColor="sand" />
          )}
        </div>
      )}
    </div>
  );
}
