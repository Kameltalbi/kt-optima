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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MobileModuleMenuProps {
  open: boolean;
  onClose: () => void;
}

const mainModules = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Achats", path: "/achats" },
  { icon: Users, label: "Ventes", path: "/ventes" },
  { icon: Package, label: "Stock", path: "/stock" },
  { icon: Wallet, label: "Finance", path: "/finance" },
  { icon: Calculator, label: "Comptabilité", path: "/comptabilite" },
  { icon: UserCheck, label: "Ressources humaines", path: "/rh" },
  { icon: Settings, label: "Paramètres", path: "/parametres" },
];

export function MobileModuleMenu({ open, onClose }: MobileModuleMenuProps) {
  const location = useLocation();

  const handleItemClick = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0 z-[60]">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-lg font-bold">Modules</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-4">
            {mainModules.map((module) => {
              const isActive =
                location.pathname === module.path ||
                (module.path !== "/" && location.pathname.startsWith(module.path));

              return (
                <NavLink
                  key={module.path}
                  to={module.path}
                  onClick={handleItemClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <module.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{module.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
        <div className="border-t px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-muted-foreground">Entreprise SA</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
