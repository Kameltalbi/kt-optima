import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PermissionsTable } from "./PermissionsTable";
import { usePermissions } from "@/hooks/use-permissions";
import type { ModuleCode } from "@/permissions/can";
import type { Role, RolePermission } from "@/hooks/use-permissions";

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSave: () => void;
}

export function RoleFormModal({ open, onOpenChange, role, onSave }: RoleFormModalProps) {
  const { modules, getRolePermissions, toggleRolePermission, createRole, updateRole } = usePermissions();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDescription(role.description || "");
        loadPermissions();
      } else {
        setName("");
        setDescription("");
        setPermissions([]);
      }
    }
  }, [open, role]);

  const loadPermissions = async () => {
    if (!role?.id) return;

    try {
      setLoading(true);
      const perms = await getRolePermissions(role.id);
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
    if (!role?.id) return;

    const success = await toggleRolePermission(role.id, moduleCode, action, value);
    if (success) {
      await loadPermissions();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);
      if (role) {
        // Mise à jour d'un rôle existant
        await updateRole(role.id, name, description);
        onSave();
        onOpenChange(false);
      } else {
        // Création d'un nouveau rôle
        const newRole = await createRole(name, description);
        if (newRole) {
          // Après création, on peut définir les permissions
          // Les permissions seront gérées dans RolesPermissionsTab après la création
          onSave();
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? 'Modifier le rôle' : 'Créer un nouveau rôle'}</DialogTitle>
          <DialogDescription>
            Définissez le nom du rôle et ses permissions par module.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nom du rôle *</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Commercial, Comptable..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description (optionnel)</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du rôle..."
              rows={3}
            />
          </div>

          {role ? (
            <div className="space-y-2">
              <Label>Permissions</Label>
              {loading ? (
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
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              Les permissions peuvent être définies après la création du rôle.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Enregistrement...' : role ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
