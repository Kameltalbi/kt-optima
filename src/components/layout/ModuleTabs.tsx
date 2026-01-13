import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface ModuleTab {
  id: string;
  label: string;
  path: string;
}

interface ModuleTabsProps {
  tabs: ModuleTab[];
  moduleName: string;
}

export function ModuleTabs({ tabs, moduleName }: ModuleTabsProps) {
  const location = useLocation();

  // Trouver l'onglet actif
  const activeTab = tabs.find(tab => location.pathname === tab.path || location.pathname.startsWith(tab.path + '/'));

  return (
    <div className="border-b border-border/50 bg-background sticky top-0 z-10 mb-6">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">{moduleName}</h2>
          <nav className="flex items-center gap-1" aria-label={`Navigation ${moduleName}`}>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
