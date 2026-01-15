import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionsTable } from "./PermissionsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import type { ModuleCode } from "@/permissions/can";

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export function UsersPermissionsTab() {
  const { isAdmin, company } = useApp();
  const { modules, loading: modulesLoading, getUserPermissions, toggleUserPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || !company?.id) return;
    loadUsers();
  }, [isAdmin, company?.id]);

  useEffect(() => {
    if (!selectedUserId || !isAdmin) {
      setPermissions([]);
      return;
    }
    loadUserPermissions();
  }, [selectedUserId, isAdmin]);

  const loadUsers = async () => {
    if (!company?.id) return;

    try {
      // Récupérer tous les utilisateurs de la société avec leurs rôles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('company_id', company.id);

      if (error) throw error;

      // Récupérer les profils
      const usersWithDetails: User[] = await Promise.all(
        (userRoles || []).map(async (ur) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .eq('user_id', ur.user_id)
            .single();

          return {
            id: ur.id,
            user_id: ur.user_id,
            email: ur.user_id, // Fallback - idéalement récupérer depuis auth.users
            full_name: profile?.full_name || null,
            role: ur.role,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error: any) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserPermissions = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const perms = await getUserPermissions(selectedUserId);
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    moduleCode: ModuleCode,
    action: 'read' | 'create' | 'update' | 'delete',
    value: boolean
  ) => {
    if (!selectedUserId) return;

    const success = await toggleUserPermission(selectedUserId, moduleCode, action, value);
    if (success) {
      // Recharger les permissions
      await loadUserPermissions();
    }
  };

  const selectedUser = users.find(u => u.user_id === selectedUserId);
  const isSelectedUserAdmin = selectedUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permissions utilisateur</CardTitle>
          <CardDescription>
            Attribuez des permissions directement à un utilisateur par module et par action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Sélectionner un utilisateur</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choisir un utilisateur..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.full_name || user.email} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <div className="space-y-4">
              {isSelectedUserAdmin && (
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  ⚠️ Les administrateurs ont toutes les permissions. Les cases sont en lecture seule.
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PermissionsTable
                  modules={modules}
                  permissions={permissions}
                  onToggle={handleToggle}
                  disabled={isSelectedUserAdmin || modulesLoading}
                />
              )}
            </div>
          )}

          {!selectedUserId && (
            <div className="text-center py-8 text-muted-foreground">
              Sélectionnez un utilisateur pour voir et modifier ses permissions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
