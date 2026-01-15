/**
 * Système de permissions frontend
 * Vérifie si un utilisateur peut effectuer une action sur un module
 */

export type ModuleCode = 
  | 'dashboard'
  | 'ventes'
  | 'crm'
  | 'rh'
  | 'comptabilite'
  | 'parametres';

export type Action = 'read' | 'create' | 'update' | 'delete';

export interface UserPermission {
  module_code: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

/**
 * Vérifie si l'utilisateur peut effectuer une action sur un module
 * @param isAdmin - Si l'utilisateur est admin, toutes les permissions sont accordées
 * @param permissions - Liste des permissions de l'utilisateur
 * @param moduleCode - Code du module à vérifier
 * @param action - Action à vérifier
 * @returns true si l'action est autorisée
 */
export function can(
  isAdmin: boolean,
  permissions: UserPermission[],
  moduleCode: ModuleCode,
  action: Action
): boolean {
  // Les admins ont tous les droits
  if (isAdmin) {
    return true;
  }

  // Chercher la permission pour ce module
  const permission = permissions.find(p => p.module_code === moduleCode);

  if (!permission) {
    return false;
  }

  // Vérifier l'action spécifique
  switch (action) {
    case 'read':
      return permission.can_read;
    case 'create':
      return permission.can_create;
    case 'update':
      return permission.can_update;
    case 'delete':
      return permission.can_delete;
    default:
      return false;
  }
}

/**
 * Hook helper pour utiliser can() avec le contexte
 * (sera utilisé dans les composants)
 */
export function useCan(
  isAdmin: boolean,
  permissions: UserPermission[],
  moduleCode: ModuleCode,
  action: Action
): boolean {
  return can(isAdmin, permissions, moduleCode, action);
}
