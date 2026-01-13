import { Bell, Search, Settings, Menu, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
}

export function Header({ title, subtitle, onMenuClick, showBackButton = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-card/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0 rounded-lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 text-primary font-semibold" />
          </Button>
        )}

        {/* Mobile Menu Button */}
        {!showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-primary/10 transition-colors flex-shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-foreground/70" />
          </Button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="w-48 lg:w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
        </div>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 transition-colors">
          <Search className="w-5 h-5 text-foreground/70" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
          <Bell className="w-5 h-5 text-foreground/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse shadow-lg shadow-accent/50" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-primary/10 transition-colors">
          <Settings className="w-5 h-5 text-foreground/70" />
        </Button>
      </div>
    </header>
  );
}
