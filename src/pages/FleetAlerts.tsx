import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Calendar,
  XCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useFleet } from "@/hooks/use-fleet";
import { useNavigate } from "react-router-dom";
import type { FleetAlert } from "@/types/database";

export default function FleetAlerts() {
  const { equipment, alerts } = useFleet();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const typeLabels: Record<FleetAlert["type"], string> = {
    upcoming_maintenance: "Entretien à venir",
    overdue_maintenance: "Entretien en retard",
    inactive_equipment: "Équipement hors service",
  };

  const priorityColors: Record<FleetAlert["priority"], string> = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  };

  const priorityIcons: Record<FleetAlert["priority"], typeof AlertTriangle> = {
    high: AlertTriangle,
    medium: Calendar,
    low: XCircle,
  };

  const filteredAlerts = alerts.filter((alert) => {
    return typeFilter === "all" || alert.type === typeFilter;
  });

  const highPriorityCount = alerts.filter(a => a.priority === 'high').length;
  const mediumPriorityCount = alerts.filter(a => a.priority === 'medium').length;
  const lowPriorityCount = alerts.filter(a => a.priority === 'low').length;

  const handleViewEquipment = (equipmentId: string) => {
    navigate("/parc/equipements");
    // Scroll to equipment or open modal - simplified for now
  };

  const getAlertIcon = (alert: FleetAlert) => {
    const Icon = priorityIcons[alert.priority];
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total alertes</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Priorité haute</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Priorité moyenne</p>
                <p className="text-2xl font-bold text-orange-600">{mediumPriorityCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Priorité basse</p>
                <p className="text-2xl font-bold text-blue-600">{lowPriorityCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Alertes</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="upcoming_maintenance">Entretien à venir</SelectItem>
                <SelectItem value="overdue_maintenance">Entretien en retard</SelectItem>
                <SelectItem value="inactive_equipment">Équipement hors service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Aucune alerte</p>
              <p className="text-muted-foreground">
                Tous vos équipements sont à jour
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const equipmentItem = equipment.find(e => e.id === alert.equipmentId);
                return (
                  <Alert
                    key={alert.id}
                    variant={priorityColors[alert.priority] as any}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewEquipment(alert.equipmentId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getAlertIcon(alert)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <AlertTitle className="flex items-center gap-2">
                            {typeLabels[alert.type]}
                            <Badge variant={priorityColors[alert.priority] as any}>
                              {alert.priority === 'high' ? 'Haute' : alert.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </Badge>
                          </AlertTitle>
                        </div>
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">{alert.message}</p>
                            {equipmentItem && (
                              <p className="text-sm">
                                Équipement: <span className="font-medium">{equipmentItem.name}</span> ({equipmentItem.reference})
                              </p>
                            )}
                            {alert.dueDate && (
                              <p className="text-sm">
                                Échéance: {new Date(alert.dueDate).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEquipment(alert.equipmentId);
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
