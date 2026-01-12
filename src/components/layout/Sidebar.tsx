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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: Users, label: "Clients & Fournisseurs", path: "/clients" },
  { icon: Package, label: "Produits & Services", path: "/products" },
  { icon: FileText, label: "Facturation", path: "/invoices" },
  { icon: Wallet, label: "Trésorerie", path: "/treasury" },
  { icon: FolderKanban, label: "Projets", path: "/projects" },
  { icon: BarChart3, label: "Rapports", path: "/reports" },
  { icon: Boxes, label: "Stock & Achats", path: "/stock" },
  { icon: UserCog, label: "RH & Dépenses", path: "/hr" },
  { icon: Calculator, label: "Comptabilité", path: "/accounting" },
  { icon: FolderOpen, label: "Documents", path: "/documents" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-secondary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg tracking-tight">Maghreb ERP</h1>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "erp-sidebar-item",
                isActive && "erp-sidebar-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center">
            <span className="text-sm font-semibold text-sand-foreground">A</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-sidebar-foreground/60">Entreprise SA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
