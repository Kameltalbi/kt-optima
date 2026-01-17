import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCRM } from "@/hooks/use-crm";
import { useProspects } from "@/hooks/use-prospects";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { Building2, TrendingUp, Target, Users, DollarSign, BarChart3 } from "lucide-react";

export default function CRMReports() {
  const { company } = useAuth();
  const { companies, opportunities, loading: crmLoading } = useCRM();
  const { prospects, loading: prospectsLoading } = useProspects();
  const { factures, loading: invoicesLoading } = useFacturesVentes();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });

  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const loading = crmLoading || prospectsLoading || invoicesLoading;

  // Statistiques générales
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const prospectCompanies = companies.filter(c => c.status === 'prospect').length;
    const clientCompanies = companies.filter(c => c.status === 'client').length;
    const totalProspects = prospects.length;
    const qualifiedProspects = prospects.filter(p => p.status === 'qualified').length;
    const totalOpportunities = opportunities.length;
    const wonOpportunities = opportunities.filter(o => o.status === 'won').length;
    const activeOpportunities = opportunities.filter(o => o.status === 'active').length;
    const lostOpportunities = opportunities.filter(o => o.status === 'lost').length;

    // Calculer le pipeline (opportunités actives)
    const pipelineValue = opportunities
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + (o.estimated_amount * o.probability / 100), 0);

    // Calculer le CA des opportunités gagnées
    const wonValue = opportunities
      .filter(o => o.status === 'won')
      .reduce((sum, o) => sum + o.estimated_amount, 0);

    // Calculer le CA réel depuis les factures
    const currentDate = new Date();
    let startDate: Date;
    if (period === "month") {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    } else if (period === "quarter") {
      const quarter = Math.floor(currentDate.getMonth() / 3);
      startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
    } else {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
    }

    const invoicesInPeriod = factures.filter(f => {
      const invoiceDate = new Date(f.date_facture);
      return invoiceDate >= startDate && invoiceDate <= currentDate;
    });

    const revenue = invoicesInPeriod.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);

    return {
      totalCompanies,
      prospectCompanies,
      clientCompanies,
      totalProspects,
      qualifiedProspects,
      totalOpportunities,
      wonOpportunities,
      activeOpportunities,
      lostOpportunities,
      pipelineValue,
      wonValue,
      revenue,
    };
  }, [companies, prospects, opportunities, factures, period]);

  // Prospects par source
  const prospectsBySource = useMemo(() => {
    const sourceMap = new Map<string, number>();
    prospects.forEach(p => {
      const source = p.source || "Non spécifié";
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    return Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));
  }, [prospects]);

  // Opportunités par étape
  const opportunitiesByStage = useMemo(() => {
    const stageMap = new Map<string, number>();
    opportunities.forEach(o => {
      const stage = o.stage || "new";
      stageMap.set(stage, (stageMap.get(stage) || 0) + 1);
    });
    return Array.from(stageMap.entries()).map(([stage, count]) => ({ stage, count }));
  }, [opportunities]);

  // Top sociétés par CA
  const topCompaniesByRevenue = useMemo(() => {
    // Pour l'instant, on utilise les opportunités gagnées comme proxy
    // Dans une version future, on pourrait lier les factures aux sociétés CRM
    const companyMap = new Map<string, { name: string; revenue: number }>();
    
    opportunities
      .filter(o => o.status === 'won')
      .forEach(o => {
        const company = companies.find(c => c.id === o.crm_company_id);
        if (company) {
          const existing = companyMap.get(company.id) || { name: company.name, revenue: 0 };
          existing.revenue += o.estimated_amount;
          companyMap.set(company.id, existing);
        }
      });

    return Array.from(companyMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [opportunities, companies]);

  const stageLabels: Record<string, string> = {
    new: "Nouveau",
    qualification: "Qualification",
    proposal: "Proposition",
    negotiation: "Négociation",
    won: "Gagné",
    lost: "Perdu",
  };

  if (loading) {
    return (
      <MainLayout title="Rapports CRM" subtitle="Statistiques et analyses">
        <div className="text-center py-8">Chargement...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Rapports CRM" subtitle="Statistiques et analyses">
      <div className="space-y-6">
        {/* Période selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Rapports CRM</h2>
          <Select value={period} onValueChange={(value: "month" | "quarter" | "year") => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sociétés</p>
                  <p className="text-xl font-semibold">{stats.totalCompanies}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.prospectCompanies} prospects, {stats.clientCompanies} clients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <p className="text-xl font-semibold">{formatCurrency(stats.pipelineValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeOpportunities} opportunités actives
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-xl font-semibold">{formatCurrency(stats.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Période sélectionnée
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prospects</p>
                  <p className="text-xl font-semibold">{stats.totalProspects}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.qualifiedProspects} qualifiés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prospects par source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Prospects par source
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prospectsBySource.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              ) : (
                <div className="space-y-3">
                  {prospectsBySource.map(({ source, count }) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm">{source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / stats.totalProspects) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunités par étape */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Opportunités par étape
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunitiesByStage.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée disponible
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunitiesByStage.map(({ stage, count }) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm">{stageLabels[stage] || stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(count / stats.totalOpportunities) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top sociétés par CA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Top sociétés par chiffre d'affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCompaniesByRevenue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="space-y-3">
                {topCompaniesByRevenue.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(company.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résumé des opportunités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Opportunités gagnées</p>
                <p className="text-2xl font-semibold text-success">{stats.wonOpportunities}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.wonValue)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Opportunités actives</p>
                <p className="text-2xl font-semibold text-primary">{stats.activeOpportunities}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.pipelineValue)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Opportunités perdues</p>
                <p className="text-2xl font-semibold text-destructive">{stats.lostOpportunities}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taux: {stats.totalOpportunities > 0 
                    ? Math.round((stats.lostOpportunities / stats.totalOpportunities) * 100) 
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
