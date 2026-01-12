import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  TrendingUp,
  Users,
  FileText,
  Wallet,
} from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout 
      title="Tableau de bord" 
      subtitle="Vue d'ensemble de votre activité"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Chiffre d'affaires"
          value="328 500 MAD"
          change="+12.5% ce mois"
          changeType="positive"
          icon={TrendingUp}
          iconColor="secondary"
        />
        <StatCard
          title="Clients actifs"
          value="156"
          change="+8 nouveaux"
          changeType="positive"
          icon={Users}
          iconColor="accent"
        />
        <StatCard
          title="Factures en attente"
          value="23"
          change="45 200 MAD"
          changeType="neutral"
          icon={FileText}
          iconColor="sand"
        />
        <StatCard
          title="Solde trésorerie"
          value="185 320 MAD"
          change="+5.2% ce mois"
          changeType="positive"
          icon={Wallet}
          iconColor="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="mt-6">
        <RecentInvoices />
      </div>
    </MainLayout>
  );
}
