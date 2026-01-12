import { useState } from "react";
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

const menuGroups = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: "Vue d'ensemble", path: "/" },
      { icon: Target, label: "CRM", path: "/crm" },
    ],
  },
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
  {
    id: "parametres",
    title: "Paramètres",
    icon: Settings,
    items: [
      { icon: Building2, label: "Entreprise", path: "/settings/company" },
      { icon: Users, label: "Utilisateurs", path: "/settings/users" },
      { icon: Percent, label: "Taxes", path: "/settings/taxes" },
      { icon: Wrench, label: "Configuration", path: "/settings/config" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["pilotage"]);
  const location = useLocation();

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

  return (
    <aside
      onMouseLeave={handleMouseLeave}
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0 border-r border-sidebar-border/50",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight animate-fade-in">
              Maghreb ERP
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">

        {menuGroups.map((group, groupIndex) => {
          const isOpen = openGroups.includes(group.id);
          const hasActiveItem = group.items.some(
            (item) => item.path === location.pathname
          );

          return (
            <div key={group.id} className={cn(groupIndex > 0 && "mt-2")}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-colors",
                    hasActiveItem
                      ? "text-primary/80"
                      : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30"
                  )}
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  !collapsed && !isOpen ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
                )}
              >
                <div className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon
                          className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")}
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
      <div className="p-3 border-t border-sidebar-border/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">A</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <p className="text-xs font-medium truncate">Admin</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">Entreprise SA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
