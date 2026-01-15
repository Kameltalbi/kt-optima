import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileHeader } from "./MobileHeader";
import { MobileModuleMenu } from "./MobileModuleMenu";
import { MobilePageMenu } from "./MobilePageMenu";
import { ModuleTabs, ModuleTab } from "./ModuleTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideSidebar?: boolean;
  showBackButton?: boolean;
  moduleTabs?: ModuleTab[];
  moduleName?: string;
}

export function MainLayout({ 
  children, 
  title, 
  subtitle, 
  hideSidebar = false, 
  showBackButton = false,
  moduleTabs,
  moduleName
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Header - Always visible on mobile */}
      {isMobile && (
        <MobileHeader
          moduleName={moduleName || title}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
      )}

      {/* Mobile Module Menu (Hamburger) */}
      {isMobile && (
        <MobileModuleMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar - always visible */}
      {!isMobile && !hideSidebar && (
        <div className="sticky top-0 h-screen z-30 flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto min-w-0">
        {/* Desktop Header */}
        {!isMobile && (
          <Header 
            title={title} 
            subtitle={subtitle}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            showBackButton={showBackButton}
          />
        )}

        {/* Mobile Page Menu (Module internal pages) */}
        {isMobile && moduleTabs && moduleName && (
          <MobilePageMenu tabs={moduleTabs} moduleName={moduleName} />
        )}

        {/* Desktop Module Tabs */}
        {!isMobile && moduleTabs && moduleName && (
          <ModuleTabs tabs={moduleTabs} moduleName={moduleName} />
        )}

        <main className={`flex-1 overflow-auto ${isMobile ? (moduleTabs ? 'pt-28' : 'pt-14') : ''}`}>
          <div className={`${isMobile ? 'p-4' : 'p-4 sm:p-6'}`}>
            {/* Page Title for Mobile */}
            {isMobile && (
              <div className="mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
