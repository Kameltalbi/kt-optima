import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Wallet,
} from "lucide-react";
import { useFinance } from "@/hooks/use-finance";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { fr } from "date-fns/locale/fr";

export default function FluxTresorerie() {
  const { accounts, previsions, calculateCashFlow, loading, formatCurrency } = useFinance();
  const [dateDebut, setDateDebut] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [dateFin, setDateFin] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const cashFlow = calculateCashFlow(dateDebut, dateFin);

  // Grouper les prévisions par mois
  const previsionsParMois = previsions
    .filter((p) => p.statut === "prevue")
    .reduce((acc, prevision) => {
      const mois = format(new Date(prevision.date_prevue), "yyyy-MM");
      if (!acc[mois]) {
        acc[mois] = { entrees: 0, sorties: 0 };
      }
      if (prevision.type === "entree") {
        acc[mois].entrees += prevision.montant;
      } else {
        acc[mois].sorties += prevision.montant;
      }
      return acc;
    }, {} as Record<string, { entrees: number; sorties: number }>);

  const moisOrdre = Object.keys(previsionsParMois).sort();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Flux de trésorerie</h2>
        <p className="text-muted-foreground mt-1">
          Visualisez l'évolution prévue de votre trésorerie
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="date_debut">Date de début</Label>
              <Input
                id="date_debut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="date_fin">Date de fin</Label>
              <Input
                id="date_fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  setDateDebut(format(startOfMonth(today), "yyyy-MM-dd"));
                  setDateFin(format(endOfMonth(today), "yyyy-MM-dd"));
                }}
              >
                Ce mois
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Solde actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Entrées prévues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(cashFlow.entrees)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Sorties prévues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(cashFlow.sorties)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Solde final prévu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              cashFlow.soldeFinal >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatCurrency(cashFlow.soldeFinal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution prévue par mois</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : moisOrdre.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune prévision pour cette période
            </div>
          ) : (
            <div className="space-y-4">
              {moisOrdre.map((mois) => {
                const { entrees, sorties } = previsionsParMois[mois];
                const fluxNet = entrees - sorties;
                return (
                  <div
                    key={mois}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">
                          {format(new Date(mois + "-01"), "MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(mois + "-01"), "dd MMM yyyy", { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Entrées</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(entrees)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Sorties</div>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(sorties)}
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <div className="text-sm text-muted-foreground">Flux net</div>
                        <div className={`font-bold text-lg ${
                          fluxNet >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {fluxNet >= 0 ? "+" : ""}
                          {formatCurrency(fluxNet)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projection Graphique (simplifié) */}
      <Card>
        <CardHeader>
          <CardTitle>Projection de trésorerie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Solde actuel</span>
              <span className="font-semibold">{formatCurrency(totalBalance)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, (totalBalance / Math.abs(cashFlow.soldeFinal || 1)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Solde final prévu</span>
              <span className={`font-semibold ${
                cashFlow.soldeFinal >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatCurrency(cashFlow.soldeFinal)}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Variation prévue</span>
                <Badge
                  variant={cashFlow.fluxNet >= 0 ? "default" : "destructive"}
                  className="text-sm"
                >
                  {cashFlow.fluxNet >= 0 ? "+" : ""}
                  {formatCurrency(cashFlow.fluxNet)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
