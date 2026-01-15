import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanyUser {
  userId: string;
  fullName: string;
  role: string;
}

export function useCompanyUsers() {
  const { company } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!company?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer les user_roles de la société
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('company_id', company.id);

      if (rolesError) throw rolesError;

      // Récupérer les profils correspondants
      const usersData: CompanyUser[] = await Promise.all(
        (userRoles || []).map(async (ur) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', ur.user_id)
            .maybeSingle();

          return {
            userId: ur.user_id,
            fullName: profile?.full_name || 'Utilisateur inconnu',
            role: ur.role,
          };
        })
      );

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching company users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtrer par rôle si nécessaire
  const getSalesReps = useCallback(() => {
    return users.filter(u => ['sales', 'admin', 'manager'].includes(u.role));
  }, [users]);

  return {
    users,
    loading,
    refresh: fetchUsers,
    getSalesReps,
  };
}
