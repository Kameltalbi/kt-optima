import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  Calculator,
  UserCheck,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Modules principaux uniquement - navigation simplifiée
const mainModules = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Achats", path: "/achats" },
  { icon: Users, label: "Ventes", path: "/ventes" },
  { icon: Package, label: "Stock", path: "/stock" },
  { icon: Wallet, label: "Finance", path: "/finance" },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite" },
  { icon: UserCheck, label: "Ressources humaines", path: "/rh" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, always show full sidebar (not collapsed)
  const effectiveCollapsed = isMobile ? false : collapsed;

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-white flex flex-col transition-all duration-300 border-r border-sidebar-border/50 shadow-xl",
        effectiveCollapsed ? "w-20" : "w-72",
        "lg:sticky lg:top-0"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!effectiveCollapsed && (
            <span className="font-bold text-lg tracking-tight animate-fade-in text-white drop-shadow-sm">
              BilvoxaERP
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-2 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white backdrop-blur-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation - Modules principaux uniquement */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainModules.map((module) => {
            // Vérifier si le module est actif (pathname commence par le path du module)
            const isActive = location.pathname === module.path || 
              (module.path !== "/" && location.pathname.startsWith(module.path));
            
            return (
              <NavLink
                key={module.path}
                to={module.path}
                onClick={handleItemClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-150",
                  isActive
                    ? "bg-white/20 text-white font-bold shadow-lg backdrop-blur-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
                )}
              >
                <module.icon
                  className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")}
                />
                {!effectiveCollapsed && (
                  <span className="truncate animate-fade-in">{module.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50 backdrop-blur-sm space-y-3">
        {/* Paramètres */}
        <NavLink
          to="/parametres"
          onClick={handleItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-150",
            location.pathname.startsWith("/parametres")
              ? "bg-white/20 text-white font-bold shadow-lg backdrop-blur-sm"
              : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
          )}
        >
          <Settings className={cn("w-5 h-5 flex-shrink-0", location.pathname.startsWith("/parametres") && "text-white")} />
          {!effectiveCollapsed && (
            <span className="truncate animate-fade-in">Paramètres</span>
          )}
        </NavLink>

        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          {!effectiveCollapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-sm font-bold truncate text-white">Admin</p>
              <p className="text-xs text-white/70 truncate font-medium">Entreprise SA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
