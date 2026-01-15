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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { can, ModuleCode } from "@/permissions/can";

interface MobileModuleMenuProps {
  open: boolean;
  onClose: () => void;
}

const modules = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/dashboard",
    moduleCode: 'dashboard' as ModuleCode
  },
  { 
    icon: ShoppingCart, 
    label: "Ventes", 
    path: "/ventes",
    moduleCode: 'ventes' as ModuleCode
  },
  { 
    icon: Users, 
    label: "CRM", 
    path: "/crm",
    moduleCode: 'crm' as ModuleCode
  },
  { 
    icon: Package, 
    label: "Stock", 
    path: "/stock",
    moduleCode: 'dashboard' as ModuleCode
  },
  { 
    icon: Wallet, 
    label: "Finance", 
    path: "/finance",
    moduleCode: 'dashboard' as ModuleCode
  },
  { 
    icon: Calculator, 
    label: "Comptabilité", 
    path: "/comptabilite",
    moduleCode: 'comptabilite' as ModuleCode
  },
  { 
    icon: UserCheck, 
    label: "Ressources humaines", 
    path: "/rh",
    moduleCode: 'rh' as ModuleCode
  },
];

export function MobileModuleMenu({ open, onClose }: MobileModuleMenuProps) {
  const location = useLocation();
  const { company, user, isAdmin, isSuperadmin, permissions } = useApp();

  // Filtrer les modules selon les permissions
  const visibleModules = modules.filter(module => 
    can(isAdmin, permissions, module.moduleCode, 'read')
  );

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
