import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PLAN_LABELS, type PlanType } from "./dashboardConfig";

interface LockedCardProps {
  minPlan: PlanType;
  title?: string;
  tooltip?: string;
  showCta?: boolean;
}

export function LockedCard({
  minPlan,
  title = "Indicateur supérieur",
  tooltip,
  showCta = true,
}: LockedCardProps) {
  const message = tooltip ?? `Disponible à partir du plan ${PLAN_LABELS[minPlan]}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/30 opacity-75 hover:opacity-90 transition-opacity cursor-not-allowed">
            <CardContent className="flex flex-col items-center justify-center min-h-[140px] gap-3 p-6">
              <div className="p-3 rounded-full bg-muted">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground text-center">
                {title}
              </p>
              {showCta && (
                <Button variant="outline" size="sm" asChild className="pointer-events-auto">
                  <Link to="/pricing">{PLAN_LABELS[minPlan]}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
