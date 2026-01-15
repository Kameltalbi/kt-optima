import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "secondary" | "accent" | "sand" | "success";
}

const iconColors = {
  primary: "bg-primary text-white shadow-lg shadow-primary/30",
  secondary: "bg-secondary text-white shadow-lg shadow-secondary/30",
  accent: "bg-accent text-white shadow-lg shadow-accent/30",
  sand: "bg-sand text-white shadow-lg shadow-sand/30",
  success: "bg-success text-white shadow-lg shadow-success/30",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "secondary",
}: StatCardProps) {
  return (
    <div className="erp-stat-card animate-fade-in hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-semibold",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3.5 rounded-xl", iconColors[iconColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
