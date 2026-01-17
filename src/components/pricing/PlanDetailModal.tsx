import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, AlertCircle } from "lucide-react";
import { Plan } from "@/pages/Pricing";

interface PlanDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
}

// Structure des fonctionnalités par plan
const planDetails: Record<string, {
  ventes: { status: "complete" | "partial" | "none"; features: string[] };
  clients: { status: "complete" | "partial" | "none"; features: string[] };
  stock: { status: "complete" | "partial" | "none"; features: string[] };
  tresorerie: { status: "complete" | "partial" | "none"; features: string[] };
  fournisseurs: { status: "complete" | "partial" | "none"; features: string[] };
  comptabilite: { status: "complete" | "partial" | "none"; features: string[] };
  rh: { status: "complete" | "partial" | "none"; features: string[] };
  notesFrais?: { status: "complete" | "partial" | "none"; features: string[] };
}> = {
  depart: {
    ventes: {
      status: "complete",
      features: [
        "Devis",
        "Factures clients",
        "Bons de livraison",
        "Avoirs clients",
        "Historique des ventes",
      ],
    },
    clients: {
      status: "complete",
      features: [
        "Fiche client",
        "Historique des interactions",
      ],
    },
    stock: {
      status: "none",
      features: [
        "Inventaire",
        "Mouvements de stock",
        "Valorisation",
      ],
    },
    tresorerie: {
      status: "none",
      features: [
        "Encaissements avancés",
        "Suivi des paiements",
      ],
    },
    fournisseurs: {
      status: "none",
      features: [
        "Commandes fournisseurs",
        "Factures fournisseurs",
      ],
    },
    comptabilite: {
      status: "none",
      features: [
        "Journaux",
        "TVA",
        "Paie",
      ],
    },
    rh: {
      status: "none",
      features: [
        "Gestion des employés",
        "Paie",
        "Congés & absences",
      ],
    },
  },
  starter: {
    ventes: {
      status: "complete",
      features: [
        "Devis",
        "Factures clients",
        "Bons de livraison",
        "Avoirs clients",
        "Encaissements",
      ],
    },
    clients: {
      status: "complete",
      features: [
        "Fiche client détaillée",
        "Suivi des paiements",
      ],
    },
    stock: {
      status: "partial",
      features: [
        "Inventaire",
        "Mouvements de stock",
        "Valorisation",
      ],
    },
    tresorerie: {
      status: "partial",
      features: [
        "Suivi des encaissements",
        "Affectation des paiements",
      ],
    },
    fournisseurs: {
      status: "none",
      features: [
        "Commandes fournisseurs",
        "Factures fournisseurs",
      ],
    },
    comptabilite: {
      status: "none",
      features: [
        "Journaux",
        "TVA",
        "Paie",
      ],
    },
    rh: {
      status: "none",
      features: [
        "Gestion des employés",
        "Paie",
        "Congés & absences",
      ],
    },
  },
  business: {
    ventes: {
      status: "complete",
      features: [
        "Devis",
        "Factures clients",
        "Bons de livraison",
        "Avoirs",
        "Encaissements",
      ],
    },
    clients: {
      status: "complete",
      features: [
        "Suivi avancé des paiements",
        "Historique client",
      ],
    },
    stock: {
      status: "complete",
      features: [
        "Inventaire",
        "Mouvements de stock",
        "Valorisation",
        "Multi-entrepôts",
        "Alertes de réapprovisionnement",
      ],
    },
    tresorerie: {
      status: "complete",
      features: [
        "Prévisions de trésorerie",
        "Rapprochement bancaire",
      ],
    },
    fournisseurs: {
      status: "partial",
      features: [
        "Commandes fournisseurs",
        "Factures fournisseurs",
      ],
    },
    comptabilite: {
      status: "none",
      features: [
        "Journaux",
        "TVA",
        "Paie",
      ],
    },
    rh: {
      status: "none",
      features: [
        "Gestion des employés",
        "Paie",
        "Congés & absences",
      ],
    },
  },
  business: {
    ventes: {
      status: "complete",
      features: [
        "Devis",
        "Factures clients",
        "Bons de livraison",
        "Avoirs",
        "Encaissements",
      ],
    },
    clients: {
      status: "complete",
      features: [
        "Suivi avancé des paiements",
        "Historique client",
      ],
    },
    stock: {
      status: "complete",
      features: [
        "Inventaire",
        "Mouvements de stock",
        "Valorisation",
        "Multi-entrepôts",
        "Alertes de réapprovisionnement",
      ],
    },
    tresorerie: {
      status: "complete",
      features: [
        "Prévisions de trésorerie",
        "Rapprochement bancaire",
      ],
    },
    fournisseurs: {
      status: "partial",
      features: [
        "Commandes fournisseurs",
        "Factures fournisseurs",
      ],
    },
    comptabilite: {
      status: "none",
      features: [
        "Journaux",
        "TVA",
        "Paie",
      ],
    },
    rh: {
      status: "partial",
      features: [
        "Gestion des employés",
        "Congés & absences",
      ],
    },
  },
  enterprise: {
    ventes: {
      status: "complete",
      features: [
        "Devis",
        "Factures clients",
        "Bons de livraison",
        "Avoirs",
        "Encaissements",
      ],
    },
    clients: {
      status: "complete",
      features: [
        "Suivi complet des paiements",
        "Historique détaillé",
      ],
    },
    stock: {
      status: "complete",
      features: [
        "Inventaire",
        "Mouvements de stock",
        "Valorisation",
        "Multi-entrepôts",
        "Alertes de réapprovisionnement",
      ],
    },
    tresorerie: {
      status: "complete",
      features: [
        "Prévisions",
        "Rapprochement bancaire",
      ],
    },
    fournisseurs: {
      status: "complete",
      features: [
        "Commandes fournisseurs",
        "Factures fournisseurs",
        "Paiements fournisseurs",
      ],
    },
    comptabilite: {
      status: "complete",
      features: [
        "Journaux comptables",
        "Déclarations TVA",
        "Bilan & compte de résultat",
        "Immobilisations",
      ],
    },
    rh: {
      status: "complete",
      features: [
        "Gestion des employés",
        "Paie",
        "Congés & absences",
        "Contrats de travail",
        "Documents RH",
      ],
    },
    notesFrais: {
      status: "complete",
      features: [
        "Création de notes de frais",
        "Catégories de dépenses",
        "Justificatifs",
        "Workflow de validation avancé",
        "Règles de plafonds",
        "Intégration comptable",
        "Historique & audit",
      ],
    },
  },
};

