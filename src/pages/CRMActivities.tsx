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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Users,
  Eye,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useCRM } from "@/hooks/use-crm";
import { useNavigate, useLocation } from "react-router-dom";
import type { CRMActivity } from "@/types/database";

const typeLabels: Record<CRMActivity['type'], string> = {
  call: 'Appel',
  meeting: 'Réunion',
  email: 'Email',
  task: 'Tâche',
};

const typeIcons: Record<CRMActivity['type'], typeof Phone> = {
  call: Phone,
  meeting: Calendar,
  email: Mail,
  task: CheckSquare,
};

export default function CRMActivities() {
  const {
    activities,
    contacts,
    companies,
    opportunities,
    createActivity,
    updateActivity,
    deleteActivity,
  } = useCRM();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const contactIdFromUrl = searchParams.get('contact_id');
  const companyIdFromUrl = searchParams.get('company_id');
  const opportunityIdFromUrl = searchParams.get('opportunity_id');

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<CRMActivity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!(contactIdFromUrl || companyIdFromUrl || opportunityIdFromUrl));
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: "call" as CRMActivity['type'],
    subject: "",
    contactId: contactIdFromUrl || "",
    companyId: companyIdFromUrl || "",
    opportunityId: opportunityIdFromUrl || "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    duration: 30,
    salesRepId: "",
    description: "",
    completed: false,
  });

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "completed" && activity.completed) ||
      (statusFilter === "pending" && !activity.completed);
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleCreate = () => {
    setFormData({
      type: "call",
      subject: "",
      contactId: contactIdFromUrl || "",
      companyId: companyIdFromUrl || "",
      opportunityId: opportunityIdFromUrl || "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      duration: 30,
      salesRepId: "",
      description: "",
      completed: false,
    });
    setSelectedActivity(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivity) {
      updateActivity(selectedActivity.id, {
        ...formData,
        contactId: formData.contactId || undefined,
        companyId: formData.companyId || undefined,
        opportunityId: formData.opportunityId || undefined,
        time: formData.time || undefined,
        duration: formData.duration || undefined,
        salesRepId: formData.salesRepId || undefined,
        description: formData.description || undefined,
      });
    } else {
      createActivity({
        ...formData,
        contactId: formData.contactId || undefined,
        companyId: formData.companyId || undefined,
        opportunityId: formData.opportunityId || undefined,
        time: formData.time || undefined,
        duration: formData.duration || undefined,
        salesRepId: formData.salesRepId || undefined,
        description: formData.description || undefined,
      });
    }
    setIsCreateModalOpen(false);
    setSelectedActivity(null);
    navigate(location.pathname, { replace: true });
  };

  const handleEdit = (activity: CRMActivity) => {
    setSelectedActivity(activity);
    setFormData({
      type: activity.type,
      subject: activity.subject,
      contactId: activity.contactId || "",
      companyId: activity.companyId || "",
      opportunityId: activity.opportunityId || "",
      date: activity.date,
      time: activity.time || "",
      duration: activity.duration || 30,
      salesRepId: activity.salesRepId || "",
      description: activity.description || "",
      completed: activity.completed,
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (activity: CRMActivity) => {
    setSelectedActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      deleteActivity(id);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateActivity(id, { completed });
  };

  const contactOptions = formData.companyId
    ? contacts.filter(c => c.companyId === formData.companyId)
    : contacts;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total activités</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appels</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.type === 'call').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Réunions</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.filter(a => a.type === 'meeting').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tâches complétées</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activities.filter(a => a.type === 'task' && a.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Activités</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle activité
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par sujet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="call">Appel</SelectItem>
                <SelectItem value="meeting">Réunion</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="task">Tâche</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Complétées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Lié à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune activité trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedActivities.map((activity) => {
                    const TypeIcon = typeIcons[activity.type];
                    const contact = activity.contactId ? contacts.find(c => c.id === activity.contactId) : null;
                    const company = activity.companyId ? companies.find(c => c.id === activity.companyId) : null;
                    const opportunity = activity.opportunityId ? opportunities.find(o => o.id === activity.opportunityId) : null;

                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{typeLabels[activity.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{activity.subject}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(activity.date).toLocaleDateString('fr-FR')}</div>
                            {activity.time && (
                              <div className="text-muted-foreground">{activity.time}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {contact && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => navigate(`/crm/contacts?contact_id=${contact.id}`)}
                                >
                                  {contact.firstName} {contact.lastName}
                                </Button>
                              </div>
                            )}
                            {company && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-muted-foreground" />
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => navigate(`/crm/societes?company_id=${company.id}`)}
                                >
                                  {company.name}
                                </Button>
                              </div>
                            )}
                            {opportunity && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => navigate(`/crm/opportunites?opportunity_id=${opportunity.id}`)}
                                >
                                  {opportunity.name}
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {activity.type === 'task' ? (
                            <Checkbox
                              checked={activity.completed}
                              onCheckedChange={(checked) =>
                                handleToggleComplete(activity.id, checked as boolean)
                              }
                            />
                          ) : (
                            <Badge variant={activity.completed ? 'default' : 'secondary'}>
                              {activity.completed ? 'Terminé' : 'Planifié'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(activity)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(activity.id)}
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
              {selectedActivity ? "Modifier l'activité" : "Nouvelle activité"}
            </DialogTitle>
            <DialogDescription>
              Enregistrer une action commerciale
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as CRMActivity['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Appel</SelectItem>
                    <SelectItem value="meeting">Réunion</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="task">Tâche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Société</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, companyId: value, contactId: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une société" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactId">Contact</Label>
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
                    {contactOptions.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunityId">Opportunité</Label>
              <Select
                value={formData.opportunityId}
                onValueChange={(value) => setFormData({ ...formData, opportunityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une opportunité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {opportunities.map((opp) => (
                    <SelectItem key={opp.id} value={opp.id}>
                      {opp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Commentaire</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Détails de l'activité..."
              />
            </div>

            {formData.type === 'task' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={formData.completed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, completed: checked as boolean })
                  }
                />
                <Label htmlFor="completed" className="cursor-pointer">
                  Tâche complétée
                </Label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedActivity(null);
                  navigate(location.pathname, { replace: true });
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedActivity ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.subject}</DialogTitle>
            <DialogDescription>Détails de l'activité</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = typeIcons[selectedActivity.type];
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <p className="font-medium">{typeLabels[selectedActivity.type]}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedActivity.date).toLocaleDateString('fr-FR')}
                    {selectedActivity.time && ` à ${selectedActivity.time}`}
                  </p>
                </div>
                {selectedActivity.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="font-medium">{selectedActivity.duration} minutes</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={selectedActivity.completed ? 'default' : 'secondary'}>
                    {selectedActivity.completed ? 'Terminé' : 'Planifié'}
                  </Badge>
                </div>
              </div>
              {selectedActivity.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedActivity.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
