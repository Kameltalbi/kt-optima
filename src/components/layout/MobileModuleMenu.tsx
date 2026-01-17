import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  Calculator,
  UserCheck,
  Settings,
  Shield,
  Car,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { can, ModuleCode } from "@/permissions/can";
import { usePlan } from "@/hooks/use-plan";
import { useMemo } from "react";

interface MobileModuleMenuProps {
  open: boolean;
  onClose: () => void;
}

const allModules = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/dashboard",
    moduleCode: 'dashboard' as ModuleCode,
    feature: null // Toujours visible
  },
  { 
    icon: ShoppingCart, 
    label: "Ventes", 
    path: "/ventes",
    moduleCode: 'ventes' as ModuleCode,
    feature: "ventes"
  },
  { 
    icon: Users, 
    label: "CRM", 
    path: "/crm",
    moduleCode: 'crm' as ModuleCode,
    feature: "crm"
  },
  { 
    icon: Package, 
    label: "Stock", 
    path: "/stock",
    moduleCode: 'dashboard' as ModuleCode,
    feature: "stocks"
  },
  { 
    icon: Wallet, 
    label: "Finance", 
    path: "/finance",
    moduleCode: 'dashboard' as ModuleCode,
    feature: "tresorerie"
  },
  { 
    icon: ShoppingCart, 
    label: "Achats", 
    path: "/achats",
    moduleCode: 'dashboard' as ModuleCode,
    feature: "achats"
  },
  { 
    icon: Calculator, 
    label: "Comptabilité", 
    path: "/comptabilite",
    moduleCode: 'comptabilite' as ModuleCode,
    feature: "comptabilite"
  },
  { 
    icon: UserCheck, 
    label: "Ressources humaines", 
    path: "/rh",
    moduleCode: 'rh' as ModuleCode,
    feature: "rh"
  },
  { 
    icon: Car, 
    label: "Gestion de Parc", 
    path: "/parc",
    moduleCode: 'dashboard' as ModuleCode,
    feature: "parc"
  },
  { 
    icon: FileText, 
    label: "Notes de frais", 
    path: "/rh/notes-de-frais",
    moduleCode: 'rh' as ModuleCode,
    feature: "notesFrais"
  },
];

export function MobileModuleMenu({ open, onClose }: MobileModuleMenuProps) {
  const location = useLocation();
  const { company, user, isAdmin, isSuperadmin, permissions } = useApp();
  const { features } = usePlan();

  // Filtrer les modules selon le plan ET les permissions
  const visibleModules = useMemo(() => {
    return allModules.filter(module => {
      // Vérifier d'abord si le module est disponible dans le plan
      if (module.feature) {
        switch (module.feature) {
          case "crm":
            if (!features.crm) return false;
            break;
          case "ventes":
            if (!features.ventes) return false;
            break;
          case "stocks":
            if (!features.stocks) return false;
            break;
          case "achats":
            if (!features.achats) return false;
            break;
          case "tresorerie":
            if (features.tresorerie === false) return false;
            break;
          case "comptabilite":
            if (!features.comptabilite) return false;
            break;
          case "rh":
            if (!features.rh) return false;
            break;
          case "parc":
            if (!features.parc) return false;
            break;
          case "notesFrais":
            if (!features.notesFrais) return false;
            break;
        }
      }

      // Ensuite vérifier les permissions
      return can(isAdmin, permissions, module.moduleCode, 'read');
    });
  }, [features, isAdmin, permissions]);

  const handleItemClick = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0 z-[60] bg-sidebar text-white border-r-0">
        <SheetHeader className="px-6 py-4 border-b border-sidebar-border/50">
          <SheetTitle className="text-lg font-bold text-white">Modules</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-4">
            {visibleModules.map((module) => {
              const isActive =
                location.pathname === module.path ||
                (module.path !== "/" && location.pathname.startsWith(module.path));

              return (
                <NavLink
                  key={module.path}
                  to={module.path}
                  onClick={handleItemClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-150",
                    isActive
                      ? "bg-white/20 text-white font-bold shadow-lg"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <module.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{module.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="border-t border-sidebar-border/50 p-4 space-y-2">
          {/* Super Admin - visible uniquement pour superadmin */}
          {isSuperadmin && (
            <NavLink
              to="/superadmin"
              onClick={handleItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-150",
                location.pathname.startsWith("/superadmin")
                  ? "bg-white/20 text-white font-bold shadow-lg"
                  : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
              )}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Super Admin</span>
            </NavLink>
          )}
          
          {/* Paramètres */}
          {can(isAdmin, permissions, 'parametres', 'read') && (
            <NavLink
              to="/parametres"
              onClick={handleItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-150",
                location.pathname.startsWith("/parametres")
                  ? "bg-white/20 text-white font-bold shadow-lg"
                  : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Paramètres</span>
            </NavLink>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 px-2 py-2 mt-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-white">{user?.email?.split('@')[0] || 'Utilisateur'}</p>
              <p className="text-xs text-white/70 truncate font-medium">{company?.name || 'Entreprise'}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
