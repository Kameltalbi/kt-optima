import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionsTable } from "./PermissionsTable";
import { RoleFormModal } from "./RoleFormModal";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Edit, Trash2, Shield } from "lucide-react";
import type { Role, RolePermission } from "@/hooks/use-permissions";
import type { ModuleCode } from "@/permissions/can";

export function RolesPermissionsTab() {
  const { modules, getRoles, getRolePermissions, toggleRolePermission, deleteRole } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions();
    } else {
      setPermissions([]);
    }
  }, [selectedRole]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesList = await getRoles();
      setRoles(rolesList);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    if (!selectedRole?.id) return;

    try {
      setPermissionsLoading(true);
      const perms = await getRolePermissions(selectedRole.id);
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleToggle = async (
    moduleCode: ModuleCode,
    action: 'read' | 'create' | 'update' | 'delete',
    value: boolean
  ) => {
    if (!selectedRole?.id) return;

    const success = await toggleRolePermission(selectedRole.id, moduleCode, action, value);
    if (success) {
      await loadRolePermissions();
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      return;
    }

    const success = await deleteRole(role.id);
    if (success) {
      if (selectedRole?.id === role.id) {
        setSelectedRole(null);
      }
      await loadRoles();
    }
  };

  const handleCreateNew = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (!selectedRole) {
      // Si on créait un nouveau rôle, recharger la liste
      loadRoles();
    }
  };

  const handleSave = () => {
    loadRoles();
    if (selectedRole) {
      loadRolePermissions();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rôles et permissions</CardTitle>
              <CardDescription>
                Créez des rôles et définissez leurs permissions par module.
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un rôle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des rôles */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-3">Rôles existants</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Aucun rôle personnalisé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedRole?.id === role.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedRole(role)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{role.name}</p>
                            {role.description && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {role.description}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(role)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(role)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Permissions du rôle sélectionné */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">{selectedRole.name}</h3>
                  </div>
                  {selectedRole.description && (
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  )}

                  {permissionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <PermissionsTable
                      modules={modules}
                      permissions={permissions}
                      onToggle={handleToggle}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Sélectionnez un rôle pour voir et modifier ses permissions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleFormModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        role={selectedRole}
        onSave={handleSave}
      />
    </div>
  );
}
