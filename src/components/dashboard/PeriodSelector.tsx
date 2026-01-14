import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PeriodType = "month" | "quarter" | "year";

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  className?: string;
}

export function PeriodSelector({ value, onChange, className = "" }: PeriodSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-32 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Mois</SelectItem>
          <SelectItem value="quarter">Trimestre</SelectItem>
          <SelectItem value="year">Année</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
