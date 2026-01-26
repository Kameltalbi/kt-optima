import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { usePurchaseRequestValidation, type BudgetPalier, type BudgetPalierValidateur } from "@/hooks/use-purchase-request-validation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyUsers } from "@/hooks/use-company-users";

export default function PurchaseRequestValidationSettings() {
  const { company } = useAuth();
  const { settings, paliers, loadSettings, loadPaliers, loadValidateurs } = usePurchaseRequestValidation();
  const { users } = useCompanyUsers();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPalierDialogOpen, setIsPalierDialogOpen] = useState(false);
  const [isValidateurDialogOpen, setIsValidateurDialogOpen] = useState(false);
  const [selectedPalier, setSelectedPalier] = useState<BudgetPalier | null>(null);
  const [validateurs, setValidateurs] = useState<Record<string, BudgetPalierValidateur[]>>({});
  const [formData, setFormData] = useState({
    validation_par_paliers: false,
    montant_max_autorise: null as number | null,
  });
  const [palierFormData, setPalierFormData] = useState({
    montant_min: "",
    montant_max: "",
    nombre_validations: 1,
    ordre: 1,
    actif: true,
  });
  const [validateurFormData, setValidateurFormData] = useState({
    niveau_validation: 1,
    type_validateur: "role" as "role" | "user",
    validateur_role: "",
    validateur_user_id: "",
    ordre: 1,
  });

  // Charger les validateurs pour chaque palier
  useEffect(() => {
    const loadAllValidateurs = async () => {
      const validateursMap: Record<string, BudgetPalierValidateur[]> = {};
      for (const palier of paliers) {
        const validateursList = await loadValidateurs(palier.id);
        validateursMap[palier.id] = validateursList;
      }
      setValidateurs(validateursMap);
    };
    if (paliers.length > 0) {
      loadAllValidateurs();
    }
  }, [paliers, loadValidateurs]);

  // Initialiser le formulaire des paramètres
  useEffect(() => {
    if (settings) {
      setFormData({
        validation_par_paliers: settings.validation_par_paliers,
        montant_max_autorise: settings.montant_max_autorise,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!company?.id) return;

    try {
      const { error } = await supabase
        .from("purchase_request_settings")
        .upsert({
          company_id: company.id,
          validation_par_paliers: formData.validation_par_paliers,
          montant_max_autorise: formData.montant_max_autorise,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Paramètres sauvegardés");
      setIsSettingsDialogOpen(false);
      loadSettings();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleSavePalier = async () => {
    if (!company?.id) return;

    const montantMin = parseFloat(palierFormData.montant_min);
    const montantMax = parseFloat(palierFormData.montant_max);

    if (isNaN(montantMin) || isNaN(montantMax) || montantMax <= montantMin) {
      toast.error("Les montants doivent être valides et montant_max > montant_min");
      return;
    }

    // Vérifier les chevauchements
    const chevauchement = paliers.find(
      (p) =>
        p.id !== selectedPalier?.id &&
        ((montantMin >= p.montant_min && montantMin <= p.montant_max) ||
          (montantMax >= p.montant_min && montantMax <= p.montant_max) ||
          (montantMin <= p.montant_min && montantMax >= p.montant_max))
    );

    if (chevauchement) {
      toast.error("Ce palier chevauche avec un palier existant");
      return;
    }

    try {
      const data: any = {
        company_id: company.id,
        montant_min: montantMin,
        montant_max: montantMax,
        nombre_validations: palierFormData.nombre_validations,
        ordre: palierFormData.ordre,
        actif: palierFormData.actif,
        updated_at: new Date().toISOString(),
      };

      if (selectedPalier) {
        data.id = selectedPalier.id;
      }

      const { error } = await supabase
        .from("budget_paliers")
        .upsert(data);

      if (error) throw error;
      toast.success(selectedPalier ? "Palier modifié" : "Palier créé");
      setIsPalierDialogOpen(false);
      setSelectedPalier(null);
      setPalierFormData({
        montant_min: "",
        montant_max: "",
        nombre_validations: 1,
        ordre: paliers.length + 1,
        actif: true,
      });
      loadPaliers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleSaveValidateur = async () => {
    if (!selectedPalier) return;

    if (
      validateurFormData.type_validateur === "role" &&
      !validateurFormData.validateur_role
    ) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    if (
      validateurFormData.type_validateur === "user" &&
      !validateurFormData.validateur_user_id
    ) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    try {
      const data: any = {
        palier_id: selectedPalier.id,
        niveau_validation: validateurFormData.niveau_validation,
        type_validateur: validateurFormData.type_validateur,
        ordre: validateurFormData.ordre,
      };

      if (validateurFormData.type_validateur === "role") {
        data.validateur_role = validateurFormData.validateur_role;
      } else {
        data.validateur_user_id = validateurFormData.validateur_user_id;
      }

      const { error } = await supabase
        .from("budget_palier_validateurs")
        .insert(data);

      if (error) throw error;
      toast.success("Validateur ajouté");
      setIsValidateurDialogOpen(false);
      setValidateurFormData({
        niveau_validation: 1,
        type_validateur: "role",
        validateur_role: "",
        validateur_user_id: "",
        ordre: 1,
      });
      const validateursList = await loadValidateurs(selectedPalier.id);
      setValidateurs((prev) => ({
        ...prev,
        [selectedPalier.id]: validateursList,
      }));
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleDeletePalier = async (palierId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce palier ?")) return;

    try {
      const { error } = await supabase
        .from("budget_paliers")
        .delete()
        .eq("id", palierId);

      if (error) throw error;
      toast.success("Palier supprimé");
      loadPaliers();
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteValidateur = async (validateurId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce validateur ?")) return;

    try {
      const { error } = await supabase
        .from("budget_palier_validateurs")
        .delete()
        .eq("id", validateurId);

      if (error) throw error;
      toast.success("Validateur supprimé");
      if (selectedPalier) {
        const validateursList = await loadValidateurs(selectedPalier.id);
        setValidateurs((prev) => ({
          ...prev,
          [selectedPalier.id]: validateursList,
        }));
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const handleEditPalier = (palier: BudgetPalier) => {
    setSelectedPalier(palier);
    setPalierFormData({
      montant_min: palier.montant_min.toString(),
      montant_max: palier.montant_max.toString(),
      nombre_validations: palier.nombre_validations,
      ordre: palier.ordre,
      actif: palier.actif,
    });
    setIsPalierDialogOpen(true);
  };

  const handleAddValidateur = (palier: BudgetPalier) => {
    setSelectedPalier(palier);
    const validateursList = validateurs[palier.id] || [];
    const maxNiveau = Math.max(
      ...validateursList.map((v) => v.niveau_validation),
      0
    );
    setValidateurFormData({
      niveau_validation: maxNiveau + 1,
      type_validateur: "role",
      validateur_role: "",
      validateur_user_id: "",
      ordre: 1,
    });
    setIsValidateurDialogOpen(true);
  };

  return (
    <MainLayout
      title="Paramètres de validation"
      subtitle="Configurez les paliers de budget et les validateurs"
    >
      <div className="space-y-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paramètres de validation</CardTitle>
                <CardDescription>
                  Activez la validation par paliers de budget
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsSettingsDialogOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Validation par paliers
                </span>
                <Badge
                  variant={settings?.validation_par_paliers ? "default" : "secondary"}
                >
                  {settings?.validation_par_paliers ? "Activée" : "Désactivée"}
                </Badge>
              </div>
              {settings?.montant_max_autorise && (
                <div className="text-sm text-muted-foreground">
                  Montant maximum autorisé: {settings.montant_max_autorise.toLocaleString()} {company?.currency || "MAD"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des paliers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paliers de budget</CardTitle>
                <CardDescription>
                  Définissez les paliers de montant et le nombre de validations
                </CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedPalier(null);
                setPalierFormData({
                  montant_min: "",
                  montant_max: "",
                  nombre_validations: 1,
                  ordre: paliers.length + 1,
                  actif: true,
                });
                setIsPalierDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau palier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paliers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun palier configuré. Créez votre premier palier.
              </p>
            ) : (
              <div className="space-y-4">
                {paliers.map((palier) => (
                  <Card key={palier.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Palier {palier.ordre} - {palier.montant_min.toLocaleString()} à {palier.montant_max.toLocaleString()} {company?.currency || "MAD"}
                          </CardTitle>
                          <CardDescription>
                            {palier.nombre_validations} validation(s) requise(s)
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={palier.actif ? "default" : "secondary"}>
                            {palier.actif ? "Actif" : "Inactif"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPalier(palier)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePalier(palier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Validateurs</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddValidateur(palier)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        {validateurs[palier.id]?.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Aucun validateur configuré
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Niveau</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Validateur</TableHead>
                                <TableHead>Ordre</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validateurs[palier.id]?.map((validateur) => (
                                <TableRow key={validateur.id}>
                                  <TableCell>{validateur.niveau_validation}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {validateur.type_validateur}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {validateur.type_validateur === "role"
                                      ? validateur.validateur_role
                                      : users.find((u) => u.userId === validateur.validateur_user_id)?.fullName || "N/A"}
                                  </TableCell>
                                  <TableCell>{validateur.ordre}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteValidateur(validateur.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Paramètres */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres de validation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="validation_par_paliers">
                  Activer la validation par paliers
                </Label>
                <Switch
                  id="validation_par_paliers"
                  checked={formData.validation_par_paliers}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      validation_par_paliers: checked,
                    }))
                  }
                />
              </div>
              {formData.validation_par_paliers && (
                <div>
                  <Label htmlFor="montant_max_autorise">
                    Montant maximum autorisé (optionnel)
                  </Label>
                  <Input
                    id="montant_max_autorise"
                    type="number"
                    value={formData.montant_max_autorise || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        montant_max_autorise: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                    placeholder="Laisser vide pour illimité"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveSettings}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Palier */}
        <Dialog open={isPalierDialogOpen} onOpenChange={setIsPalierDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPalier ? "Modifier le palier" : "Nouveau palier"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="montant_min">Montant minimum</Label>
                <Input
                  id="montant_min"
                  type="number"
                  value={palierFormData.montant_min}
                  onChange={(e) =>
                    setPalierFormData((prev) => ({
                      ...prev,
                      montant_min: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="montant_max">Montant maximum</Label>
                <Input
                  id="montant_max"
                  type="number"
                  value={palierFormData.montant_max}
                  onChange={(e) =>
                    setPalierFormData((prev) => ({
                      ...prev,
                      montant_max: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="nombre_validations">
                  Nombre de validations
                </Label>
                <Input
                  id="nombre_validations"
                  type="number"
                  min="1"
                  value={palierFormData.nombre_validations}
                  onChange={(e) =>
                    setPalierFormData((prev) => ({
                      ...prev,
                      nombre_validations: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="ordre">Ordre</Label>
                <Input
                  id="ordre"
                  type="number"
                  min="1"
                  value={palierFormData.ordre}
                  onChange={(e) =>
                    setPalierFormData((prev) => ({
                      ...prev,
                      ordre: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="actif">Actif</Label>
                <Switch
                  id="actif"
                  checked={palierFormData.actif}
                  onCheckedChange={(checked) =>
                    setPalierFormData((prev) => ({ ...prev, actif: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPalierDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSavePalier}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Validateur */}
        <Dialog
          open={isValidateurDialogOpen}
          onOpenChange={setIsValidateurDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un validateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="niveau_validation">Niveau de validation</Label>
                <Input
                  id="niveau_validation"
                  type="number"
                  min="1"
                  value={validateurFormData.niveau_validation}
                  onChange={(e) =>
                    setValidateurFormData((prev) => ({
                      ...prev,
                      niveau_validation: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="type_validateur">Type de validateur</Label>
                <Select
                  value={validateurFormData.type_validateur}
                  onValueChange={(value: "role" | "user") =>
                    setValidateurFormData((prev) => ({
                      ...prev,
                      type_validateur: value,
                      validateur_role: "",
                      validateur_user_id: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role">Par rôle</SelectItem>
                    <SelectItem value="user">Par utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {validateurFormData.type_validateur === "role" ? (
                <div>
                  <Label htmlFor="validateur_role">Rôle</Label>
                  <Select
                    value={validateurFormData.validateur_role}
                    onValueChange={(value) =>
                      setValidateurFormData((prev) => ({
                        ...prev,
                        validateur_role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="accountant">Comptable</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="validateur_user_id">Utilisateur</Label>
                  <Select
                    value={validateurFormData.validateur_user_id}
                    onValueChange={(value) =>
                      setValidateurFormData((prev) => ({
                        ...prev,
                        validateur_user_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.userId} value={user.userId}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="ordre">Ordre</Label>
                <Input
                  id="ordre"
                  type="number"
                  min="1"
                  value={validateurFormData.ordre}
                  onChange={(e) =>
                    setValidateurFormData((prev) => ({
                      ...prev,
                      ordre: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsValidateurDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSaveValidateur}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
