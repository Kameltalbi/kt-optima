import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Wallet,
  FolderKanban,
  BarChart3,
  Boxes,
  UserCog,
  Calculator,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Settings,
  ShoppingCart,
  Truck,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    id: "pilotage",
    title: "Pilotage",
    items: [
      { icon: BarChart3, label: "Rapports", path: "/reports" },
    ],
  },
  {
    id: "crm",
    title: "CRM",
    items: [
      { icon: Target, label: "CRM", path: "/crm" },
      { icon: Users, label: "Clients", path: "/clients" },
    ],
  },
  {
    id: "ventes",
    title: "Ventes",
    items: [
      { icon: Package, label: "Produits & Services", path: "/products" },
      { icon: FileText, label: "Facturation", path: "/invoices" },
    ],
  },
  {
    id: "achats",
    title: "Achats",
    items: [
      { icon: Truck, label: "Fournisseurs", path: "/suppliers" },
      { icon: ShoppingCart, label: "Achats", path: "/purchases" },
      { icon: Boxes, label: "Stock", path: "/stock" },
    ],
  },
  {
    id: "finances",
    title: "Finances",
    items: [
      { icon: Wallet, label: "Trésorerie", path: "/treasury" },
      { icon: Calculator, label: "Comptabilité", path: "/accounting" },
    ],
  },
  {
    id: "organisation",
    title: "Organisation",
    items: [
      { icon: FolderKanban, label: "Projets", path: "/projects" },
      { icon: UserCog, label: "Ressources Humaines", path: "/hr" },
      { icon: Wallet, label: "Dépenses", path: "/expenses" },
    ],
  },
  {
    id: "systeme",
    title: "Système",
    items: [
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Settings, label: "Paramètres", path: "/settings" },
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
        {/* Dashboard - Always visible */}
        <NavLink
          to="/"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150 mb-3",
            location.pathname === "/"
              ? "bg-primary/10 text-primary font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <LayoutDashboard className={cn("w-4 h-4 flex-shrink-0", location.pathname === "/" && "text-primary")} />
          {!collapsed && <span className="truncate animate-fade-in">Tableau de bord</span>}
        </NavLink>

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
