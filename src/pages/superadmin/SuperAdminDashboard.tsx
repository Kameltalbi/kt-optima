import { useState, useEffect } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, Activity, TrendingUp, TrendingDown, MessageSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "@/types/database";

interface PlatformStats {
  totalCompanies: number;
  totalUsers: number;
  totalDocuments: number;
  activeCompanies: number;
}

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalCompanies: 0,
    totalUsers: 0,
    totalDocuments: 0,
    activeCompanies: 0,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadTickets();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch companies count
      const { count: companiesCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch documents count (factures + devis)
      const { count: invoicesCount } = await supabase
        .from("factures_ventes")
        .select("*", { count: "exact", head: true });

      const { count: quotesCount } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true });

      setStats({
        totalCompanies: companiesCount || 0,
        totalUsers: usersCount || 0,
        totalDocuments: (invoicesCount || 0) + (quotesCount || 0),
        activeCompanies: companiesCount || 0, // All are active for now
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  const kpiCards = [
    {
      title: "Entreprises",
      value: stats.totalCompanies,
      icon: Building2,
      description: "Total inscrites",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      description: "Comptes actifs",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Documents",
      value: stats.totalDocuments,
      icon: FileText,
      description: "Générés ce mois",
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "Actives",
      value: stats.activeCompanies,
      icon: Activity,
      description: "Entreprises actives",
      trend: "100%",
      trendUp: true,
    },
  ];

  // Mock data for charts
  const monthlyData = [
    { month: "Jan", companies: 4, users: 12 },
    { month: "Fév", companies: 6, users: 18 },
    { month: "Mar", companies: 8, users: 24 },
    { month: "Avr", companies: 12, users: 35 },
    { month: "Mai", companies: 15, users: 42 },
    { month: "Jun", companies: 18, users: 56 },
  ];

  const activityData = [
    { day: "Lun", logins: 45 },
    { day: "Mar", logins: 52 },
    { day: "Mer", logins: 48 },
    { day: "Jeu", logins: 61 },
    { day: "Ven", logins: 55 },
    { day: "Sam", logins: 23 },
    { day: "Dim", logins: 18 },
  ];

  const recentActivity: ActivityItem[] = [
    { id: "1", action: "Nouvelle entreprise créée", user: "System", timestamp: "Il y a 5 min" },
    { id: "2", action: "Utilisateur connecté", user: "admin@archibat.com", timestamp: "Il y a 15 min" },
    { id: "3", action: "Module activé", user: "Super Admin", timestamp: "Il y a 1 heure" },
    { id: "4", action: "Paiement validé", user: "System", timestamp: "Il y a 2 heures" },
    { id: "5", action: "Entreprise suspendue", user: "Super Admin", timestamp: "Il y a 3 heures" },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Plateforme</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de la plateforme ERP SaaS
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : kpi.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      kpi.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {kpi.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Croissance Plateforme</CardTitle>
              <CardDescription>Évolution des entreprises et utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="companies" name="Entreprises" fill="hsl(var(--primary))" radius={4} />
                    <Bar dataKey="users" name="Utilisateurs" fill="hsl(var(--primary) / 0.5)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Hebdomadaire</CardTitle>
              <CardDescription>Connexions par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      name="Connexions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tickets de Support</CardTitle>
                <CardDescription>Dernières demandes des clients</CardDescription>
              </div>
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun ticket pour le moment
                </p>
              ) : (
                tickets.map((ticket) => {
                  const statusIcons = {
                    new: AlertCircle,
                    in_progress: Clock,
                    resolved: CheckCircle2,
                    closed: CheckCircle2,
                  };
                  const StatusIcon = statusIcons[ticket.status];
                  const priorityColors = {
                    low: "bg-blue-100 text-blue-800",
                    medium: "bg-yellow-100 text-yellow-800",
                    high: "bg-orange-100 text-orange-800",
                    urgent: "bg-red-100 text-red-800",
                  };

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between py-3 border-b last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-colors cursor-pointer"
                      onClick={() => navigate(`/superadmin/companies`)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <StatusIcon className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ticket.description.substring(0, 60)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${priorityColors[ticket.priority]} text-xs`}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {tickets.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/superadmin/companies')}
                >
                  Voir tous les tickets
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
