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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { useProspects } from "@/hooks/use-prospects";
import { useCompanyUsers } from "@/hooks/use-company-users";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CRMProspect } from "@/types/database";
import { MainLayout } from "@/components/layout/MainLayout";

const statusConfig = {
  new: { label: "Nouveau", color: "bg-blue-500/10 text-blue-600" },
  contacted: { label: "Contacté", color: "bg-purple-500/10 text-purple-600" },
  qualified: { label: "Qualifié", color: "bg-cyan-500/10 text-cyan-600" },
  lost: { label: "Perdu", color: "bg-destructive/10 text-destructive" },
};

const sourceOptions = [
  "Site web",
  "LinkedIn",
  "Recommandation",
  "Salon",
  "Appel entrant",
  "Email",
  "Réseaux sociaux",
  "Autre",
];

export default function CRMProspects() {
  const { company } = useAuth();
  const {
    prospects,
    loading,
    createProspect,
    updateProspect,
    deleteProspect,
    convertToCompany,
    getProspectsByStatus,
  } = useProspects();
  const { users: companyUsers, getSalesReps } = useCompanyUsers();
  const salesReps = getSalesReps();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedProspect, setSelectedProspect] = useState<CRMProspect | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    phone: "",
    email: "",
    city: "",
    sector: "",
    source: "",
    status: "new" as CRMProspect["status"],
    salesRepId: "",
    notes: "",
  });

  const allSources = Array.from(new Set(prospects.map(p => p.source).filter(Boolean)));

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || prospect.status === statusFilter;
    const matchesSource = sourceFilter === "all" || prospect.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCreate = () => {
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      phone: "",
      email: "",
      city: "",
      sector: "",
      source: "",
      status: "new",
      salesRepId: "",
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (prospect: CRMProspect) => {
    setSelectedProspect(prospect);
    setFormData({
      firstName: prospect.first_name || prospect.firstName || "",
      lastName: prospect.last_name || prospect.lastName || "",
      companyName: prospect.company_name || prospect.companyName || "",
      phone: prospect.phone || "",
      email: prospect.email || "",
      city: prospect.city || "",
      sector: prospect.sector || "",
      source: prospect.source || "",
      status: prospect.status,
      salesRepId: prospect.sales_rep_id || prospect.salesRepId || "",
      notes: prospect.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedProspect) {
        await updateProspect(selectedProspect.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName || null,
          phone: formData.phone || null,
          email: formData.email || null,
          city: formData.city || null,
          sector: formData.sector || null,
          source: formData.source || null,
          status: formData.status,
          sales_rep_id: formData.salesRepId || null,
          notes: formData.notes || null,
        });
        setIsEditModalOpen(false);
        setSelectedProspect(null);
      } else {
        await createProspect({
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName || null,
          phone: formData.phone || null,
          email: formData.email || null,
          city: formData.city || null,
          sector: formData.sector || null,
          source: formData.source || null,
          status: formData.status,
          sales_rep_id: formData.salesRepId || null,
          notes: formData.notes || null,
          company_id: company?.id || "",
        });
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving prospect:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) {
      return;
    }
    try {
      await deleteProspect(id);
    } catch (error) {
      console.error("Error deleting prospect:", error);
    }
  };

  const handleConvert = (prospect: CRMProspect) => {
    setSelectedProspect(prospect);
    setIsConvertModalOpen(true);
  };

  const handleConvertToCompany = async () => {
    if (!selectedProspect) return;

    try {
      await convertToCompany(selectedProspect.id, {
        name: selectedProspect.company_name || `${selectedProspect.first_name} ${selectedProspect.last_name}`,
        tax_number: null,
        address: null,
        phone: selectedProspect.phone || null,
        email: selectedProspect.email || null,
        sector: selectedProspect.sector || null,
        website: null,
        sales_rep_id: selectedProspect.sales_rep_id || null,
        notes: selectedProspect.notes || null,
      });
      setIsConvertModalOpen(false);
      setSelectedProspect(null);
      toast.success("Prospect converti en société. Vous pouvez maintenant le gérer dans la section Sociétés.");
    } catch (error) {
      console.error("Error converting prospect:", error);
    }
  };

  const stats = {
    total: prospects.length,
    new: getProspectsByStatus("new").length,
    contacted: getProspectsByStatus("contacted").length,
    qualified: getProspectsByStatus("qualified").length,
    lost: getProspectsByStatus("lost").length,
  };

  return (
    <MainLayout title="Prospects" subtitle="Gestion des leads et prospects">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Nouveaux</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.new}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Contactés</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.contacted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Qualifiés</p>
                <p className="text-2xl font-semibold text-cyan-600">{stats.qualified}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Perdus</p>
                <p className="text-2xl font-semibold text-destructive">{stats.lost}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des prospects</CardTitle>
              <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau prospect
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  {allSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredProspects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun prospect trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Société</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell className="font-medium">
                        {prospect.first_name} {prospect.last_name}
                      </TableCell>
                      <TableCell>{prospect.company_name || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prospect.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {prospect.phone}
                            </div>
                          )}
                          {prospect.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {prospect.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {prospect.city ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {prospect.city}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{prospect.sector || "-"}</TableCell>
                      <TableCell>{prospect.source || "-"}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[prospect.status].color + " border-0"}>
                          {statusConfig[prospect.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prospect)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {prospect.status !== "lost" && !prospect.converted_to_company_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConvert(prospect)}
                              title="Convertir en société"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prospect.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedProspect(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProspect ? "Modifier le prospect" : "Nouveau prospect"}
              </DialogTitle>
              <DialogDescription>
                {selectedProspect
                  ? "Modifiez les informations du prospect"
                  : "Ajoutez un nouveau prospect à votre pipeline"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyName">Société</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Secteur</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: CRMProspect["status"]) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="contacted">Contacté</SelectItem>
                      <SelectItem value="qualified">Qualifié</SelectItem>
                      <SelectItem value="lost">Perdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="salesRepId">Responsable commercial</Label>
                <Select value={formData.salesRepId} onValueChange={(value) => setFormData({ ...formData, salesRepId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {salesReps.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedProspect(null);
                }}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {selectedProspect ? "Enregistrer" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert Modal */}
        <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convertir le prospect en société</DialogTitle>
              <DialogDescription>
                Cette action va créer une société CRM à partir du prospect "{selectedProspect?.first_name} {selectedProspect?.last_name}".
                Le prospect sera marqué comme qualifié.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleConvertToCompany}>
                <UserPlus className="w-4 h-4 mr-2" />
                Convertir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
