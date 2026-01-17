import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { TrendingUp, DollarSign, FileText, Users } from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useClients } from "@/hooks/use-clients";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import type { PeriodType } from "./DashboardFilters";

interface StarterKPIsProps {
  period: PeriodType;
  clientId: string | null;
}

/** Plan Starter : CA, Montant encaissé, En attente de paiement, Nombre de clients actifs. */
export function StarterKPIs({ period, clientId }: StarterKPIsProps) {
  const { factures, loading: lF } = useFacturesVentes();
  const { clients, loading: lC } = useClients();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const { ca, encaisse, enAttente } = useMemo(() => {
    if (!factures?.length) return { ca: 0, encaisse: 0, enAttente: 0 };
    const now = new Date();
    let start: Date;
    if (period === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else start = new Date(now.getFullYear(), 0, 1);

    let f = factures.filter(
      (x) => new Date(x.date_facture) >= start && x.statut !== "annulee" && (x.statut === "validee" || x.statut === "payee")
    );
    if (clientId) f = f.filter((x) => x.client_id === clientId);

    const ca = f.reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const encaisse = f.filter((x) => x.statut === "payee").reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    const enAttente = f.filter((x) => x.statut === "validee").reduce((s, x) => s + Number(x.montant_ttc || 0), 0);
    return { ca, encaisse, enAttente };
  }, [factures, period, clientId]);

  const nbClientsActifs = useMemo(() => {
    return (clients ?? []).filter((c) => c.actif === true).length;
  }, [clients]);

  const loading = lF || lC;
  const periodLabel = period === "month" ? "du mois" : period === "quarter" ? "du trimestre" : "de l'année";

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Chiffre d'affaires" value={formatCurrency(ca)} change={`Période ${periodLabel}`} changeType="neutral" icon={TrendingUp} iconColor="primary" />
      <StatCard
        title="Montant encaissé"
        value={formatCurrency(encaisse)}
        change={ca > 0 ? `${Math.round((encaisse / ca) * 100)}% du CA` : "—"}
        changeType={encaisse > 0 ? "positive" : "neutral"}
        icon={DollarSign}
        iconColor="success"
      />
      <StatCard
        title="En attente de paiement"
        value={formatCurrency(enAttente)}
        change={`Factures à encaisser`}
        changeType={enAttente > 0 ? "negative" : "neutral"}
        icon={FileText}
        iconColor="sand"
      />
      <StatCard title="Clients actifs" value={nbClientsActifs.toString()} change="Actifs" changeType="neutral" icon={Users} iconColor="accent" />
    </div>
  );
}
