import { Plus, UserPlus, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: FileText, label: "Nouvelle facture", path: "/invoices", color: "bg-secondary" },
  { icon: UserPlus, label: "Ajouter client", path: "/clients", color: "bg-accent" },
  { icon: Plus, label: "Nouveau produit", path: "/products", color: "bg-primary" },
  { icon: Wallet, label: "Transaction", path: "/treasury", color: "bg-sand" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="erp-card animate-fade-in">
      <h3 className="text-lg font-bold mb-4 text-foreground">Actions rapides</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`${action.color} text-white h-auto py-4 flex flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
