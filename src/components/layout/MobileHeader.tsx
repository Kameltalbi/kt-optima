import { Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface MobileHeaderProps {
  moduleName: string;
  onMenuClick: () => void;
}

export function MobileHeader({ moduleName, onMenuClick }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { company, profile, logout } = useApp();
  
  if (!isMobile) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center justify-between px-4 lg:hidden">
      {/* Hamburger Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-9 w-9"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Module Name */}
      <h1 className="flex-1 text-center font-semibold text-sm truncate px-2">
        {moduleName}
      </h1>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover">
          {(company || profile) && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{profile?.full_name || company?.name}</p>
                <p className="text-xs text-muted-foreground">{company?.email}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => navigate("/parametres/entreprise")}>
            <User className="w-4 h-4 mr-2" />
            Mon compte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/parametres")}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
