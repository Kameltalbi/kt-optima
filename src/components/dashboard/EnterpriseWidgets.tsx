import { Calculator, Users, Car, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - À remplacer par de vraies données
const mockCompta = {
  resultat: 125000,
  tvaCollectee: 15000,
  tvaDeductible: 8000,
  charges: 45000,
};

const mockRH = {
  effectif: 12,
  masseSalariale: 85000,
  salairesAPayer: 85000,
};

const mockParc = {
  valeur: 250000,
  echeances: 2,
};

const mockTresorerie = {
  prevision: 180000,
  echeances: 45000,
};

export function EnterpriseWidgets() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  return (
    <div className="space-y-6">
      {/* Comptabilité */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Calculator className="w-5 h-5 text-secondary" />
            </div>
            <CardTitle>Comptabilité</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Résultat estimé</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(mockCompta.resultat)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">TVA nette</p>
              <p className="text-2xl font-bold">
                {formatCurrency(mockCompta.tvaCollectee - mockCompta.tvaDeductible)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Collectée: {formatCurrency(mockCompta.tvaCollectee)} | Déductible:{" "}
                {formatCurrency(mockCompta.tvaDeductible)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Effectif"
          value={mockRH.effectif.toString()}
          change="Employés"
          changeType="neutral"
          icon={Users}
          iconColor="primary"
        />
        <StatCard
          title="Masse salariale"
          value={formatCurrency(mockRH.masseSalariale)}
          change="Mensuelle"
          changeType="neutral"
          icon={Users}
          iconColor="accent"
        />
        <StatCard
          title="Salaires à payer"
          value={formatCurrency(mockRH.salairesAPayer)}
          change="Prochaine paie"
          changeType="neutral"
          icon={Users}
          iconColor="sand"
        />
      </div>

      {/* Gestion de parc */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Car className="w-5 h-5 text-info" />
            </div>
            <CardTitle>Gestion de parc</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valeur des actifs</p>
              <p className="text-2xl font-bold">{formatCurrency(mockParc.valeur)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Échéances à venir</p>
              <p className="text-2xl font-bold text-warning">
                {mockParc.echeances} échéance{mockParc.echeances > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trésorerie avancée */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <CardTitle>Prévision de trésorerie</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prévision</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(mockTresorerie.prevision)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Échéances à venir</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(mockTresorerie.echeances)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
