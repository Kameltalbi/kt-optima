import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  date: string;
}

const statusStyles = {
  paid: "erp-badge-success",
  pending: "erp-badge-warning",
  overdue: "erp-badge-destructive",
};

const statusLabels = {
  paid: "Payée",
  pending: "En attente",
  overdue: "En retard",
};

const mockInvoices: Invoice[] = [
  { id: "1", number: "FAC-2024-001", client: "Société Alpha", amount: "15 000 MAD", status: "paid", date: "12 Jan 2024" },
  { id: "2", number: "FAC-2024-002", client: "Entreprise Beta", amount: "8 500 MAD", status: "pending", date: "10 Jan 2024" },
  { id: "3", number: "FAC-2024-003", client: "Commerce Gamma", amount: "22 300 MAD", status: "overdue", date: "05 Jan 2024" },
  { id: "4", number: "FAC-2024-004", client: "Services Delta", amount: "5 200 MAD", status: "paid", date: "03 Jan 2024" },
];

export function RecentInvoices() {
  return (
    <div className="erp-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold">Factures récentes</h3>
        </div>
        <Button variant="ghost" size="sm">
          Voir tout
        </Button>
      </div>

      <div className="space-y-4">
        {mockInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-sm">{invoice.number}</p>
                <p className="text-xs text-muted-foreground">{invoice.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-sm">{invoice.amount}</p>
                <p className="text-xs text-muted-foreground">{invoice.date}</p>
              </div>
              <span className={cn("erp-badge", statusStyles[invoice.status])}>
                {statusLabels[invoice.status]}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
