import { useState, useEffect, useMemo } from "react";
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
  Car,
  UserCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/use-plan";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Modules principaux avec mapping vers les features du plan
const allModules = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", feature: null }, // Toujours visible
  { icon: UserCircle, label: "CRM", path: "/crm", feature: "crm" },
  { icon: Users, label: "Ventes", path: "/ventes", feature: "ventes" },
  { icon: Package, label: "Stocks", path: "/stock", feature: "stocks" },
  { icon: ShoppingCart, label: "Achats", path: "/achats", feature: "achats" },
  { icon: Wallet, label: "Finances", path: "/finance", feature: "tresorerie" },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite", feature: "comptabilite" },
  { icon: UserCheck, label: "Ressources humaines", path: "/rh", feature: "rh" },
  { icon: Car, label: "Gestion de Parc", path: "/parc", feature: "parc" },
  { icon: FileText, label: "Notes de frais", path: "/rh/notes-de-frais", feature: "notesFrais" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { company, user, profile } = useAuth();
  const { features } = usePlan();

  // Filtrer les modules selon le plan acheté
  const visibleModules = useMemo(() => {
    return allModules.filter((module) => {
      // Dashboard toujours visible
      if (!module.feature) return true;

      // Vérifier si la feature est disponible dans le plan
      switch (module.feature) {
        case "crm":
          return features.crm;
        case "ventes":
          return features.ventes;
        case "stocks":
          return features.stocks;
        case "achats":
          return features.achats;
        case "tresorerie":
          return features.tresorerie !== false; // basique, standard, ou avancee
        case "comptabilite":
          return features.comptabilite;
        case "rh":
          return features.rh;
        case "parc":
          return features.parc;
        case "notesFrais":
          return features.notesFrais;
        default:
          return true;
      }
    });
  }, [features]);

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
          {company?.logo ? (
            <img 
              src={company.logo} 
              alt={company.name || "Logo entreprise"} 
              className="h-14 w-auto object-contain"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          {(!company?.logo || !company) && (
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
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

      {/* Navigation - Modules filtrés selon le plan */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {visibleModules.map((module) => {
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
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold shadow-md">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!effectiveCollapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-sm font-bold truncate text-white">{profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}</p>
              <p className="text-xs text-white/70 truncate font-medium">
                {company?.name || 'Aucune entreprise'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
