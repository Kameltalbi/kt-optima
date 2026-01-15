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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Upload,
  Lock,
  Shield,
  Info,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHR } from "@/hooks/use-hr";
import { useAuth } from "@/contexts/AuthContext";
import type { HRDocument } from "@/types/database";

export default function HRDocuments() {
  const { documents, employees, saveDocuments } = useHR();
  const { companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    type: "other" as HRDocument['type'],
    category: "administrative" as HRDocument['category'],
    accessLevel: "hr" as HRDocument['accessLevel'],
  });

  const filteredDocuments = documents.filter((doc) => {
    const employee = doc.employee_id ? employees.find(e => e.id === doc.employee_id) : null;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesAccess = accessFilter === "all" || doc.accessLevel === accessFilter;
    return matchesSearch && matchesType && matchesCategory && matchesAccess;
  });

  const handleUpload = () => {
    setFormData({
      employee_id: "",
      name: "",
      type: "other",
      category: "administrative",
      accessLevel: "hr",
    });
    setIsUploadModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Veuillez saisir un nom de document");
      return;
    }

    // Simuler l'upload d'un fichier
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const newDocument: HRDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        employee_id: formData.employee_id || undefined,
        name: formData.name,
        type: formData.type,
        category: formData.category,
        filePath: `/documents/hr/${file.name}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: 'current_user',
        uploadedDate: new Date().toISOString(),
        accessLevel: formData.accessLevel,
        company_id: companyId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveDocuments([...documents, newDocument]);
      setIsUploadModalOpen(false);
      setFormData({
        employee_id: "",
        name: "",
        type: "other",
        category: "administrative",
        accessLevel: "hr",
      });
    };
    fileInput.click();
  };

  const handleDelete = (docId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      saveDocuments(documents.filter(d => d.id !== docId));
    }
  };

  const typeLabels = {
    contract: "Contrat",
    cv: "CV",
    diploma: "Diplôme",
    certificate: "Certificat",
    evaluation: "Évaluation",
    disciplinary: "Disciplinaire",
    other: "Autre",
  };

  const categoryLabels = {
    personal: "Personnel",
    professional: "Professionnel",
    administrative: "Administratif",
    confidential: "Confidentiel",
  };

  const accessLabels = {
    public: "Public",
    hr: "RH uniquement",
    manager: "Manager",
    confidential: "Confidentiel",
  };

  const accessStyles = {
    public: "bg-success/10 text-success border-0",
    hr: "bg-primary/10 text-primary border-0",
    manager: "bg-secondary/10 text-secondary border-0",
    confidential: "bg-destructive/10 text-destructive border-0",
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Stockage sécurisé des documents RH avec accès restreint selon les rôles utilisateurs.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total documents</p>
                <p className="text-2xl font-bold mt-1">{documents.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Documents confidentiels</p>
                <p className="text-2xl font-bold mt-1 text-warning">
                  {documents.filter(d => d.accessLevel === 'confidential').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <Lock className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille totale</p>
                <p className="text-2xl font-bold mt-1">
                  {(documents.reduce((sum, d) => sum + d.fileSize, 0) / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <FileText className="w-5 h-5 text-secondary" />
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
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="contract">Contrat</SelectItem>
              <SelectItem value="cv">CV</SelectItem>
              <SelectItem value="diploma">Diplôme</SelectItem>
              <SelectItem value="certificate">Certificat</SelectItem>
              <SelectItem value="evaluation">Évaluation</SelectItem>
              <SelectItem value="disciplinary">Disciplinaire</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="personal">Personnel</SelectItem>
              <SelectItem value="professional">Professionnel</SelectItem>
              <SelectItem value="administrative">Administratif</SelectItem>
              <SelectItem value="confidential">Confidentiel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Accès" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="hr">RH</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="confidential">Confidentiel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Uploader un document
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Catégorie</TableHead>
                  <TableHead className="font-semibold">Taille</TableHead>
                  <TableHead className="font-semibold">Date upload</TableHead>
                  <TableHead className="font-semibold">Accès</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun document trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => {
                    const employee = doc.employee_id ? employees.find(e => e.id === doc.employee_id) : null;
                    return (
                      <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee ? (
                            <>
                              {employee.firstName} {employee.lastName}
                              <div className="text-xs text-muted-foreground">{employee.matricule}</div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Général</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[doc.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryLabels[doc.category]}</Badge>
                        </TableCell>
                        <TableCell>
                          {(doc.fileSize / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          {new Date(doc.uploadedDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", accessStyles[doc.accessLevel])}>
                            {doc.accessLevel === 'confidential' && <Lock className="w-3 h-3 mr-1" />}
                            {accessLabels[doc.accessLevel]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(doc.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uploader un document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employé (optionnel)</Label>
                <Select
                  value={formData.employee_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Document général" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Document général</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.matricule})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom du document *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Contrat de travail"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="cv">CV</SelectItem>
                    <SelectItem value="diploma">Diplôme</SelectItem>
                    <SelectItem value="certificate">Certificat</SelectItem>
                    <SelectItem value="evaluation">Évaluation</SelectItem>
                    <SelectItem value="disciplinary">Disciplinaire</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personnel</SelectItem>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="administrative">Administratif</SelectItem>
                    <SelectItem value="confidential">Confidentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="accessLevel">Niveau d'accès *</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, accessLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hr">RH uniquement</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="confidential">Confidentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Alert className="bg-warning/5 border-warning/20">
              <Shield className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm">
                Après avoir cliqué sur "Enregistrer", vous serez invité à sélectionner le fichier à uploader.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name}
              >
                <Upload className="w-4 h-4 mr-2" />
                Enregistrer et uploader
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
