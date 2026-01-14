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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  Building2,
  Users,
  TrendingUp,
  FileText,
  Globe,
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import type { CRMCompany } from "@/types/database";

export default function CRMCompanies() {
  const { company } = useAuth();
  const {
    companies,
    contacts,
    opportunities,
    createCompany,
    updateCompany,
    deleteCompany,
    getContactsByCompany,
    getOpportunitiesByCompany,
    getActivitiesByCompany,
  } = useCRM();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const companyIdFromUrl = searchParams.get('company_id');

  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(
    companyIdFromUrl ? companies.find(c => c.id === companyIdFromUrl) || null : null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(!!companyIdFromUrl);

  const [formData, setFormData] = useState({
    name: "",
    taxNumber: "",
    address: "",
    phone: "",
    email: "",
    sector: "",
    salesRepId: "",
    website: "",
    notes: "",
  });

  const allSectors = Array.from(new Set(companies.map(c => c.sector).filter(Boolean)));

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.taxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === "all" || company.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const totalOpportunitiesValue = opportunities
    .filter(o => o.status === 'active')
    .reduce((sum, o) => sum + o.estimatedAmount, 0);

  const handleCreate = () => {
    setFormData({
      name: "",
      taxNumber: "",
      address: "",
      phone: "",
      email: "",
      sector: "",
      salesRepId: "",
      website: "",
      notes: "",
    });
    setSelectedCompany(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompany) {
      updateCompany(selectedCompany.id, {
        ...formData,
        taxNumber: formData.taxNumber || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        sector: formData.sector || undefined,
        salesRepId: formData.salesRepId || undefined,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
      });
    } else {
      createCompany({
        ...formData,
        taxNumber: formData.taxNumber || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        sector: formData.sector || undefined,
        salesRepId: formData.salesRepId || undefined,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
      });
    }
    setIsCreateModalOpen(false);
    setSelectedCompany(null);
    navigate(location.pathname, { replace: true });
  };

  const handleEdit = (company: CRMCompany) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      taxNumber: company.taxNumber || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      sector: company.sector || "",
      salesRepId: company.salesRepId || "",
      website: company.website || "",
      notes: company.notes || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (company: CRMCompany) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette société ?")) {
      deleteCompany(id);
    }
  };

  const companyContacts = selectedCompany
    ? getContactsByCompany(selectedCompany.id)
    : [];
  const companyOpportunities = selectedCompany
    ? getOpportunitiesByCompany(selectedCompany.id)
    : [];
  const companyActivities = selectedCompany
    ? getActivitiesByCompany(selectedCompany.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total sociétés</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
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
                  {opportunities.filter(o => o.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA prévisionnel</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalOpportunitiesValue)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Sociétés</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle société
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, matricule fiscal, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {allSectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raison sociale</TableHead>
                  <TableHead>Matricule fiscal</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Opportunités</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune société trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => {
                    const opps = opportunities.filter(o => o.companyId === company.id && o.status === 'active');
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          {company.taxNumber || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {company.sector ? (
                            <Badge variant="outline">{company.sector}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {company.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{company.phone}</span>
                              </div>
                            )}
                            {company.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{company.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {opps.length} active{opps.length > 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(company)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(company)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(company.id)}
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
              {selectedCompany ? "Modifier la société" : "Nouvelle société"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de la société
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Raison sociale *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Matricule fiscal</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ex: Technologie, Commerce..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+216 12 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.tn"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.example.tn"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesRepId">Responsable commercial</Label>
                <Select
                  value={formData.salesRepId}
                  onValueChange={(value) => setFormData({ ...formData, salesRepId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {/* En production, charger depuis users */}
                    <SelectItem value="user_1">Commercial 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Notes supplémentaires..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedCompany(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedCompany ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCompany?.name}</DialogTitle>
            <DialogDescription>Détails de la société</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="contacts">
                  Contacts ({companyContacts.length})
                </TabsTrigger>
                <TabsTrigger value="opportunities">
                  Opportunités ({companyOpportunities.length})
                </TabsTrigger>
                <TabsTrigger value="activities">
                  Activités ({companyActivities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Matricule fiscal</p>
                    <p className="font-medium">{selectedCompany.taxNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Secteur</p>
                    <p className="font-medium">{selectedCompany.sector || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{selectedCompany.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedCompany.email || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{selectedCompany.address || '-'}</p>
                  </div>
                  {selectedCompany.website && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Site web</p>
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        {selectedCompany.website}
                      </a>
                    </div>
                  )}
                  {selectedCompany.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">Notes</p>
                      <p className="text-sm">{selectedCompany.notes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contacts">
                {companyContacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun contact lié
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companyContacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </p>
                              {contact.function && (
                                <p className="text-sm text-muted-foreground">{contact.function}</p>
                              )}
                              {contact.email && (
                                <p className="text-sm text-muted-foreground">{contact.email}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/crm/contacts?contact_id=${contact.id}`)}
                            >
                              Voir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="opportunities">
                {companyOpportunities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune opportunité
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companyOpportunities.map((opp) => (
                      <Card key={opp.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{opp.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(opp.estimatedAmount)} - {opp.probability}% de probabilité
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={opp.status === 'won' ? 'default' : opp.status === 'lost' ? 'destructive' : 'secondary'}>
                                {opp.stage}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/crm/opportunites?opportunity_id=${opp.id}`)}
                              >
                                Voir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activities">
                {companyActivities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune activité
                  </p>
                ) : (
                  <div className="space-y-2">
                    {companyActivities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{activity.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString('fr-FR')} {activity.time}
                              </p>
                            </div>
                            <Badge variant="outline">{activity.type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
