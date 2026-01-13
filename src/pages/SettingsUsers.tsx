import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function SettingsUsers() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Utilisateurs</CardTitle>
            <CardDescription className="text-xs">
              Gérez les utilisateurs de votre organisation
            </CardDescription>
          </div>
          <Button size="sm" className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { name: "Admin Principal", email: "admin@entreprise.ma", role: "Administrateur" },
            { name: "Comptable", email: "compta@entreprise.ma", role: "Comptabilité" },
            { name: "Commercial", email: "commercial@entreprise.ma", role: "Ventes" },
          ].map((user) => (
            <div key={user.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{user.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
