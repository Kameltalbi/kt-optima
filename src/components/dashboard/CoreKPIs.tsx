import { StatCard } from "./StatCard";
import { TrendingUp, Wallet, FileText, DollarSign } from "lucide-react";
import { useMemo } from "react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { formatCurrency } from "@/lib/utils";

interface CoreKPIsProps {
  period: "month" | "quarter" | "year";
}

export function CoreKPIs({ period }: CoreKPIsProps) {
  const { factures, loading } = useFacturesVentes();

  const stats = useMemo(() => {
    if (!factures || factures.length === 0) {
      return {
        ca: 0,
        encaisse: 0,
        impayees: 0,
        solde: 0,
      };
    }

    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const facturesPeriod = factures.filter(
      (f) => new Date(f.date_facture) >= startDate && f.statut !== "annulee"
    );

    const ca = facturesPeriod
      .filter((f) => f.statut === "validee" || f.statut === "payee")
      .reduce((sum, f) => sum + Number(f.montant_ttc || 0), 0);

    const encaisse = facturesPeriod
      .filter((f) => f.statut === "payee")
      .reduce((sum, f) => sum + Number(f.montant_ttc || 0), 0);

    const impayees = facturesPeriod
      .filter((f) => f.statut === "validee")
      .reduce((sum, f) => sum + Number(f.montant_ttc || 0), 0);

    // Solde trésorerie = encaissé - décaissé (simplifié pour Core)
    const solde = encaisse;

    return { ca, encaisse, impayees, solde };
  }, [factures, period]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="erp-stat-card animate-pulse">
            <div className="h-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Chiffre d'affaires"
        value={formatCurrency(stats.ca)}
        change={`Période ${period === "month" ? "du mois" : period === "quarter" ? "du trimestre" : "de l'année"}`}
        changeType="neutral"
        icon={TrendingUp}
        iconColor="primary"
      />
      <StatCard
        title="Montant encaissé"
        value={formatCurrency(stats.encaisse)}
        change={stats.ca > 0 ? `${Math.round((stats.encaisse / stats.ca) * 100)}% du CA` : "Aucun encaissement"}
        changeType={stats.encaisse > 0 ? "positive" : "neutral"}
        icon={DollarSign}
        iconColor="success"
      />
      <StatCard
        title="Factures impayées"
        value={formatCurrency(stats.impayees)}
        change={`${factures?.filter((f) => f.statut === "validee").length || 0} factures`}
        changeType={stats.impayees > 0 ? "negative" : "neutral"}
        icon={FileText}
        iconColor="sand"
      />
      <StatCard
        title="Solde trésorerie"
        value={formatCurrency(stats.solde)}
        change="Encaissements"
        changeType={stats.solde > 0 ? "positive" : "neutral"}
        icon={Wallet}
        iconColor="primary"
      />
    </div>
  );
}
