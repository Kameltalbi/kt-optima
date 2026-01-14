import { Users, UserPlus, TrendingUp } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { StatCard } from "./StatCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";

export function CoreCRMWidget() {
  const { clients, loading } = useClients();
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const stats = {
    total: clients?.length || 0,
    actifs: clients?.filter((c) => c.actif === true).length || 0,
    topClients: clients
      ?.map((c) => ({
        id: c.id,
        nom: c.nom,
        solde: Number(c.solde_actuel || c.solde_initial || 0),
      }))
      .sort((a, b) => b.solde - a.solde)
      .slice(0, 3) || [],
  };

  if (loading) {
    return (
      <div className="erp-card animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats CRM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Clients actifs"
          value={stats.actifs.toString()}
          change={`Sur ${stats.total} clients`}
          changeType="neutral"
          icon={Users}
          iconColor="primary"
        />
        <StatCard
          title="Nouveaux clients"
          value={clients?.filter((c) => {
            const created = new Date(c.created_at);
            const now = new Date();
            const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 30;
          }).length.toString() || "0"}
          change="30 derniers jours"
          changeType="positive"
          icon={UserPlus}
          iconColor="success"
        />
      </div>

      {/* Top Clients */}
      <div className="erp-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Top clients</h3>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/crm/contacts">Voir tout</Link>
          </Button>
        </div>

        {stats.topClients.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucun client pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{client.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      Solde: {formatCurrency(client.solde)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