const categoryLabels: Record<string, string> = {
  ventes: "Ventes",
  clients: "Clients",
  stock: "Stock",
  tresorerie: "Trésorerie",
  fournisseurs: "Fournisseurs",
  comptabilite: "Comptabilité",
  rh: "Ressources Humaines",
  notesFrais: "Notes de frais",
};

const statusLabels: Record<"complete" | "partial" | "none", { label: string; icon: React.ReactNode; color: string }> = {
  complete: {
    label: "Complet",
    icon: <Check className="w-4 h-4" />,
    color: "text-green-600 dark:text-green-400",
  },
  partial: {
    label: "Partiel",
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-yellow-600 dark:text-yellow-400",
  },
  none: {
    label: "Non inclus",
    icon: <X className="w-4 h-4" />,
    color: "text-red-500 dark:text-red-400",
  },
};

export function PlanDetailModal({ open, onOpenChange, plan }: PlanDetailModalProps) {
  const details = planDetails[plan.id] || planDetails.depart;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Détail du plan {plan.name}
          </DialogTitle>
          <DialogDescription>
            {plan.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <Accordion type="multiple" className="w-full" defaultValue={Object.keys(details)}>
            {Object.entries(details).map(([categoryId, categoryData]) => {
              const statusInfo = statusLabels[categoryData.status];
              const categoryLabel = categoryLabels[categoryId];
              
              return (
                <AccordionItem key={categoryId} value={categoryId}>
                  <AccordionTrigger className="font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{categoryLabel}</span>
                      <span className={`flex items-center gap-1 text-sm font-normal ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {categoryData.features.map((feature, idx) => {
                        const included = categoryData.status !== "none";
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            {included ? (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${included ? '' : 'text-muted-foreground line-through'}`}>
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
