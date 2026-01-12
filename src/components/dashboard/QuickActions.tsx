import { Plus, UserPlus, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: FileText, label: "Nouvelle facture", path: "/invoices", color: "bg-secondary hover:bg-secondary/90" },
  { icon: UserPlus, label: "Ajouter client", path: "/clients", color: "bg-accent hover:bg-accent/90" },
  { icon: Plus, label: "Nouveau produit", path: "/products", color: "bg-primary hover:bg-primary/90" },
  { icon: Wallet, label: "Transaction", path: "/treasury", color: "bg-sand hover:bg-sand/90" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="erp-card animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`${action.color} text-white h-auto py-4 flex flex-col gap-2`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
