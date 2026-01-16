import SettingsUsers from "./SettingsUsers";
import SettingsRoles from "./SettingsRoles";
import SettingsPermissions from "./SettingsPermissions";
import ComingSoon from "./ComingSoon";
import { ResponsiveTabs, ResponsiveTabsContent } from "@/components/settings/ResponsiveTabs";
import { Users, Shield, KeyRound, Lock } from "lucide-react";

export default function SettingsUsersSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Utilisateurs & Sécurité</h2>
        <p className="text-muted-foreground mt-1">
          Gestion des accès, droits et sécurité
        </p>
      </div>

      <ResponsiveTabs
        defaultValue="users"
        items={[
          { value: "users", label: "Utilisateurs", icon: Users },
          { value: "roles", label: "Rôles", icon: Shield },
          { value: "permissions", label: "Permissions", icon: KeyRound },
          { value: "security", label: "Sécurité", icon: Lock },
        ]}
      >
        <ResponsiveTabsContent value="users" className="mt-6">
          <SettingsUsers />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="roles" className="mt-6">
          <SettingsRoles />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="permissions" className="mt-6">
          <SettingsPermissions />
        </ResponsiveTabsContent>

        <ResponsiveTabsContent value="security" className="mt-6">
          <ComingSoon 
            title="Paramètres de sécurité" 
            subtitle="Politique de mot de passe, sessions actives, historique de connexion" 
          />
        </ResponsiveTabsContent>
      </ResponsiveTabs>
    </div>
  );
}
