import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useAuth } from "@/contexts/AuthContext";
import DocumentTemplate, { DocumentFormData, DocumentLine, EntrepriseInfo } from "@/components/documents/DocumentTemplate";

export default function FactureAcompte() {
  const { company } = useAuth();
  const { createFacture } = useFacturesVentes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Construire les infos entreprise depuis le contexte Auth
  const entrepriseInfo: EntrepriseInfo | undefined = company ? {
    nom: company.name,
    adresse: company.address || '',
    ville: '',
    tel: company.phone || '',
    email: company.email || '',
    mf: company.tax_number || '',
    logo: company.logo || undefined,
    piedDePage: company.footer || ''
  } : undefined;

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveFactureAcompte = async (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => {
    try {
      // Pour une facture d'acompte, on peut utiliser le montant TTC directement
      // Les lignes sont optionnelles
      let montant_ttc = 0;
      
      if (data.lignes.length > 0) {
        // Calculer depuis les lignes si présentes
        const totaux = data.lignes.reduce((acc, ligne) => {
          const sousTotal = ligne.quantite * ligne.prixHT;
          const montantRemise = sousTotal * (ligne.remise / 100);
          const htApresRemise = sousTotal - montantRemise;
          const montantTVA = htApresRemise * (ligne.tva / 100);
          const totalTTC = htApresRemise + montantTVA;
          
          return {
            montant_ht: acc.montant_ht + htApresRemise,
            montant_tva: acc.montant_tva + montantTVA,
            montant_ttc: acc.montant_ttc + totalTTC,
          };
        }, { montant_ht: 0, montant_tva: 0, montant_ttc: 0 });
        
        montant_ttc = totaux.montant_ttc;
      } else {
        // Si pas de lignes, on peut utiliser un montant simple
        // Pour l'instant, on va demander à l'utilisateur de saisir au moins une ligne avec le montant
        // Ou on peut créer une ligne automatique avec le montant total
        throw new Error('Veuillez saisir au moins une ligne avec le montant de l\'acompte');
      }

      // Convertir les lignes
      const lignes = data.lignes.map((ligne, index) => {
        const sousTotal = ligne.quantite * ligne.prixHT;
        const montantRemise = sousTotal * (ligne.remise / 100);
        const htApresRemise = sousTotal - montantRemise;
        const montantTVA = htApresRemise * (ligne.tva / 100);
        const montantTTC = htApresRemise + montantTVA;

        return {
          description: ligne.designation || 'Acompte',
          quantite: ligne.quantite,
          prix_unitaire: ligne.prixHT,
          taux_tva: ligne.tva,
          montant_ht: htApresRemise,
          montant_tva: montantTVA,
          montant_ttc: montantTTC,
          ordre: index,
        };
      });

      // Créer la facture d'acompte
      await createFacture({
        numero: data.formData.numero,
        date_facture: data.formData.date,
        client_id: data.formData.clientId,
        type_facture: 'acompte',
        montant_paye: 0,
        montant_restant: montant_ttc,
        statut: 'brouillon',
        notes: data.formData.notes || null,
      }, lignes, []); // Pas d'acomptes alloués pour une facture d'acompte

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving facture acompte:", error);
      // Error already handled in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Factures d'acompte</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion des avances clients formalisées
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture d'acompte
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            À propos des factures d'acompte
          </CardTitle>
          <CardDescription>
            Les factures d'acompte représentent des avances clients qui seront déductibles sur les factures finales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Elles ne génèrent pas de chiffre d'affaires final</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Elles créent un crédit client disponible pour déduction</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>Lors du paiement, un encaissement de type "acompte" est automatiquement créé</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal pour créer une nouvelle facture d'acompte */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[95vh]">
            <DocumentTemplate
              docType="facture_acompte"
              entreprise={entrepriseInfo}
              readOnly={false}
              onSave={handleSaveFactureAcompte}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
