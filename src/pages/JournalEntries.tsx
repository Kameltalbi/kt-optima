import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  ShoppingCart,
  Receipt,
  Wallet,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccounting } from "@/hooks/use-accounting";

// Types
interface JournalEntryLine {
  id: number;
  compteNumero: string;
  compteIntitule: string;
  libelle: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  numero: string;
  date: string;
  journal: string;
  libelle: string;
  lignes: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
  origine: 'automatique' | 'manuel';
  origineDocument?: string;
  origineType?: string;
  valide: boolean;
}

// Mock data
const mockEntries: JournalEntry[] = [
  {
    id: "1",
    numero: "ECR-2024-001",
    date: "2024-01-12",
    journal: "Ventes",
    libelle: "Facture client FAC-2024-001",
    lignes: [
      { id: 1, compteNumero: "411", compteIntitule: "Clients", libelle: "Facture FAC-2024-001", debit: 15000, credit: 0 },
      { id: 2, compteNumero: "701", compteIntitule: "Ventes de marchandises", libelle: "Facture FAC-2024-001", debit: 0, credit: 12500 },
      { id: 3, compteNumero: "44571", compteIntitule: "TVA collectée", libelle: "Facture FAC-2024-001", debit: 0, credit: 2500 },
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    equilibre: true,
    origine: "automatique",
    origineDocument: "FAC-2024-001",
    origineType: "Facture client",
    valide: true,
  },
  {
    id: "2",
    numero: "ECR-2024-002",
    date: "2024-01-15",
    journal: "Achats",
    libelle: "Facture fournisseur FAC-FOUR-2024-001",
    lignes: [
      { id: 1, compteNumero: "601", compteIntitule: "Achats de marchandises", libelle: "Facture FAC-FOUR-2024-001", debit: 12500, credit: 0 },
      { id: 2, compteNumero: "44566", compteIntitule: "TVA déductible", libelle: "Facture FAC-FOUR-2024-001", debit: 2500, credit: 0 },
      { id: 3, compteNumero: "401", compteIntitule: "Fournisseurs", libelle: "Facture FAC-FOUR-2024-001", debit: 0, credit: 15000 },
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    equilibre: true,
    origine: "automatique",
    origineDocument: "FAC-FOUR-2024-001",
    origineType: "Facture fournisseur",
    valide: true,
  },
  {
    id: "3",
    numero: "ECR-2024-003",
    date: "2024-01-12",
    journal: "Banque",
    libelle: "Paiement facture FAC-2024-001",
    lignes: [
      { id: 1, compteNumero: "512", compteIntitule: "Banques", libelle: "Paiement FAC-2024-001", debit: 15000, credit: 0 },
      { id: 2, compteNumero: "411", compteIntitule: "Clients", libelle: "Paiement FAC-2024-001", debit: 0, credit: 15000 },
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    equilibre: true,
    origine: "automatique",
    origineDocument: "FAC-2024-001",
    origineType: "Paiement client",
    valide: true,
  },
  {
    id: "4",
    numero: "ECR-2024-004",
    date: "2024-01-10",
    journal: "Divers",
    libelle: "Ajustement inventaire",
    lignes: [
      { id: 1, compteNumero: "35", compteIntitule: "Produits finis", libelle: "Ajustement inventaire", debit: 5000, credit: 0 },
      { id: 2, compteNumero: "603", compteIntitule: "Variations de stocks", libelle: "Ajustement inventaire", debit: 0, credit: 5000 },
    ],
    totalDebit: 5000,
    totalCredit: 5000,
    equilibre: true,
    origine: "automatique",
    origineDocument: "AJ-2024-001",
    origineType: "Ajustement stock",
    valide: true,
  },
  {
    id: "5",
    numero: "ECR-2024-005",
    date: "2024-01-08",
    journal: "Divers",
    libelle: "Écriture manuelle - Frais divers",
    lignes: [
      { id: 1, compteNumero: "622", compteIntitule: "Frais de transport", libelle: "Frais divers", debit: 500, credit: 0 },
      { id: 2, compteNumero: "531", compteIntitule: "Caisse", libelle: "Frais divers", debit: 0, credit: 500 },
    ],
    totalDebit: 500,
    totalCredit: 500,
    equilibre: true,
    origine: "manuel",
    valide: true,
  },
];

const journals = ["Ventes", "Achats", "Banque", "Divers"];

const mockAccounts = [
  { numero: "411", intitule: "Clients" },
  { numero: "401", intitule: "Fournisseurs" },
  { numero: "512", intitule: "Banques" },
  { numero: "531", intitule: "Caisse" },
  { numero: "701", intitule: "Ventes de marchandises" },
  { numero: "601", intitule: "Achats de marchandises" },
  { numero: "44571", intitule: "TVA collectée" },
  { numero: "44566", intitule: "TVA déductible" },
  { numero: "35", intitule: "Produits finis" },
  { numero: "603", intitule: "Variations de stocks" },
  { numero: "622", intitule: "Frais de transport" },
];

export default function JournalEntries() {
  const { entries: accountingEntries, config } = useAccounting();
  const [searchTerm, setSearchTerm] = useState("");
  const [journalFilter, setJournalFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manualEntries, setManualEntries] = useState<JournalEntry[]>([]);
  const [canCreateManual, setCanCreateManual] = useState(true); // Simule les permissions

  // Combiner les écritures automatiques et manuelles
  const entries: JournalEntry[] = [
    ...accountingEntries.map(e => ({
      ...e,
      lignes: e.lignes.map(l => ({
        id: Math.random(),
        compteNumero: l.compteNumero,
        compteIntitule: l.compteIntitule,
        libelle: l.libelle,
        debit: l.debit,
        credit: l.credit,
      })),
    })),
    ...manualEntries,
  ];

  // Form state
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    numero: "",
    date: new Date().toISOString().split('T')[0],
    journal: "Divers",
    libelle: "",
    lignes: [
      { id: 1, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
      { id: 2, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
    ],
    origine: "manuel",
    valide: false,
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.libelle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJournal = journalFilter === "all" || entry.journal === journalFilter;
    const matchesOrigin = originFilter === "all" || entry.origine === originFilter;
    const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
    const matchesDateTo = !dateTo || entry.date <= dateTo;
    return matchesSearch && matchesJournal && matchesOrigin && matchesDateFrom && matchesDateTo;
  });

  const totalEntries = entries.length;
  const automaticEntries = entries.filter(e => e.origine === "automatique").length;
  const manualEntriesCount = entries.filter(e => e.origine === "manuel").length;
  const unbalancedEntries = entries.filter(e => !e.equilibre).length;

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handleCreateEntry = () => {
    setFormData({
      numero: `ECR-2024-${String(entries.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      journal: "Divers",
      libelle: "",
      lignes: [
        { id: 1, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
        { id: 2, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
      ],
      origine: "manuel",
      valide: false,
    });
    setIsCreateModalOpen(true);
  };

  const updateLine = (lineId: number, updates: Partial<JournalEntryLine>) => {
    if (!formData.lignes) return;
    
    const updatedLines = formData.lignes.map(line => {
      if (line.id === lineId) {
        const updated = { ...line, ...updates };
        // Mettre à jour l'intitulé du compte si le numéro change
        if (updates.compteNumero) {
          const account = mockAccounts.find(a => a.numero === updates.compteNumero);
          if (account) {
            updated.compteIntitule = account.intitule;
          }
        }
        return updated;
      }
      return line;
    });
    
    const totalDebit = updatedLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = updatedLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const equilibre = totalDebit === totalCredit;
    
    setFormData({
      ...formData,
      lignes: updatedLines,
      totalDebit,
      totalCredit,
      equilibre,
    });
  };

  const addLine = () => {
    if (!formData.lignes) return;
    const newId = Math.max(...formData.lignes.map(l => l.id), 0) + 1;
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { id: newId, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 }],
    });
  };

  const removeLine = (lineId: number) => {
    if (!formData.lignes || formData.lignes.length <= 2) return;
    const updatedLines = formData.lignes.filter(l => l.id !== lineId);
    const totalDebit = updatedLines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = updatedLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const equilibre = totalDebit === totalCredit;
    
    setFormData({
      ...formData,
      lignes: updatedLines,
      totalDebit,
      totalCredit,
      equilibre,
    });
  };

  const handleSave = () => {
    if (!formData.numero || !formData.date || !formData.libelle || !formData.lignes) return;
    if (!formData.equilibre) {
      alert("L'écriture doit être équilibrée (Débit = Crédit)");
      return;
    }
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      numero: formData.numero,
      date: formData.date,
      journal: formData.journal || "Divers",
      libelle: formData.libelle,
      lignes: formData.lignes,
      totalDebit: formData.totalDebit || 0,
      totalCredit: formData.totalCredit || 0,
      equilibre: formData.equilibre || false,
      origine: "manuel",
      valide: true,
    };
    
    setManualEntries([...manualEntries, newEntry]);
    setIsCreateModalOpen(false);
    setFormData({
      numero: "",
      date: new Date().toISOString().split('T')[0],
      journal: "Divers",
      libelle: "",
      lignes: [
        { id: 1, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
        { id: 2, compteNumero: "", compteIntitule: "", libelle: "", debit: 0, credit: 0 },
      ],
      origine: "manuel",
      valide: false,
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Message explicatif */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Les écritures sont générées automatiquement depuis les modules Achats, Ventes et Finance selon le PCG Tunisien.
            {!config.enabled && (
              <span className="font-semibold text-warning ml-1">
                La génération automatique est actuellement désactivée dans les paramètres.
              </span>
            )}
            La saisie manuelle est réservée aux utilisateurs autorisés.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total écritures</p>
                  <p className="text-2xl font-bold mt-1">{totalEntries}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Automatiques</p>
                  <p className="text-2xl font-bold mt-1 text-success">
                    {automaticEntries}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manuelles</p>
                  <p className="text-2xl font-bold mt-1 text-info">
                    {manualEntriesCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-info/10">
                  <FileText className="w-5 h-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Non équilibrées</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {unbalancedEntries}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
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
                placeholder="Rechercher par numéro ou libellé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={journalFilter} onValueChange={setJournalFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Journal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les journaux</SelectItem>
                {journals.map(journal => (
                  <SelectItem key={journal} value={journal}>{journal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Origine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="automatique">Automatiques</SelectItem>
                <SelectItem value="manuel">Manuelles</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Date début"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="Date fin"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            {canCreateManual && (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleCreateEntry}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle écriture
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Écriture</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Journal</TableHead>
                    <TableHead className="font-semibold">Libellé</TableHead>
                    <TableHead className="font-semibold">Origine</TableHead>
                    <TableHead className="text-right font-semibold">Débit</TableHead>
                    <TableHead className="text-right font-semibold">Crédit</TableHead>
                    <TableHead className="font-semibold">Équilibre</TableHead>
                    <TableHead className="w-32 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune écriture trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{entry.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(entry.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.journal}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{entry.libelle}</div>
                            {entry.origineDocument && (
                              <div className="text-xs text-muted-foreground">
                                {entry.origineType} - {entry.origineDocument}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs",
                            entry.origine === "automatique" 
                              ? "bg-success/10 text-success border-0" 
                              : "bg-info/10 text-info border-0"
                          )}>
                            {entry.origine === "automatique" ? "Automatique" : "Manuelle"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {entry.totalDebit.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {entry.totalCredit.toLocaleString()} MAD
                        </TableCell>
                        <TableCell>
                          {entry.equilibre ? (
                            <Badge className="bg-success/10 text-success border-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Équilibrée
                            </Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive border-0">
                              <XCircle className="w-3 h-3 mr-1" />
                              Non équilibrée
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                            className="gap-2"
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour créer une écriture */}
      {canCreateManual && (
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle écriture comptable</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* En-tête */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">N° Écriture</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    readOnly
                    className="bg-muted"
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
                <div className="space-y-2">
                  <Label htmlFor="journal">Journal *</Label>
                  <Select
                    value={formData.journal}
                    onValueChange={(value) => setFormData({ ...formData, journal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {journals.map(journal => (
                        <SelectItem key={journal} value={journal}>{journal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="libelle">Libellé *</Label>
                  <Input
                    id="libelle"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    placeholder="Description de l'écriture..."
                  />
                </div>
              </div>

              {/* Lignes d'écriture */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Lignes d'écriture</Label>
                  <Button variant="outline" size="sm" onClick={addLine}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une ligne
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compte</TableHead>
                        <TableHead>Intitulé</TableHead>
                        <TableHead>Libellé</TableHead>
                        <TableHead className="text-right">Débit</TableHead>
                        <TableHead className="text-right">Crédit</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.lignes?.map((ligne) => (
                        <TableRow key={ligne.id}>
                          <TableCell>
                            <Select
                              value={ligne.compteNumero}
                              onValueChange={(value) => updateLine(ligne.id, { compteNumero: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="N°" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockAccounts.map(account => (
                                  <SelectItem key={account.numero} value={account.numero}>
                                    {account.numero} - {account.intitule}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ligne.compteIntitule || '-'}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={ligne.libelle}
                              onChange={(e) => updateLine(ligne.id, { libelle: e.target.value })}
                              placeholder="Libellé..."
                              className="min-w-[200px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={ligne.debit || 0}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateLine(ligne.id, { debit: value, credit: 0 });
                              }}
                              min="0"
                              step="0.01"
                              className="w-32 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={ligne.credit || 0}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateLine(ligne.id, { credit: value, debit: 0 });
                              }}
                              min="0"
                              step="0.01"
                              className="w-32 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLine(ligne.id)}
                              disabled={formData.lignes?.length === 2}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Totaux */}
                <div className="mt-4 flex justify-end gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Débit</div>
                    <div className="text-lg font-semibold">
                      {formData.totalDebit?.toLocaleString()} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Crédit</div>
                    <div className="text-lg font-semibold">
                      {formData.totalCredit?.toLocaleString()} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Écart</div>
                    <div className={cn(
                      "text-lg font-semibold",
                      formData.equilibre ? "text-success" : "text-destructive"
                    )}>
                      {((formData.totalDebit || 0) - (formData.totalCredit || 0)).toLocaleString()} MAD
                    </div>
                  </div>
                </div>

                {!formData.equilibre && (
                  <Alert className="mt-4 bg-destructive/5 border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-sm text-destructive">
                      L'écriture n'est pas équilibrée. Le total débit doit être égal au total crédit.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!formData.libelle || !formData.date || !formData.equilibre}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enregistrer l'écriture
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal pour voir une écriture */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.numero}</DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6 mt-4">
              {/* En-tête */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-semibold">{new Date(selectedEntry.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Journal</Label>
                  <p className="font-semibold">{selectedEntry.journal}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Origine</Label>
                  <Badge className={cn(
                    "mt-1",
                    selectedEntry.origine === "automatique" 
                      ? "bg-success/10 text-success border-0" 
                      : "bg-info/10 text-info border-0"
                  )}>
                    {selectedEntry.origine === "automatique" ? "Automatique" : "Manuelle"}
                  </Badge>
                </div>
                <div className="col-span-3">
                  <Label className="text-muted-foreground">Libellé</Label>
                  <p className="font-semibold">{selectedEntry.libelle}</p>
                  {selectedEntry.origineDocument && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEntry.origineType} - {selectedEntry.origineDocument}
                    </p>
                  )}
                </div>
              </div>

              {/* Lignes */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Compte</TableHead>
                      <TableHead>Intitulé</TableHead>
                      <TableHead>Libellé</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lignes.map((ligne) => (
                      <TableRow key={ligne.id}>
                        <TableCell className="font-medium">{ligne.compteNumero}</TableCell>
                        <TableCell>{ligne.compteIntitule}</TableCell>
                        <TableCell>{ligne.libelle}</TableCell>
                        <TableCell className="text-right">
                          {ligne.debit > 0 ? ligne.debit.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {ligne.credit > 0 ? ligne.credit.toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Totaux */}
                <div className="mt-4 flex justify-end gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Débit</div>
                    <div className="text-lg font-semibold">
                      {selectedEntry.totalDebit.toLocaleString()} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Crédit</div>
                    <div className="text-lg font-semibold">
                      {selectedEntry.totalCredit.toLocaleString()} MAD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
