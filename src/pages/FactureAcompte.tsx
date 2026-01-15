import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { InvoiceAcompteCreateModal, InvoiceAcompteFormData } from "@/components/invoices/InvoiceAcompteCreateModal";
import { useTaxes } from "@/hooks/use-taxes";
import { toast } from "sonner";

export default function FactureAcompte() {
  const { createFacture, refreshFactures } = useFacturesVentes();
  const { taxes } = useTaxes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveFactureAcompte = async (data: InvoiceAcompteFormData) => {
    try {
      // Calculer les totaux
      let totalHT = 0;
      data.lines.forEach((line) => {
        totalHT += line.quantity * line.unitPrice;
      });

      // Appliquer la remise
      let discountAmount = 0;
      if (data.applyDiscount) {
        if (data.discountType === 'percentage') {
          discountAmount = (totalHT * data.discountValue) / 100;
        } else {
          discountAmount = data.discountValue;
        }
      }
      const totalHTAfterDiscount = totalHT - discountAmount;

      // Récupérer les taxes appliquées
      const appliedTaxesList = taxes.filter(t => data.appliedTaxes.includes(t.id));
      const percentageTaxes = appliedTaxesList.filter(t => t.type === 'percentage');
      const fixedTaxes = appliedTaxesList.filter(t => t.type === 'fixed');

      // Convertir les lignes pour le backend
      const lignes = data.lines.map((line, index) => {
        const lineTotal = line.quantity * line.unitPrice;
        let tauxTVA = 0;
        
        // Utiliser la taxe sélectionnée pour la ligne (si c'est une taxe en pourcentage)
        if (line.taxRateId) {
          const tax = taxes.find(t => t.id === line.taxRateId);
          if (tax && tax.type === 'percentage') {
            tauxTVA = tax.value;
          }
        }

        // Calculer le montant TVA pour cette ligne
        const montantTVA = (lineTotal * tauxTVA) / 100;
        const montantTTC = lineTotal + montantTVA;

        return {
          description: line.description,
          quantite: line.quantity,
          prix_unitaire: line.unitPrice,
          taux_tva: tauxTVA,
          montant_ht: lineTotal,
          montant_tva: montantTVA,
          montant_ttc: montantTTC,
          ordre: index,
        };
      });

      // Créer la facture d'acompte via le hook
      const factureData = {
        numero: data.reference || '', // Le numéro sera généré automatiquement avec préfixe "AC"
        date_facture: data.date,
        client_id: data.clientId,
        type_facture: 'acompte' as const,
        notes: data.notes || null,
      };

      await createFacture(factureData, lignes, []);
      
      setIsDialogOpen(false);
      toast.success("Facture d'acompte créée avec succès");
      // Rafraîchir la liste des factures
      await refreshFactures();
    } catch (error) {
      console.error("Error saving invoice acompte:", error);
      toast.error("Erreur lors de la création de la facture d'acompte");
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
      <InvoiceAcompteCreateModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveFactureAcompte}
      />
    </div>
  );
}
