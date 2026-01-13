import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Users,
  FileText,
  Truck,
  Package,
  Receipt,
  BarChart3,
  ShoppingCart,
  ClipboardList,
  PackageCheck,
  Boxes,
  ArrowLeftRight,
  AlertTriangle,
  Warehouse,
  Wallet,
  Landmark,
  Calendar,
  GitCompare,
  Calculator,
  BookOpen,
  Scale,
  FileSpreadsheet,
  UserCheck,
  Clock,
  Palmtree,
  Banknote,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Percent,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dashboardItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", path: "/" },
  { icon: Target, label: "CRM", path: "/crm" },
];

const menuGroups = [
  {
    id: "commercial",
    title: "Commercial",
    icon: Users,
    items: [
      { icon: Users, label: "Clients", path: "/clients" },
      { icon: FileText, label: "Devis", path: "/quotes" },
      { icon: Receipt, label: "Factures", path: "/invoices" },
      { icon: Truck, label: "Bons de livraison", path: "/delivery-notes" },
      { icon: BarChart3, label: "Statistiques ventes", path: "/sales-stats" },
    ],
  },
  {
    id: "achats",
    title: "Achats",
    icon: ShoppingCart,
    items: [
      { icon: Users, label: "Fournisseurs", path: "/suppliers" },
      { icon: ClipboardList, label: "Commandes", path: "/purchase-orders" },
      { icon: PackageCheck, label: "Réceptions", path: "/receptions" },
      { icon: Receipt, label: "Factures fournisseurs", path: "/supplier-invoices" },
    ],
  },
  {
    id: "stock",
    title: "Stock",
    icon: Package,
    items: [
      { icon: Boxes, label: "Inventaire", path: "/inventory" },
      { icon: ArrowLeftRight, label: "Mouvements", path: "/stock-movements" },
      { icon: AlertTriangle, label: "Alertes stock", path: "/stock-alerts" },
      { icon: Warehouse, label: "Dépôts", path: "/warehouses" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    icon: Wallet,
    items: [
      { icon: Wallet, label: "Trésorerie", path: "/treasury" },
      { icon: Landmark, label: "Banques", path: "/banks" },
      { icon: Calendar, label: "Échéanciers", path: "/payment-schedules" },
      { icon: GitCompare, label: "Rapprochements", path: "/reconciliations" },
    ],
  },
  {
    id: "comptabilite",
    title: "Comptabilité",
    icon: Calculator,
    items: [
      { icon: BookOpen, label: "Plan comptable", path: "/chart-of-accounts" },
      { icon: FileText, label: "Écritures", path: "/journal-entries" },
      { icon: FileSpreadsheet, label: "Grand livre", path: "/general-ledger" },
      { icon: Scale, label: "Balance", path: "/trial-balance" },
      { icon: Receipt, label: "Déclarations fiscales", path: "/tax-declarations" },
    ],
  },
  {
    id: "rh",
    title: "RH",
    icon: UserCheck,
    items: [
      { icon: Users, label: "Employés", path: "/employees" },
      { icon: Clock, label: "Présences", path: "/attendance" },
      { icon: Palmtree, label: "Congés", path: "/leaves" },
      { icon: Banknote, label: "Paie", path: "/payroll" },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
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

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleMouseLeave = () => {
    // Keep only the group containing active route open
    const activeGroup = menuGroups.find((group) =>
      group.items.some((item) => item.path === location.pathname)
    );
    setOpenGroups(activeGroup ? [activeGroup.id] : []);
  };

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <aside
      onMouseLeave={handleMouseLeave}
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
              Maghreb ERP
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Dashboard - Always visible */}
        <div className="mb-5">
          {!effectiveCollapsed && (
            <span className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/70">
              Tableau de bord
            </span>
          )}
          <div className="space-y-1 mt-2">
            {dashboardItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleItemClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-150",
                    isActive
                      ? "bg-white/20 text-white font-bold shadow-lg backdrop-blur-sm"
                      : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
                  )}
                >
                  <item.icon
                    className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")}
                  />
                  {!effectiveCollapsed && (
                    <span className="truncate animate-fade-in">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {menuGroups.map((group, groupIndex) => {
          const isOpen = openGroups.includes(group.id);
          const hasActiveItem = group.items.some(
            (item) => item.path === location.pathname
          );

          return (
            <div key={group.id} className={cn(groupIndex > 0 && "mt-3")}>
              {!effectiveCollapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors",
                    hasActiveItem
                      ? "text-white/95"
                      : "text-white/70 hover:text-white/90 hover:bg-white/10"
                  )}
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  !effectiveCollapsed && !isOpen ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
                )}
              >
                <div className="space-y-1 mt-2">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={handleItemClick}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-150",
                          isActive
                            ? "bg-white/20 text-white font-bold shadow-lg backdrop-blur-sm"
                            : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
                        )}
                      >
                        <item.icon
                          className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")}
                        />
                        {!collapsed && (
                          <span className="truncate animate-fade-in">{item.label}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50 backdrop-blur-sm space-y-3">
        {/* Paramètres */}
        <NavLink
          to="/settings"
          onClick={handleItemClick}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-150",
            location.pathname === "/settings"
              ? "bg-white/20 text-white font-bold shadow-lg backdrop-blur-sm"
              : "text-white/90 hover:bg-white/10 hover:text-white font-semibold"
          )}
        >
          <Settings className={cn("w-5 h-5 flex-shrink-0", location.pathname === "/settings" && "text-white")} />
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
