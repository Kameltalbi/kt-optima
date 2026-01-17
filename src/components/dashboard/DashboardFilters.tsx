import { Calendar, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import type { PlanType } from "./dashboardConfig";

export type PeriodType = "month" | "quarter" | "year";

interface DashboardFiltersProps {
  plan: PlanType;
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  clientId: string | null;
  onClientChange: (id: string | null) => void;
  className?: string;
}

/** Départ : aucun filtre. Starter+ : période + client. */
export function DashboardFilters({
  plan,
  period,
  onPeriodChange,
  clientId,
  onClientChange,
  className = "",
}: DashboardFiltersProps) {
  const { clients } = useClients();
  const showPeriod = plan !== "depart";
  const showClient = plan !== "depart";

  if (!showPeriod && !showClient) return null;

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {showPeriod && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {showClient && (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <Select
            value={clientId ?? "all"}
            onValueChange={(v) => onClientChange(v === "all" ? null : v)}
          >
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              {(clients ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
