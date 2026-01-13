import { useState } from "react";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  moduleName: string;
  onMenuClick: () => void;
}

export function MobileHeader({ moduleName, onMenuClick }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>Mon compte</DropdownMenuItem>
          <DropdownMenuItem>Paramètres</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
