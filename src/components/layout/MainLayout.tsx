import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideSidebar?: boolean;
  showBackButton?: boolean;
}

export function MainLayout({ children, title, subtitle, hideSidebar = false, showBackButton = false }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && !hideSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      {!hideSidebar && (
        <div className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto min-w-0">
        <Header 
          title={title} 
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showBackButton={showBackButton}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
