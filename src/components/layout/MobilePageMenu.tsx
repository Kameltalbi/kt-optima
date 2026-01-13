import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ModuleTab } from "./ModuleTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobilePageMenuProps {
  tabs: ModuleTab[];
  moduleName: string;
}

export function MobilePageMenu({ tabs, moduleName }: MobilePageMenuProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!isMobile || !tabs || tabs.length === 0) return null;

  // Trouver l'onglet actif
  const activeTab = tabs.find(
    (tab) => location.pathname === tab.path || location.pathname.startsWith(tab.path + "/")
  );

  const handleItemClick = () => {
    setOpen(false);
  };

  return (
    <div className="lg:hidden border-b border-border bg-background sticky top-14 z-40">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <span className="font-semibold text-sm">
            {activeTab ? activeTab.label : moduleName}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="border-t border-border bg-background">
            {tabs.map((tab) => {
              const isActive =
                location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");

              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  onClick={handleItemClick}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
