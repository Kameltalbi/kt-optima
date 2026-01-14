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
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { CRMOpportunity } from "@/types/database";

const stageLabels: Record<CRMOpportunity['stage'], string> = {
  new: 'Nouveau',
  qualification: 'Qualification',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  won: 'Gagné',
  lost: 'Perdu',
};

export default function CRMOpportunities() {
  const { company } = useAuth();
  const {
    opportunities,
    companies,
    contacts,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    markOpportunityWon,
    markOpportunityLost,
  } = useCRM();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<CRMOpportunity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    companyId: "",
    contactId: "",
    estimatedAmount: 0,
    probability: 50,
    expectedCloseDate: "",
    salesRepId: "",
    stage: "new" as CRMOpportunity['stage'],
    description: "",
  });

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || opp.stage === stageFilter;
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const totalValue = opportunities
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + o.estimatedAmount, 0);
  const weightedValue = opportunities
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + (o.estimatedAmount * o.probability / 100), 0);
  const wonCount = opportunities.filter(o => o.status === 'won').length;

  const handleCreate = () => {
    setFormData({
      name: "",
      companyId: "",
      contactId: "",
      estimatedAmount: 0,
      probability: 50,
      expectedCloseDate: "",
      salesRepId: "",
      stage: "new",
      description: "",
    });
    setSelectedOpportunity(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyId) {
      alert("Vous devez sélectionner une société");
      return;
    }

    if (selectedOpportunity) {
      updateOpportunity(selectedOpportunity.id, {
        ...formData,
        contactId: formData.contactId || undefined,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        salesRepId: formData.salesRepId || undefined,
        description: formData.description || undefined,
        status: 'active',
      });
    } else {
      createOpportunity({
        ...formData,
        contactId: formData.contactId || undefined,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        salesRepId: formData.salesRepId || undefined,
        description: formData.description || undefined,
        status: 'active',
      });
    }
    setIsCreateModalOpen(false);
    setSelectedOpportunity(null);
  };

  const handleEdit = (opp: CRMOpportunity) => {
    setSelectedOpportunity(opp);
    setFormData({
      name: opp.name,
      companyId: opp.companyId,
      contactId: opp.contactId || "",
      estimatedAmount: opp.estimatedAmount,
      probability: opp.probability,
      expectedCloseDate: opp.expectedCloseDate || "",
      salesRepId: opp.salesRepId || "",
      stage: opp.stage,
      description: opp.description || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (opp: CRMOpportunity) => {
    setSelectedOpportunity(opp);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette opportunité ?")) {
      deleteOpportunity(id);
    }
  };

  const handleMarkWon = (id: string) => {
    if (confirm("Marquer cette opportunité comme gagnée ? Vous pourrez ensuite générer un devis.")) {
      markOpportunityWon(id);
    }
  };

  const handleMarkLost = (id: string) => {
    if (confirm("Marquer cette opportunité comme perdue ?")) {
      markOpportunityLost(id);
    }
  };

  const handleGenerateQuote = (opp: CRMOpportunity) => {
    // En production, créer un devis dans le module Ventes
    navigate(`/ventes/devis?opportunity_id=${opp.id}&company_id=${opp.companyId}&amount=${opp.estimatedAmount}`);
  };

  const companyContacts = formData.companyId
    ? contacts.filter(c => c.companyId === formData.companyId)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total opportunités</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
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
                <p className="text-sm text-muted-foreground">CA total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA pondéré</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(weightedValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gagnées</p>
                <p className="text-2xl font-bold text-green-600">{wonCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Opportunités</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle opportunité
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Étape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les étapes</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="qualification">Qualification</SelectItem>
                <SelectItem value="proposal">Proposition</SelectItem>
                <SelectItem value="negotiation">Négociation</SelectItem>
                <SelectItem value="won">Gagné</SelectItem>
                <SelectItem value="lost">Perdu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="won">Gagnée</SelectItem>
                <SelectItem value="lost">Perdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Montant estimé</TableHead>
                  <TableHead>Probabilité</TableHead>
                  <TableHead>Étape</TableHead>
                  <TableHead>Date prévue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucune opportunité trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOpportunities.map((opp) => {
                    const company = companies.find(c => c.id === opp.companyId);
                    return (
                      <TableRow key={opp.id}>
                        <TableCell className="font-medium">{opp.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => navigate(`/crm/societes?company_id=${opp.companyId}`)}
                          >
                            {company?.name || 'N/A'}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(opp.estimatedAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{opp.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              opp.stage === 'won' ? 'default' :
                              opp.stage === 'lost' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {stageLabels[opp.stage]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {opp.expectedCloseDate ? (
                            <span className="text-sm">
                              {new Date(opp.expectedCloseDate).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(opp)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {opp.status === 'active' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(opp)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkWon(opp.id)}
                                  title="Marquer comme gagnée"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkLost(opp.id)}
                                  title="Marquer comme perdue"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {opp.status === 'won' && !opp.quoteId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerateQuote(opp)}
                                title="Générer un devis"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(opp.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOpportunity ? "Modifier l'opportunité" : "Nouvelle opportunité"}
            </DialogTitle>
            <DialogDescription>
              Créer une nouvelle opportunité commerciale
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'opportunité *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Société *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => {
                  setFormData({ ...formData, companyId: value, contactId: "" });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une société" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactId">Contact principal</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                disabled={!formData.companyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {companyContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedAmount">Montant estimé (TND) *</Label>
                <Input
                  id="estimatedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedAmount}
                  onChange={(e) => setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probabilité: {formData.probability}%</Label>
                <Slider
                  value={[formData.probability]}
                  onValueChange={(value) => setFormData({ ...formData, probability: value[0] })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Date de conclusion prévue</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Étape *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value as CRMOpportunity['stage'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposition</SelectItem>
                    <SelectItem value="negotiation">Négociation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Détails de l'opportunité..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedOpportunity(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedOpportunity ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedOpportunity?.name}</DialogTitle>
            <DialogDescription>Détails de l'opportunité</DialogDescription>
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
                  <p className="text-sm text-muted-foreground">Montant estimé</p>
                  <p className="font-medium text-lg">{formatCurrency(selectedOpportunity.estimatedAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probabilité</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${selectedOpportunity.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{selectedOpportunity.probability}%</span>
                  </div>
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
                {selectedOpportunity.expectedCloseDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date prévue</p>
                    <p className="font-medium">
                      {new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              {selectedOpportunity.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedOpportunity.description}</p>
                </div>
              )}
              {selectedOpportunity.status === 'won' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => handleGenerateQuote(selectedOpportunity)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Générer un devis
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
