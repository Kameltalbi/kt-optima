import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Eye,
  FileText,
  Calendar,
  Building2,
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { CRMOpportunity } from "@/types/database";

const stages: CRMOpportunity['stage'][] = ['new', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];

const stageLabels: Record<CRMOpportunity['stage'], string> = {
  new: 'Prospect',
  qualification: 'Qualification',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  won: 'Gagné',
  lost: 'Perdu',
};

export default function CRMPipeline() {
  const { company } = useAuth();
  const { opportunities, companies, updateOpportunity } = useCRM();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const navigate = useNavigate();
  const [salesRepFilter, setSalesRepFilter] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<CRMOpportunity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredOpportunities = opportunities.filter((opp) => {
    return salesRepFilter === "all" || opp.salesRepId === salesRepFilter;
  });

  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage] = filteredOpportunities.filter(opp => opp.stage === stage);
    return acc;
  }, {} as Record<CRMOpportunity['stage'], CRMOpportunity[]>);

  const getStageValue = (stage: CRMOpportunity['stage']): number => {
    return opportunitiesByStage[stage].reduce((sum, opp) => sum + opp.estimatedAmount, 0);
  };

  const getStageWeightedValue = (stage: CRMOpportunity['stage']): number => {
    return opportunitiesByStage[stage].reduce((sum, opp) => sum + (opp.estimatedAmount * opp.probability / 100), 0);
  };

  const handleStageChange = (oppId: string, newStage: CRMOpportunity['stage']) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;

    let newStatus: CRMOpportunity['status'] = 'active';
    if (newStage === 'won') {
      newStatus = 'won';
    } else if (newStage === 'lost') {
      newStatus = 'lost';
    }

    updateOpportunity(oppId, {
      stage: newStage,
      status: newStatus,
    });
  };

  const handleView = (opp: CRMOpportunity) => {
    setSelectedOpportunity(opp);
    setIsViewModalOpen(true);
  };

  const totalPipelineValue = filteredOpportunities
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + o.estimatedAmount, 0);
  const totalWeightedValue = filteredOpportunities
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + (o.estimatedAmount * o.probability / 100), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA pondéré</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalWeightedValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opportunités actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredOpportunities.filter(o => o.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Pipeline</CardTitle>
            <Select value={salesRepFilter} onValueChange={setSalesRepFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les responsables</SelectItem>
                <SelectItem value="user_1">Commercial 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageOpps = opportunitiesByStage[stage];
              const stageValue = getStageValue(stage);
              const stageWeightedValue = getStageWeightedValue(stage);

              return (
                <div key={stage} className="min-w-[200px]">
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1">{stageLabels[stage]}</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{stageOpps.length} opportunité{stageOpps.length > 1 ? 's' : ''}</p>
                      {stageValue > 0 && (
                        <>
                          <p>Total: {formatCurrency(stageValue)}</p>
                          <p>Pondéré: {formatCurrency(stageWeightedValue)}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 min-h-[400px]">
                    {stageOpps.map((opp) => {
                      const company = companies.find(c => c.id === opp.companyId);
                      return (
                        <Card
                          key={opp.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleView(opp)}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <p className="font-medium text-sm">{opp.name}</p>
                              {company && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {company.name}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">
                                  {formatCurrency(opp.estimatedAmount)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {opp.probability}%
                                </Badge>
                              </div>
                              {opp.expectedCloseDate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(opp.expectedCloseDate).toLocaleDateString('fr-FR', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {stageOpps.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                        Aucune opportunité
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOpportunity?.name}</DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">
                    {companies.find(c => c.id === selectedOpportunity.companyId)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedOpportunity.estimatedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probabilité</p>
                  <p className="font-medium">{selectedOpportunity.probability}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Étape</p>
                  <Badge
                    variant={
                      selectedOpportunity.stage === 'won' ? 'default' :
                      selectedOpportunity.stage === 'lost' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {stageLabels[selectedOpportunity.stage]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    navigate(`/crm/opportunites?opportunity_id=${selectedOpportunity.id}`);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
                {selectedOpportunity.status === 'won' && (
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      navigate(`/ventes/devis?opportunity_id=${selectedOpportunity.id}`);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer un devis
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
