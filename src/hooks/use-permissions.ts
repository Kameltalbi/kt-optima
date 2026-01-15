import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import type { ModuleCode } from '@/permissions/can';

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface UserPermission {
  id: string;
  user_id: string;
  company_id: string;
  module_code: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module_code: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const { isAdmin, company } = useApp();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadModules();
  }, [isAdmin]);

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      toast.error('Erreur lors du chargement des modules');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // USER PERMISSIONS
  // ============================================

  const getUserPermissions = async (userId: string): Promise<UserPermission[]> => {
    if (!isAdmin || !company?.id) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', company.id);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading user permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
      return [];
    }
  };

  const toggleUserPermission = async (
    userId: string,
    moduleCode: ModuleCode,
    action: 'read' | 'create' | 'update' | 'delete',
    value: boolean
  ): Promise<boolean> => {
    if (!isAdmin || !company?.id) {
      toast.error('Vous n\'avez pas la permission de modifier les permissions');
      return false;
    }

    try {
      const actionField = `can_${action}`;
      
      // Vérifier si une permission existe déjà
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', company.id)
        .eq('module_code', moduleCode)
        .single();

      if (existing) {
        // Mettre à jour
        const updateData: any = { [actionField]: value };
        const { error } = await supabase
          .from('user_permissions')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer
        const newPermission: any = {
          user_id: userId,
          company_id: company.id,
          module_code: moduleCode,
          can_read: action === 'read' ? value : false,
          can_create: action === 'create' ? value : false,
          can_update: action === 'update' ? value : false,
          can_delete: action === 'delete' ? value : false,
        };
        newPermission[actionField] = value;

        const { error } = await supabase
          .from('user_permissions')
          .insert(newPermission);

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling user permission:', error);
      toast.error('Erreur lors de la modification');
      return false;
    }
  };

  // ============================================
  // ROLES
  // ============================================

  const getRoles = async (): Promise<Role[]> => {
    if (!isAdmin || !company?.id) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('company_id', company.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error('Erreur lors du chargement des rôles');
      return [];
    }
  };

  const createRole = async (name: string, description?: string): Promise<Role | null> => {
    if (!isAdmin || !company?.id) {
      toast.error('Vous n\'avez pas la permission de créer des rôles');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          company_id: company.id,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Rôle créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error('Erreur lors de la création du rôle');
      return null;
    }
  };

  const updateRole = async (roleId: string, name: string, description?: string): Promise<boolean> => {
    if (!isAdmin || !company?.id) {
      toast.error('Vous n\'avez pas la permission de modifier des rôles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('roles')
        .update({
          name,
          description: description || null,
        })
        .eq('id', roleId)
        .eq('company_id', company.id);

      if (error) throw error;
      toast.success('Rôle mis à jour avec succès');
      return true;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  const deleteRole = async (roleId: string): Promise<boolean> => {
    if (!isAdmin || !company?.id) {
      toast.error('Vous n\'avez pas la permission de supprimer des rôles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
        .eq('company_id', company.id);

      if (error) throw error;
      toast.success('Rôle supprimé avec succès');
      return true;
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  // ============================================
  // ROLE PERMISSIONS
  // ============================================

  const getRolePermissions = async (roleId: string): Promise<RolePermission[]> => {
    if (!isAdmin || !company?.id) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error loading role permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
      return [];
    }
  };

  const toggleRolePermission = async (
    roleId: string,
    moduleCode: ModuleCode,
    action: 'read' | 'create' | 'update' | 'delete',
    value: boolean
  ): Promise<boolean> => {
    if (!isAdmin || !company?.id) {
      toast.error('Vous n\'avez pas la permission de modifier les permissions');
      return false;
    }

    try {
      const actionField = `can_${action}`;
      
      // Vérifier si une permission existe déjà
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('id')
        .eq('role_id', roleId)
        .eq('module_code', moduleCode)
        .single();

      if (existing) {
        // Mettre à jour
        const updateData: any = { [actionField]: value };
        const { error } = await supabase
          .from('role_permissions')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer
        const newPermission: any = {
          role_id: roleId,
          module_code: moduleCode,
          can_read: action === 'read' ? value : false,
          can_create: action === 'create' ? value : false,
          can_update: action === 'update' ? value : false,
          can_delete: action === 'delete' ? value : false,
        };
        newPermission[actionField] = value;

        const { error } = await supabase
          .from('role_permissions')
          .insert(newPermission);

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling role permission:', error);
      toast.error('Erreur lors de la modification');
      return false;
    }
  };

  return {
    modules,
    loading,
    getUserPermissions,
    toggleUserPermission,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    toggleRolePermission,
  };
}
