import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePurchaseRequestValidation, validateStep, type PurchaseRequestValidation } from "@/hooks/use-purchase-request-validation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/use-currency";

interface PurchaseRequest {
  id: string;
  numero: string;
  objet?: string;
  montant_total?: number;
  statut: "brouillon" | "en_attente" | "en_validation" | "approuvee" | "validee" | "rejetee" | "convertie" | "annulee";
  created_at: string;
  validations?: PurchaseRequestValidation[];
}

export default function PurchaseRequestValidationPage() {
  const { company, user } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationAction, setValidationAction] = useState<"valide" | "rejete">("valide");
  const [commentaire, setCommentaire] = useState("");

  // Charger les demandes en attente de validation
  const loadRequests = async () => {
    if (!company?.id || !user?.id) return;

    setLoading(true);
    try {
      // Récupérer les validations assignées à l'utilisateur actuel
      const { data: validations, error: validationsError } = await supabase
        .from("purchase_request_validations")
        .select(`
          *,
          demande:demandes_achat(*)
        `)
        .eq("validateur_id", user.id)
        .eq("statut", "en_attente")
        .order("created_at", { ascending: false });

      if (validationsError) throw validationsError;

      // Formater les données
      const formattedRequests = (validations || []).map((v: any) => ({
        ...v.demande,
        validations: [v],
      }));

      setRequests(formattedRequests);
    } catch (error: any) {
      console.error("Erreur lors du chargement:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [company?.id, user?.id]);

  const handleValidate = async () => {
    if (!selectedRequest || !selectedRequest.validations?.[0]) return;

    const validation = selectedRequest.validations[0];
    const success = await validateStep(validation.id, validationAction, commentaire);

    if (success) {
      toast.success(
        validationAction === "valide"
          ? "Validation effectuée"
          : "Demande rejetée"
      );
      setIsValidationDialogOpen(false);
      setSelectedRequest(null);
      setCommentaire("");
      loadRequests();
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "brouillon":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "en_validation":
        return <Badge className="bg-warning/10 text-warning">En validation</Badge>;
      case "validee":
        return <Badge className="bg-success/10 text-success">Validée</Badge>;
      case "rejetee":
        return <Badge className="bg-destructive/10 text-destructive">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getValidationStatusIcon = (statut: string) => {
    switch (statut) {
      case "valide":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "rejete":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <MainLayout
      title="Validation des demandes d'achat"
      subtitle="Validez ou rejetez les demandes qui vous sont assignées"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune demande en attente de validation
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const validation = request.validations?.[0];
              return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.numero}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.objet || "Aucun objet"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.statut)}
                        <Badge variant="outline">
                          {formatCurrency(request.montant_total || 0)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {validation && (
                        <div className="flex items-center gap-2 text-sm">
                          {getValidationStatusIcon(validation.statut)}
                          <span>
                            Niveau de validation: {validation.niveau_validation}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setValidationAction("valide");
                            setIsValidationDialogOpen(true);
                          }}
                          className="bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Valider
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setValidationAction("rejete");
                            setIsValidationDialogOpen(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog de validation */}
        <Dialog
          open={isValidationDialogOpen}
          onOpenChange={setIsValidationDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {validationAction === "valide"
                  ? "Valider la demande"
                  : "Rejeter la demande"}
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label>Demande</Label>
                  <p className="text-sm font-medium">{selectedRequest.numero}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.objet || "Aucun objet"}
                  </p>
                  <p className="text-sm font-semibold mt-2">
                    Montant: {formatCurrency(selectedRequest.montant_total || 0)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="commentaire">
                    Commentaire {validationAction === "rejete" && "(obligatoire)"}
                  </Label>
                  <Textarea
                    id="commentaire"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder={
                      validationAction === "valide"
                        ? "Commentaire optionnel"
                        : "Raison du rejet"
                    }
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsValidationDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleValidate}
                disabled={
                  validationAction === "rejete" && !commentaire.trim()
                }
                className={
                  validationAction === "valide"
                    ? "bg-success hover:bg-success/90"
                    : "bg-destructive hover:bg-destructive/90"
                }
              >
                {validationAction === "valide" ? "Valider" : "Rejeter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
