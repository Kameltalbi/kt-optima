import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Module } from "@/hooks/use-permissions";
import type { ModuleCode } from "@/permissions/can";

interface PermissionData {
  module_code: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface PermissionsTableProps {
  modules: Module[];
  permissions: PermissionData[];
  onToggle: (moduleCode: ModuleCode, action: 'read' | 'create' | 'update' | 'delete', value: boolean) => void;
  disabled?: boolean;
}

export function PermissionsTable({
  modules,
  permissions,
  onToggle,
  disabled = false,
}: PermissionsTableProps) {
  const getPermission = (moduleCode: string): PermissionData | undefined => {
    return permissions.find(p => p.module_code === moduleCode);
  };

  const handleToggle = (
    moduleCode: ModuleCode,
    action: 'read' | 'create' | 'update' | 'delete',
    currentValue: boolean
  ) => {
    if (disabled) return;
    onToggle(moduleCode, action, !currentValue);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Module</TableHead>
            <TableHead className="text-center">Lire</TableHead>
            <TableHead className="text-center">Créer</TableHead>
            <TableHead className="text-center">Modifier</TableHead>
            <TableHead className="text-center">Supprimer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun module disponible
              </TableCell>
            </TableRow>
          ) : (
            modules.map((module) => {
              const perm = getPermission(module.code);
              return (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm">{module.name}</p>
                      {module.description && (
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm?.can_read || false}
                      onCheckedChange={(checked) =>
                        handleToggle(module.code as ModuleCode, 'read', perm?.can_read || false)
                      }
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm?.can_create || false}
                      onCheckedChange={(checked) =>
                        handleToggle(module.code as ModuleCode, 'create', perm?.can_create || false)
                      }
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm?.can_update || false}
                      onCheckedChange={(checked) =>
                        handleToggle(module.code as ModuleCode, 'update', perm?.can_update || false)
                      }
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={perm?.can_delete || false}
                      onCheckedChange={(checked) =>
                        handleToggle(module.code as ModuleCode, 'delete', perm?.can_delete || false)
                      }
                      disabled={disabled}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
