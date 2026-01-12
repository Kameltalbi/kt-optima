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
  FolderOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    title: "Pilotage",
    items: [
      { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
      { icon: BarChart3, label: "Rapports", path: "/reports" },
    ],
  },
  {
    title: "Ventes",
    items: [
      { icon: Users, label: "Clients & Fournisseurs", path: "/clients" },
      { icon: Package, label: "Produits & Services", path: "/products" },
      { icon: FileText, label: "Facturation", path: "/invoices" },
    ],
  },
  {
    title: "Finances",
    items: [
      { icon: Wallet, label: "Trésorerie", path: "/treasury" },
      { icon: Calculator, label: "Comptabilité", path: "/accounting" },
    ],
  },
  {
    title: "Organisation",
    items: [
      { icon: FolderKanban, label: "Projets", path: "/projects" },
      { icon: Boxes, label: "Stock & Achats", path: "/stock" },
      { icon: UserCog, label: "RH & Dépenses", path: "/hr" },
    ],
  },
  {
    title: "Système",
    items: [
      { icon: FolderOpen, label: "Documents", path: "/documents" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Settings, label: "Paramètres", path: "/settings" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
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
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={cn(groupIndex > 0 && "mt-5")}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
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
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                    {!collapsed && (
                      <span className="truncate animate-fade-in">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
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
