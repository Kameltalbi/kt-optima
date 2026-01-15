import { useState } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  Download,
  LogIn,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "login" | "action" | "error" | "info";
  user: string;
  message: string;
  details?: string;
  ip?: string;
}

// Mock data for logs
const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2026-01-15 12:45:23",
    type: "login",
    user: "admin@archibat.com",
    message: "Connexion réussie",
    ip: "192.168.1.1",
  },
  {
    id: "2",
    timestamp: "2026-01-15 12:30:15",
    type: "action",
    user: "Super Admin",
    message: "Module CRM activé",
    details: "Module ID: crm-001",
  },
  {
    id: "3",
    timestamp: "2026-01-15 12:15:00",
    type: "error",
    user: "System",
    message: "Échec de synchronisation",
    details: "Timeout après 30s",
  },
  {
    id: "4",
    timestamp: "2026-01-15 11:45:30",
    type: "info",
    user: "System",
    message: "Sauvegarde automatique terminée",
    details: "Taille: 2.3 GB",
  },
  {
    id: "5",
    timestamp: "2026-01-15 11:30:00",
    type: "login",
    user: "user@company.com",
    message: "Tentative de connexion échouée",
    ip: "10.0.0.5",
  },
  {
    id: "6",
    timestamp: "2026-01-15 11:00:00",
    type: "action",
    user: "Super Admin",
    message: "Entreprise suspendue",
    details: "Company ID: abc-123",
  },
  {
    id: "7",
    timestamp: "2026-01-15 10:30:00",
    type: "info",
    user: "System",
    message: "Mise à jour de sécurité appliquée",
  },
  {
    id: "8",
    timestamp: "2026-01-15 10:00:00",
    type: "error",
    user: "System",
    message: "Erreur de base de données",
    details: "Connection pool exhausted",
  },
];

export default function SuperAdminLogs() {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const getTypeIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "action":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: LogEntry["type"]) => {
    const styles = {
      login: "bg-blue-100 text-blue-800 border-blue-200",
      action: "bg-green-100 text-green-800 border-green-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const labels = {
      login: "Connexion",
      action: "Action",
      error: "Erreur",
      info: "Info",
    };

    return (
      <Badge variant="outline" className={styles[type]}>
        {getTypeIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const loginLogs = logs.filter((l) => l.type === "login");
  const actionLogs = logs.filter((l) => l.type === "action");
  const errorLogs = logs.filter((l) => l.type === "error");

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logs & Audit</h1>
            <p className="text-muted-foreground mt-1">
              Historique des activités et événements système
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <LogIn className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loginLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Connexions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{actionLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{errorLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Erreurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{logs.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tous les logs</TabsTrigger>
            <TabsTrigger value="logins">Connexions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="errors">Erreurs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans les logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="login">Connexions</SelectItem>
                      <SelectItem value="action">Actions</SelectItem>
                      <SelectItem value="error">Erreurs</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Journal des événements</CardTitle>
                <CardDescription>
                  {filteredLogs.length} entrée{filteredLogs.length > 1 ? "s" : ""} trouvée
                  {filteredLogs.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>{getTypeBadge(log.type)}</TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.details || log.ip || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logins">
            <Card>
              <CardHeader>
                <CardTitle>Historique des connexions</CardTitle>
                <CardDescription>Tentatives de connexion récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell className="text-muted-foreground">{log.ip || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Actions critiques</CardTitle>
                <CardDescription>Actions administratives effectuées</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell className="text-muted-foreground">{log.details || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Erreurs système</CardTitle>
                <CardDescription>Erreurs et problèmes détectés</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Erreur</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell className="text-red-600">{log.message}</TableCell>
                        <TableCell className="text-muted-foreground">{log.details || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}
