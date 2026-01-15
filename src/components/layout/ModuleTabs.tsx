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
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10 mb-6 shadow-sm">
      <div className="flex items-center justify-between py-4">
        <nav 
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1" 
          aria-label={`Navigation ${moduleName}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={cn(
                  "relative px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out",
                  "min-w-fit whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "transform-gpu",
                  isActive
                    ? "text-success-foreground bg-success shadow-lg shadow-success/30 scale-[1.03] font-bold focus-visible:ring-success"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.97] font-medium focus-visible:ring-primary"
                )}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <>
                    {/* Barre indicateur animée en bas - couleur verte pour contraste */}
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-success rounded-full animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-md shadow-success/50" />
                    {/* Effet de brillance subtil avec gradient */}
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/40 via-white/15 to-transparent opacity-70" />
                    {/* Badge d'indicateur actif avec animation pulse - couleur verte */}
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-success-foreground rounded-full border-2 border-success shadow-lg animate-pulse" />
                  </>
                )}
                {/* Effet de hover pour les onglets inactifs */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-transparent to-muted/30 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
