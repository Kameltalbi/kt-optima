import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function SettingsRoles() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Rôles et permissions</CardTitle>
            <CardDescription className="text-xs">
              Configurez les accès par rôle
            </CardDescription>
          </div>
          <Button size="sm" className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Nouveau rôle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { name: "Administrateur", desc: "Accès complet", users: 1 },
            { name: "Comptabilité", desc: "Finance et rapports", users: 2 },
            { name: "Ventes", desc: "Commercial et clients", users: 3 },
          ].map((role) => (
            <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">{role.name}</p>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{role.users} utilisateurs</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
