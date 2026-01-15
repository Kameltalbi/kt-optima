import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";

export default function FactureAcompte() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveFactureAcompte = () => {
    console.log("Saving facture acompte");
    setIsDialogOpen(false);
    // TODO: Implémenter la sauvegarde de la facture d'acompte
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
      {/* TODO: Créer InvoiceAcompteCreateModal avec options fiscales */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle facture d'acompte</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">Modal de création à implémenter</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
