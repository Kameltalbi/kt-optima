import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Star,
  FileText,
  CheckCircle,
  Clock,
  Info,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import { useAuth } from "@/contexts/AuthContext";
import type { Evaluation, EvaluationCampaign } from "@/types/database";

export default function Evaluations() {
  const { evaluations, campaigns, employees, saveEvaluations } = useHR();
  const { companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    campaignId: "",
    evaluatorId: "",
    period: "",
    date: new Date().toISOString().split('T')[0],
    objectives: [{ id: '1', description: '', target: '', achievement: '', rating: 3 }],
    competencies: [{ id: '1', name: '', rating: 3, comment: '' }],
    strengths: [''],
    areasForImprovement: [''],
    comments: '',
  });

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const employee = employees.find(e => e.id === evaluation.employee_id);
    const matchesSearch =
      employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter;
    const matchesCampaign = campaignFilter === "all" || evaluation.campaignId === campaignFilter;
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const handleCreate = () => {
    setFormData({
      employee_id: "",
      campaignId: "",
      evaluatorId: "",
      period: "",
      date: new Date().toISOString().split('T')[0],
      objectives: [{ id: '1', description: '', target: '', achievement: '', rating: 3 }],
      competencies: [{ id: '1', name: '', rating: 3, comment: '' }],
      strengths: [''],
      areasForImprovement: [''],
      comments: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.employee_id || !formData.campaignId || !formData.evaluatorId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const campaign = campaigns.find(c => c.id === formData.campaignId);
    const evaluator = employees.find(e => e.id === formData.evaluatorId);
    const overallRating = formData.competencies.length > 0
      ? formData.competencies.reduce((sum, c) => sum + c.rating, 0) / formData.competencies.length
      : 3;

    const newEvaluation: Evaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      employee_id: formData.employee_id,
      campaignId: formData.campaignId,
      campaignName: campaign?.name || '',
      period: formData.period,
      evaluatorId: formData.evaluatorId,
      evaluatorName: evaluator ? `${evaluator.firstName} ${evaluator.lastName}` : '',
      date: formData.date,
      objectives: formData.objectives.filter(o => o.description),
      competencies: formData.competencies.filter(c => c.name),
      overallRating,
      strengths: formData.strengths.filter(s => s),
      areasForImprovement: formData.areasForImprovement.filter(a => a),
      comments: formData.comments,
      status: 'draft',
      company_id: companyId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEvaluations([...evaluations, newEvaluation]);
    setIsCreateModalOpen(false);
  };

  const statusStyles = {
    draft: "bg-muted/10 text-muted-foreground border-0",
    submitted: "bg-warning/10 text-warning border-0",
    reviewed: "bg-info/10 text-info border-0",
    validated: "bg-success/10 text-success border-0",
  };

  const statusLabels = {
    draft: "Brouillon",
    submitted: "Soumis",
    reviewed: "Révisé",
    validated: "Validé",
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-warning text-warning" : "text-muted-foreground"
        )}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Gestion des évaluations annuelles avec objectifs, compétences et historique par employé.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total évaluations</p>
                <p className="text-2xl font-bold mt-1">{evaluations.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes</p>
                <p className="text-2xl font-bold mt-1">{campaigns.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <Target className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold mt-1 text-warning">
                  {evaluations.filter(e => e.status === 'draft' || e.status === 'submitted').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Validées</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {evaluations.filter(e => e.status === 'validated').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une évaluation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="submitted">Soumis</SelectItem>
              <SelectItem value="reviewed">Révisé</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Campagne" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCampaignModalOpen(true)}
          >
            <Target className="w-4 h-4 mr-2" />
            Nouvelle campagne
          </Button>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle évaluation
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Campagne</TableHead>
                  <TableHead className="font-semibold">Période</TableHead>
                  <TableHead className="font-semibold">Évaluateur</TableHead>
                  <TableHead className="font-semibold">Note globale</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune évaluation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvaluations.map((evaluation) => {
                    const employee = employees.find(e => e.id === evaluation.employee_id);
                    return (
                      <TableRow key={evaluation.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
                          <div className="text-xs text-muted-foreground">{employee?.matricule}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{evaluation.campaignName}</Badge>
                        </TableCell>
                        <TableCell>{evaluation.period}</TableCell>
                        <TableCell>{evaluation.evaluatorName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRatingStars(Math.round(evaluation.overallRating))}
                            <span className="font-semibold">{evaluation.overallRating.toFixed(1)}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(evaluation.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", statusStyles[evaluation.status])}>
                            {statusLabels[evaluation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(evaluation)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle évaluation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employé *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignId">Campagne *</Label>
                <Select
                  value={formData.campaignId}
                  onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.period})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evaluatorId">Évaluateur *</Label>
                <Select
                  value={formData.evaluatorId}
                  onValueChange={(value) => setFormData({ ...formData, evaluatorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un évaluateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === 'active').map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Période *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="2023 ou 2023-Q1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <Tabs defaultValue="objectives">
              <TabsList>
                <TabsTrigger value="objectives">Objectifs</TabsTrigger>
                <TabsTrigger value="competencies">Compétences</TabsTrigger>
                <TabsTrigger value="summary">Résumé</TabsTrigger>
              </TabsList>
              <TabsContent value="objectives" className="space-y-4">
                {formData.objectives.map((obj, idx) => (
                  <Card key={obj.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <Label>Description de l'objectif</Label>
                        <Textarea
                          value={obj.description}
                          onChange={(e) => {
                            const newObjectives = [...formData.objectives];
                            newObjectives[idx].description = e.target.value;
                            setFormData({ ...formData, objectives: newObjectives });
                          }}
                          placeholder="Décrire l'objectif..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Cible</Label>
                          <Input
                            value={obj.target}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives];
                              newObjectives[idx].target = e.target.value;
                              setFormData({ ...formData, objectives: newObjectives });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Réalisation</Label>
                          <Input
                            value={obj.achievement}
                            onChange={(e) => {
                              const newObjectives = [...formData.objectives];
                              newObjectives[idx].achievement = e.target.value;
                              setFormData({ ...formData, objectives: newObjectives });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Note (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={obj.rating}
                          onChange={(e) => {
                            const newObjectives = [...formData.objectives];
                            newObjectives[idx].rating = parseInt(e.target.value) || 3;
                            setFormData({ ...formData, objectives: newObjectives });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      objectives: [...formData.objectives, {
                        id: Date.now().toString(),
                        description: '',
                        target: '',
                        achievement: '',
                        rating: 3,
                      }],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un objectif
                </Button>
              </TabsContent>
              <TabsContent value="competencies" className="space-y-4">
                {formData.competencies.map((comp, idx) => (
                  <Card key={comp.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <Label>Compétence</Label>
                        <Input
                          value={comp.name}
                          onChange={(e) => {
                            const newCompetencies = [...formData.competencies];
                            newCompetencies[idx].name = e.target.value;
                            setFormData({ ...formData, competencies: newCompetencies });
                          }}
                          placeholder="Nom de la compétence..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Note (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={comp.rating}
                          onChange={(e) => {
                            const newCompetencies = [...formData.competencies];
                            newCompetencies[idx].rating = parseInt(e.target.value) || 3;
                            setFormData({ ...formData, competencies: newCompetencies });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Commentaire</Label>
                        <Textarea
                          value={comp.comment || ''}
                          onChange={(e) => {
                            const newCompetencies = [...formData.competencies];
                            newCompetencies[idx].comment = e.target.value;
                            setFormData({ ...formData, competencies: newCompetencies });
                          }}
                          placeholder="Commentaire sur la compétence..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      competencies: [...formData.competencies, {
                        id: Date.now().toString(),
                        name: '',
                        rating: 3,
                        comment: '',
                      }],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une compétence
                </Button>
              </TabsContent>
              <TabsContent value="summary" className="space-y-4">
                <div className="space-y-2">
                  <Label>Points forts</Label>
                  {formData.strengths.map((strength, idx) => (
                    <Input
                      key={idx}
                      value={strength}
                      onChange={(e) => {
                        const newStrengths = [...formData.strengths];
                        newStrengths[idx] = e.target.value;
                        setFormData({ ...formData, strengths: newStrengths });
                      }}
                      placeholder="Point fort..."
                      className="mb-2"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, strengths: [...formData.strengths, ''] });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Axes d'amélioration</Label>
                  {formData.areasForImprovement.map((area, idx) => (
                    <Input
                      key={idx}
                      value={area}
                      onChange={(e) => {
                        const newAreas = [...formData.areasForImprovement];
                        newAreas[idx] = e.target.value;
                        setFormData({ ...formData, areasForImprovement: newAreas });
                      }}
                      placeholder="Axe d'amélioration..."
                      className="mb-2"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, areasForImprovement: [...formData.areasForImprovement, ''] });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Commentaires généraux</Label>
                  <Textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Commentaires généraux sur l'évaluation..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.employee_id || !formData.campaignId || !formData.evaluatorId}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Évaluation - {selectedEvaluation?.campaignName}
            </DialogTitle>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employé</p>
                      <p className="font-medium">
                        {employees.find(e => e.id === selectedEvaluation.employee_id)?.firstName}{' '}
                        {employees.find(e => e.id === selectedEvaluation.employee_id)?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Évaluateur</p>
                      <p className="font-medium">{selectedEvaluation.evaluatorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Période</p>
                      <p className="font-medium">{selectedEvaluation.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Note globale</p>
                      <div className="flex items-center gap-2">
                        {getRatingStars(Math.round(selectedEvaluation.overallRating))}
                        <span className="font-bold text-lg">{selectedEvaluation.overallRating.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedEvaluation.objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Objectifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedEvaluation.objectives.map((obj, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-0">
                          <p className="font-medium mb-2">{obj.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Cible: </span>
                              <span>{obj.target}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Réalisation: </span>
                              <span>{obj.achievement}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Note: </span>
                              <div className="inline-flex items-center gap-1">
                                {getRatingStars(obj.rating)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedEvaluation.competencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedEvaluation.competencies.map((comp, idx) => (
                        <div key={idx} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{comp.name}</p>
                            <div className="flex items-center gap-1">
                              {getRatingStars(comp.rating)}
                            </div>
                          </div>
                          {comp.comment && (
                            <p className="text-sm text-muted-foreground">{comp.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedEvaluation.strengths.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Points forts</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvaluation.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedEvaluation.areasForImprovement.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Axes d'amélioration</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvaluation.areasForImprovement.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedEvaluation.comments && (
                    <div>
                      <p className="font-semibold mb-2">Commentaires</p>
                      <p className="text-sm">{selectedEvaluation.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaign Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne d'évaluation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Nom de la campagne *</Label>
                <Input
                  id="campaignName"
                  placeholder="Ex: Évaluation annuelle 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignPeriod">Période *</Label>
                <Input
                  id="campaignPeriod"
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignStartDate">Date début *</Label>
                <Input
                  id="campaignStartDate"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignEndDate">Date fin *</Label>
                <Input
                  id="campaignEndDate"
                  type="date"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCampaignModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                // TODO: Implement campaign creation
                setIsCampaignModalOpen(false);
              }}>
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
