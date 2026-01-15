import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Info,
  Calculator,
  FileCheck,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayroll, FichePaie, CalculPaieResult } from "@/hooks/use-payroll";
import { useEmployes } from "@/hooks/use-employes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { generatePayslipPDF } from "@/components/payroll/PayslipPDF";
import { useApp } from "@/context/AppContext";

export default function PayrollNewPage() {
  const { companyId } = useAuth();
  const { company } = useApp();
  const { employes } = useEmployes();
  const {
    fichesPaie,
    loading,
    parametres,
    tranches,
    calculerPaie,
    creerFichePaie,
    validerFichePaie,
    marquerPayee,
    supprimerFichePaie,
    initDefaultParams,
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<FichePaie | null>(null);
  const [calculResult, setCalculResult] = useState<CalculPaieResult | null>(null);

  const [formData, setFormData] = useState({
    employe_id: "",
    periode: "",
    date_paiement: new Date().toISOString().split("T")[0],
    salaire_base: 0,
    primes: 0,
    indemnites: 0,
    heures_sup: 0,
    autres_retenues: 0,
    notes: "",
  });

  // Filtrer les employés actifs
  const activeEmployees = employes.filter(e => e.actif);

  // Initialiser les paramètres si vides
  useEffect(() => {
    if (parametres.length === 0 && tranches.length === 0) {
      initDefaultParams();
    }
  }, [parametres, tranches, initDefaultParams]);

  // Filtrer les fiches de paie
  const filteredFiches = fichesPaie.filter((fiche) => {
    const employe = fiche.employe;
    const matchesSearch =
      employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.periode.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || fiche.statut === statusFilter;
    const matchesPeriod = !periodFilter || fiche.periode === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Stats
  const totalBrut = fichesPaie.reduce((sum, f) => sum + f.brut, 0);
  const totalNet = fichesPaie.reduce((sum, f) => sum + f.net_a_payer, 0);
  const pendingCount = fichesPaie.filter((f) => f.statut === "brouillon").length;
  const validatedCount = fichesPaie.filter((f) => f.statut === "validee").length;

  // Générer les périodes
  const generatePeriods = () => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      periods.push(period);
    }
    return periods;
  };

  // Ouvrir le modal de création
  const handleCreate = () => {
    setFormData({
      employe_id: "",
      periode: generatePeriods()[0],
      date_paiement: new Date().toISOString().split("T")[0],
      salaire_base: 0,
      primes: 0,
      indemnites: 0,
      heures_sup: 0,
      autres_retenues: 0,
      notes: "",
    });
    setCalculResult(null);
    setIsCreateModalOpen(true);
  };

  // Quand on sélectionne un employé, charger son salaire de base
  const handleEmployeSelect = (employeId: string) => {
    const employe = activeEmployees.find((e) => e.id === employeId);
    setFormData((prev) => ({
      ...prev,
      employe_id: employeId,
      salaire_base: employe?.salaire_base || 0,
    }));
    setCalculResult(null);
  };

  // Calculer le net
  const handleCalculate = () => {
    if (parametres.length === 0 || tranches.length === 0) {
      toast.error("Veuillez d'abord configurer les paramètres de paie");
      return;
    }

    const result = calculerPaie({
      salaire_base: formData.salaire_base,
      primes: formData.primes,
      indemnites: formData.indemnites,
      heures_sup: formData.heures_sup,
      autres_retenues: formData.autres_retenues,
    });

    setCalculResult(result);
    toast.success(`Net à payer calculé: ${result.net_a_payer.toFixed(2)} TND`);
  };

  // Créer la fiche de paie
  const handleSave = async () => {
    if (!formData.employe_id || !formData.periode || !formData.salaire_base) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const result = await creerFichePaie(
      formData.employe_id,
      formData.periode,
      formData.date_paiement,
      {
        salaire_base: formData.salaire_base,
        primes: formData.primes,
        indemnites: formData.indemnites,
        heures_sup: formData.heures_sup,
        autres_retenues: formData.autres_retenues,
      },
      formData.notes
    );

    if (result) {
      setIsCreateModalOpen(false);
    }
  };

  // Voir une fiche de paie
  const handleView = (fiche: FichePaie) => {
    setSelectedFiche(fiche);
    setIsViewModalOpen(true);
  };

  // Générer le PDF
  const generatePDF = (fiche: FichePaie) => {
    generatePayslipPDF(fiche, company);
    toast.success("Bulletin de paie téléchargé");
  };

  const statusStyles: Record<string, string> = {
    brouillon: "bg-muted/10 text-muted-foreground border-0",
    validee: "bg-success/10 text-success border-0",
    payee: "bg-primary/10 text-primary border-0",
  };

  const statusLabels: Record<string, string> = {
    brouillon: "Brouillon",
    validee: "Validée",
    payee: "Payée",
  };

  return (
    <div className="space-y-6">
      {/* Avertissement si pas de paramètres */}
      {(parametres.length === 0 || tranches.length === 0) && (
        <Alert className="bg-warning/10 border-warning/30">
          <Settings className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Les paramètres de paie (CNSS, IRPP) ne sont pas encore configurés.
            </span>
            <Link to="/parametres/paie">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-info/5 border-info/20">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-sm">
          Calcul automatique selon le barème IRPP tunisien et les cotisations CNSS.
          Les taux sont configurables dans{" "}
          <Link to="/parametres/paie" className="underline font-medium">
            Paramètres → Paie
          </Link>
          .
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total brut</p>
                <p className="text-2xl font-bold mt-1">{totalBrut.toLocaleString()} TND</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total net</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {totalNet.toLocaleString()} TND
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
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold mt-1 text-warning">{pendingCount}</p>
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
                <p className="text-2xl font-bold mt-1 text-success">{validatedCount}</p>
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
              placeholder="Rechercher..."
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
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="validee">Validée</SelectItem>
              <SelectItem value="payee">Payée</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={periodFilter || "all"}
            onValueChange={(value) => setPeriodFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {generatePeriods().map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle fiche de paie
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Période</TableHead>
                  <TableHead className="font-semibold">Employé</TableHead>
                  <TableHead className="text-right font-semibold">Brut</TableHead>
                  <TableHead className="text-right font-semibold">CNSS</TableHead>
                  <TableHead className="text-right font-semibold">IRPP</TableHead>
                  <TableHead className="text-right font-semibold">Net à payer</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="w-32 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredFiches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune fiche de paie trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiches.map((fiche) => (
                    <TableRow key={fiche.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{fiche.periode}</TableCell>
                      <TableCell>
                        {fiche.employe?.prenom} {fiche.employe?.nom}
                        <div className="text-xs text-muted-foreground">
                          {fiche.employe?.code || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fiche.brut.toLocaleString()} TND
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {fiche.cnss_salarie.toFixed(2)} TND
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {fiche.irpp_mensuel.toFixed(2)} TND
                      </TableCell>
                      <TableCell className="text-right font-bold text-success">
                        {fiche.net_a_payer.toLocaleString()} TND
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusStyles[fiche.statut])}>
                          {statusLabels[fiche.statut]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(fiche)}
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => generatePDF(fiche)}
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {fiche.statut === "brouillon" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => validerFichePaie(fiche.id)}
                                title="Valider"
                              >
                                <FileCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  if (confirm("Supprimer cette fiche de paie ?")) {
                                    supprimerFichePaie(fiche.id);
                                  }
                                }}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {fiche.statut === "validee" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => marquerPayee(fiche.id)}
                              title="Marquer comme payée"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle fiche de paie</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employe_id">Employé *</Label>
                <Select value={formData.employe_id} onValueChange={handleEmployeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom} ({emp.code || "N/A"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode">Période *</Label>
                <Select
                  value={formData.periode}
                  onValueChange={(value) => setFormData({ ...formData, periode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatePeriods().map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_paiement">Date de paiement *</Label>
                <Input
                  id="date_paiement"
                  type="date"
                  value={formData.date_paiement}
                  onChange={(e) => setFormData({ ...formData, date_paiement: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaire_base">Salaire de base (TND) *</Label>
                <Input
                  id="salaire_base"
                  type="number"
                  value={formData.salaire_base}
                  onChange={(e) => {
                    setFormData({ ...formData, salaire_base: parseFloat(e.target.value) || 0 });
                    setCalculResult(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primes">Primes (TND)</Label>
                <Input
                  id="primes"
                  type="number"
                  value={formData.primes}
                  onChange={(e) => {
                    setFormData({ ...formData, primes: parseFloat(e.target.value) || 0 });
                    setCalculResult(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indemnites">Indemnités (TND)</Label>
                <Input
                  id="indemnites"
                  type="number"
                  value={formData.indemnites}
                  onChange={(e) => {
                    setFormData({ ...formData, indemnites: parseFloat(e.target.value) || 0 });
                    setCalculResult(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heures_sup">Heures supplémentaires (TND)</Label>
                <Input
                  id="heures_sup"
                  type="number"
                  value={formData.heures_sup}
                  onChange={(e) => {
                    setFormData({ ...formData, heures_sup: parseFloat(e.target.value) || 0 });
                    setCalculResult(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autres_retenues">Autres retenues (TND)</Label>
                <Input
                  id="autres_retenues"
                  type="number"
                  value={formData.autres_retenues}
                  onChange={(e) => {
                    setFormData({ ...formData, autres_retenues: parseFloat(e.target.value) || 0 });
                    setCalculResult(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes optionnelles..."
              />
            </div>

            {/* Bouton Calculer */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculate}
                disabled={!formData.salaire_base}
                className="w-full max-w-xs"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculer le net
              </Button>
            </div>

            {/* Résultat du calcul */}
            {calculResult && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Résultat du calcul</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Salaire brut</p>
                      <p className="text-xl font-bold">{calculResult.brut.toFixed(2)} TND</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        CNSS Salarié ({calculResult.taux_cnss_salarie.toFixed(2)}%)
                      </p>
                      <p className="text-xl font-bold text-destructive">
                        -{calculResult.cnss_salarie.toFixed(2)} TND
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Base imposable mensuelle</p>
                    <p className="font-medium">{calculResult.base_imposable.toFixed(2)} TND</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Détail IRPP (base annualisée)</p>
                    <div className="space-y-1 text-sm">
                      {calculResult.details_irpp.map((detail, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {detail.tranche} @ {detail.taux}%
                          </span>
                          <span>{detail.impot.toFixed(2)} TND</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>IRPP Annuel</span>
                        <span>{calculResult.irpp_annuel.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between font-medium text-destructive">
                        <span>IRPP Mensuel (÷12)</span>
                        <span>-{calculResult.irpp_mensuel.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Net à payer</p>
                    <p className="text-2xl font-bold text-success">
                      {calculResult.net_a_payer.toFixed(2)} TND
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Coût employeur (CNSS {calculResult.taux_cnss_employeur.toFixed(2)}%):{" "}
                    {calculResult.cnss_employeur.toFixed(2)} TND
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.employe_id || !formData.periode || !formData.salaire_base}
              >
                Créer la fiche de paie
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche de paie - {selectedFiche?.periode}</DialogTitle>
          </DialogHeader>
          {selectedFiche && (
            <div className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employé</p>
                      <p className="font-medium">
                        {selectedFiche.employe?.prenom} {selectedFiche.employe?.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Période</p>
                      <p className="font-medium">{selectedFiche.periode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de paiement</p>
                      <p className="font-medium">
                        {new Date(selectedFiche.date_paiement).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className={cn("text-xs", statusStyles[selectedFiche.statut])}>
                        {statusLabels[selectedFiche.statut]}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Rémunération</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Salaire de base</span>
                        <span>{selectedFiche.salaire_base.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Primes</span>
                        <span>{selectedFiche.primes.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indemnités</span>
                        <span>{selectedFiche.indemnites.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heures supplémentaires</span>
                        <span>{selectedFiche.heures_sup.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Salaire brut</span>
                        <span>{selectedFiche.brut.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Cotisations CNSS</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CNSS Salarié ({selectedFiche.taux_cnss_salarie.toFixed(2)}%)</span>
                        <span className="text-destructive">
                          -{selectedFiche.cnss_salarie.toFixed(2)} TND
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>CNSS Employeur ({selectedFiche.taux_cnss_employeur.toFixed(2)}%)</span>
                        <span>{selectedFiche.cnss_employeur.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">IRPP</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Base imposable mensuelle</span>
                        <span>{selectedFiche.base_imposable.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>IRPP Annuel</span>
                        <span>{selectedFiche.irpp_annuel.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IRPP Mensuel</span>
                        <span className="text-destructive">
                          -{selectedFiche.irpp_mensuel.toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedFiche.autres_retenues > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Autres retenues</span>
                        <span className="text-destructive">
                          -{selectedFiche.autres_retenues.toFixed(2)} TND
                        </span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold">Net à payer</h4>
                    <p className="text-2xl font-bold text-success">
                      {selectedFiche.net_a_payer.toFixed(2)} TND
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => generatePDF(selectedFiche)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button onClick={() => setIsViewModalOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
