import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCRM } from "@/hooks/use-crm";
import { useProspects } from "@/hooks/use-prospects";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Users, TrendingUp, Target, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  new: { label: "Nouveau", color: "bg-blue-500/10 text-blue-600" },
  contacted: { label: "Contacté", color: "bg-purple-500/10 text-purple-600" },
  qualified: { label: "Qualifié", color: "bg-cyan-500/10 text-cyan-600" },
  proposal: { label: "Proposition", color: "bg-warning/10 text-warning" },
  won: { label: "Gagné", color: "bg-success/10 text-success" },
  lost: { label: "Perdu", color: "bg-destructive/10 text-destructive" },
};

export default function CRM() {
  const { company } = useAuth();
  const { companies, opportunities, loading: crmLoading } = useCRM();
  const { prospects, loading: prospectsLoading } = useProspects();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const navigate = useNavigate();

  const loading = crmLoading || prospectsLoading;

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const prospectCompanies = companies.filter(c => c.status === 'prospect').length;
    const clientCompanies = companies.filter(c => c.status === 'client').length;
    const totalProspects = prospects.length;
    
    // Pipeline des opportunités
    const activeOpportunities = opportunities.filter(o => o.status === 'active');
    const pipelineValue = activeOpportunities.reduce(
      (sum, o) => sum + (o.estimated_amount * o.probability / 100), 
      0
    );
    
    // Opportunités gagnées
    const wonOpportunities = opportunities.filter(o => o.status === 'won');
    const wonValue = wonOpportunities.reduce((sum, o) => sum + o.estimated_amount, 0);
    
    // Taux de conversion
    const totalOpportunities = opportunities.length;
    const conversionRate = totalOpportunities > 0 
      ? Math.round((wonOpportunities.length / totalOpportunities) * 100) 
      : 0;

    return {
      totalCompanies,
      prospectCompanies,
      clientCompanies,
      totalProspects,
      pipelineValue,
      wonValue,
      conversionRate,
      activeOpportunities: activeOpportunities.length,
    };
  }, [companies, prospects, opportunities]);

  if (loading) {
    return (
      <MainLayout title="CRM" subtitle="Gestion de la relation client">
        <div className="text-center py-8">Chargement...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="CRM" subtitle="Gestion de la relation client">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/companies')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Sociétés</p>
                  <p className="text-xl font-semibold">{stats.totalCompanies}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.prospectCompanies} prospects, {stats.clientCompanies} clients
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/prospects')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Prospects</p>
                  <p className="text-xl font-semibold">{stats.totalProspects}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/opportunities')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <p className="text-xl font-semibold">{formatCurrency(stats.pipelineValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeOpportunities} opportunités actives
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
                  <p className="text-sm text-muted-foreground">Taux conversion</p>
                  <p className="text-xl font-semibold">{stats.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.wonValue)} gagnés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/companies')}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Sociétés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérez vos sociétés clientes et prospects
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/prospects')}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Suivez vos leads et convertissez-les en clients
              </p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/crm/reports')}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rapports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analysez vos performances commerciales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
