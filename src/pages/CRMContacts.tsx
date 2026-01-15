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
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRM } from "@/hooks/use-crm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { CRMContact } from "@/types/database";

export default function CRMContacts() {
  const { contacts, companies, createContact, updateContact, deleteContact, getActivitiesByContact, loading } = useCRM();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    function: "",
    companyId: "",
    tags: [] as string[],
    notes: "",
  });

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = tagFilter === "all" || (contact.tags || []).includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const handleCreate = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      function: "",
      companyId: "",
      tags: [],
      notes: "",
    });
    setSelectedContact(null);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }

    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          function: formData.function || undefined,
          companyId: formData.companyId || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          notes: formData.notes || undefined,
        });
      } else {
        await createContact({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          function: formData.function || undefined,
          companyId: formData.companyId || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          notes: formData.notes || undefined,
        });
      }
      setIsCreateModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const handleEdit = (contact: CRMContact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone || "",
      email: contact.email || "",
      function: contact.function || "",
      companyId: contact.companyId || "",
      tags: contact.tags || [],
      notes: contact.notes || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleView = (contact: CRMContact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      deleteContact(id);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const contactActivities = selectedContact
    ? getActivitiesByContact(selectedContact.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avec société</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.companyId).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tags actifs</p>
                <p className="text-2xl font-bold text-blue-600">{allTags.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Badge className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreate();
              }}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun contact trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => {
                    const company = companies.find(c => c.id === contact.companyId);
                    return (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.function || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {company ? (
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => navigate(`/crm/societes?company_id=${company.id}`)}
                            >
                              {company.name}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(contact.tags || []).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {contact.phone && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`tel:${contact.phone}`)}
                                title="Appeler"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                            {contact.email && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`mailto:${contact.email}`)}
                                title="Envoyer un email"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/crm/activites?contact_id=${contact.id}`)}
                              title="Créer une activité"
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(contact)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(contact.id)}
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
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open);
        if (!open) {
          setSelectedContact(null);
          setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            function: "",
            companyId: "",
            tags: [],
            notes: "",
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du contact
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="function">Fonction</Label>
                <Input
                  id="function"
                  value={formData.function}
                  onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                  placeholder="Ex: Directeur Général"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyId">Société</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
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
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Ajouter un nouveau tag (tapez et appuyez sur Entrée)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !formData.tags.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, value],
                      }));
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
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
                  setSelectedContact(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedContact ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContact && `${selectedContact.firstName} ${selectedContact.lastName}`}
            </DialogTitle>
            <DialogDescription>Détails du contact</DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedContact.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedContact.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonction</p>
                  <p className="font-medium">{selectedContact.function || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">
                    {companies.find(c => c.id === selectedContact.companyId)?.name || '-'}
                  </p>
                </div>
              </div>
              {(selectedContact.tags || []).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{selectedContact.notes}</p>
                </div>
              )}
              {contactActivities.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Activités récentes</p>
                  <div className="space-y-2">
                    {contactActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="text-sm p-2 bg-muted rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{activity.subject}</span>
                          <span className="text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
