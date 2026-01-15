import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface ModuleTab {
  id: string;
  label: string;
  path: string;
}

interface ModuleTabsProps {
  tabs: ModuleTab[];
  moduleName: string;
}

export function ModuleTabs({ tabs, moduleName }: ModuleTabsProps) {
  const location = useLocation();

  return (
    <div className="w-full border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
      <nav 
        className="flex items-center overflow-x-auto scrollbar-hide"
        aria-label={`Navigation ${moduleName}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={cn(
                "relative px-6 py-4 text-sm font-medium whitespace-nowrap",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                "min-w-fit",
                isActive
                  ? "text-[#2563EB] font-semibold"
                  : "text-[#64748B] hover:text-[#1E40AF]"
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB]"
                  aria-hidden="true"
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
