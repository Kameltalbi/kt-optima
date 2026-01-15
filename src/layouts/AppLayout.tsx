import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useApp } from "@/context/AppContext";
import { can, ModuleCode } from "@/permissions/can";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { isAdmin, permissions, company, user } = useApp();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto min-w-0">
        {/* Header */}
        <Header 
          title={title} 
          subtitle={subtitle}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
