import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { can } from "@/permissions/can";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersPermissionsTab } from "@/components/permissions/UsersPermissionsTab";
import { RolesPermissionsTab } from "@/components/permissions/RolesPermissionsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function SettingsPermissions() {
  const { isAdmin, permissions } = useApp();
  const [activeTab, setActiveTab] = useState("users");

  // Vérifier les permissions
  const canViewPermissions = can(isAdmin, permissions, 'parametres', 'read');

  if (!canViewPermissions || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Accès refusé</CardTitle>
            <CardDescription>
              Vous devez être administrateur pour accéder à cette section.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Gestion des permissions</CardTitle>
              <CardDescription>
                Configurez les permissions des utilisateurs et des rôles par module.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersPermissionsTab />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
