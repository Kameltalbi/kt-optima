import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  Edit,
  Trash2,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  Loader2,
  Upload,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/use-clients";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient, searchClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nom: "",
    type: "prospect" as string,
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    code_postal: "",
    pays: "Tunisie",
    numero_fiscal: "",
    numero_registre_commerce: "",
    site_web: "",
    notes: "",
  });

  const filteredClients = searchTerm 
    ? searchClients(searchTerm)
    : clients.filter(c => c.actif);

  const totalClients = clients.length;
  const totalBalance = clients.reduce((sum, c) => sum + (c.solde_actuel || 0), 0);
  const activeClients = clients.filter(c => c.actif && c.solde_actuel > 0).length;

  const handleOpenDialog = (clientId?: string) => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setEditingClient(clientId);
        setFormData({
          code: client.code || "",
          nom: client.nom,
          type: client.type,
          email: client.email || "",
          telephone: client.telephone || "",
          adresse: client.adresse || "",
          ville: client.ville || "",
          code_postal: client.code_postal || "",
          pays: client.pays || "Tunisie",
          numero_fiscal: client.numero_fiscal || "",
          numero_registre_commerce: client.numero_registre_commerce || "",
          site_web: client.site_web || "",
          notes: client.notes || "",
        });
      }
    } else {
      setEditingClient(null);
      setFormData({
        code: "",
        nom: "",
        type: "prospect",
        email: "",
        telephone: "",
        adresse: "",
        ville: "",
        code_postal: "",
        pays: "Tunisie",
        numero_fiscal: "",
        numero_registre_commerce: "",
        site_web: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setFormData({
      code: "",
      nom: "",
      type: "prospect",
      email: "",
      telephone: "",
      adresse: "",
      ville: "",
      code_postal: "",
      pays: "Tunisie",
      numero_fiscal: "",
      numero_registre_commerce: "",
      site_web: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClient) {
        await updateClient(editingClient, formData);
      } else {
        await createClient({
          ...formData,
          solde_initial: 0,
          solde_actuel: 0,
          actif: true,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }
    try {
      await deleteClient(clientId);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  // Export CSV
  const handleExport = () => {
    try {
      const headers = [
        'Code',
        'Nom',
        'Type',
        'Email',
        'Téléphone',
        'Adresse',
        'Ville',
        'Code postal',
        'Pays',
        'Numéro fiscal',
        'N° Registre Commerce',
        'Site web',
        'Notes'
      ];

      const csvContent = [
        headers.join(','),
        ...clients.map(client => [
          client.code || '',
          `"${client.nom.replace(/"/g, '""')}"`,
          client.type || '',
          client.email || '',
          client.telephone || '',
          `"${(client.adresse || '').replace(/"/g, '""')}"`,
          client.ville || '',
          client.code_postal || '',
          client.pays || '',
          client.numero_fiscal || '',
          client.numero_registre_commerce || '',
          client.site_web || '',
          `"${(client.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${clients.length} client(s) exporté(s) avec succès`);
    } catch (error) {
      console.error('Error exporting clients:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  // Import CSV
  const handleImport = async () => {
    if (!importFile) {
      return;
    }

    setImportLoading(true);
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
        return;
      }

      // Parser CSV (gestion basique des guillemets)
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const expectedHeaders = [
        'Code', 'Nom', 'Type', 'Email', 'Téléphone', 'Adresse',
        'Ville', 'Code postal', 'Pays', 'Numéro fiscal',
        'N° Registre Commerce', 'Site web', 'Notes'
      ];

      // Vérifier les en-têtes
      if (headers.length !== expectedHeaders.length) {
        toast.error(`Le fichier doit contenir ${expectedHeaders.length} colonnes. Trouvé: ${headers.length}`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Importer chaque ligne
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const clientData = {
          code: values[0] || '',
          nom: values[1] || '',
          type: values[2] || 'prospect',
          email: values[3] || '',
          telephone: values[4] || '',
          adresse: values[5] || '',
          ville: values[6] || '',
          code_postal: values[7] || '',
          pays: values[8] || 'Tunisie',
          numero_fiscal: values[9] || '',
          numero_registre_commerce: values[10] || '',
          site_web: values[11] || '',
          notes: values[12] || '',
          solde_initial: 0,
          solde_actuel: 0,
          actif: true,
        };

        if (!clientData.nom.trim()) {
          errorCount++;
          continue;
        }

        try {
          await createClient(clientData);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors de l'import du client ${clientData.nom}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} client(s) importé(s) avec succès${errorCount > 0 ? `. ${errorCount} erreur(s).` : ''}`);
      } else {
        toast.error(`Aucun client importé. ${errorCount} erreur(s).`);
      }
      setIsImportDialogOpen(false);
      setImportFile(null);
    } catch (error) {
      console.error('Error importing clients:', error);
      toast.error('Erreur lors de l\'import du fichier');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total clients</p>
                  <p className="text-2xl font-bold mt-1">{totalClients}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solde total</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {totalBalance.toLocaleString()} DT
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
                  <p className="text-2xl font-bold mt-1">{activeClients}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, téléphone, code TVA ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Importer
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) handleCloseDialog();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau client
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Modifier le client" : "Nouveau client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code client</Label>
                    <Input 
                      id="code" 
                      placeholder="CLI-001" 
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: "prospect" | "client") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du client *</Label>
                  <Input 
                    id="nom" 
                    placeholder="Société Alpha" 
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input 
                      id="telephone" 
                      placeholder="+216 12 345 678" 
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="contact@example.tn" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input 
                    id="adresse" 
                    placeholder="123 Rue Principale" 
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input 
                      id="ville" 
                      placeholder="Tunis" 
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input 
                      id="code_postal" 
                      placeholder="1000" 
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pays">Pays</Label>
                    <Input 
                      id="pays" 
                      placeholder="Tunisie" 
                      value={formData.pays}
                      onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_fiscal">Numéro fiscal</Label>
                    <Input 
                      id="numero_fiscal" 
                      placeholder="12345678" 
                      value={formData.numero_fiscal}
                      onChange={(e) => setFormData({ ...formData, numero_fiscal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_registre_commerce">N° Registre Commerce</Label>
                    <Input 
                      id="numero_registre_commerce" 
                      placeholder="RC123456" 
                      value={formData.numero_registre_commerce}
                      onChange={(e) => setFormData({ ...formData, numero_registre_commerce: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_web">Site web</Label>
                  <Input 
                    id="site_web" 
                    placeholder="https://www.example.tn" 
                    value={formData.site_web}
                    onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Notes internes sur le client..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1"
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || !formData.nom.trim()}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingClient ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Modal Import */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Importer des clients
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Upload */}
              <div className="space-y-2">
                <Label htmlFor="import-file" className="text-sm font-medium">
                  Sélectionner le fichier CSV
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {importFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    {importFile.name}
                  </p>
                )}
              </div>

              {/* Colonnes supportées - Version compacte */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Colonnes supportées</Label>
                <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">Obligatoire</Badge>
                    <span className="font-medium">Nom</span>
                  </div>
                  <div className="text-muted-foreground pl-6 text-[11px]">
                    Code, Type (prospect/client), Email, Téléphone, Adresse, Ville, Code postal, Pays, Numéro fiscal, N° Registre Commerce, Site web, Notes
                  </div>
                </div>
              </div>

              {/* Exemple compact */}
              <div className="bg-muted/30 p-3 rounded-lg border">
                <Label className="text-xs font-medium mb-2 block">Exemple</Label>
                <code className="text-[10px] font-mono text-muted-foreground block">
                  Nom,Email,Téléphone<br/>
                  Société Alpha,contact@alpha.tn,+216 12 345 678
                </code>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportFile(null);
                }}
                disabled={importLoading}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleImport}
                disabled={!importFile || importLoading}
              >
                {importLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {importLoading ? "Import en cours..." : "Importer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clients Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Numéro fiscal</TableHead>
                      <TableHead className="font-semibold">Localisation</TableHead>
                      <TableHead className="text-right font-semibold">Solde</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "Aucun client trouvé" : "Aucun client pour le moment"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {client.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold">{client.nom}</p>
                                {client.code && (
                                  <p className="text-xs text-muted-foreground">{client.code}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.type === "client" ? "default" : "outline"}>
                              {client.type === "client" ? "Client" : "Prospect"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {client.telephone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{client.telephone}</span>
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">{client.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.numero_fiscal ? (
                              <span className="text-sm font-medium">{client.numero_fiscal}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {client.ville && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{client.ville}{client.pays && `, ${client.pays}`}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={cn(
                                  "font-bold text-sm",
                                  client.solde_actuel > 0 && "text-success",
                                  client.solde_actuel < 0 && "text-destructive",
                                  client.solde_actuel === 0 && "text-muted-foreground"
                                )}
                              >
                                {client.solde_actuel.toLocaleString()} DT
                              </span>
                              {client.solde_actuel < 0 && (
                                <Badge variant="destructive" className="text-[10px]">
                                  Dette
                                </Badge>
                              )}
                              {client.solde_actuel > 0 && (
                                <Badge className="bg-success/10 text-success border-0 text-[10px]">
                                  Crédit
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.location.href = `/crm/clients/${client.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Factures
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDialog(client.id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(client.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
