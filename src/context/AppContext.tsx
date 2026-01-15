import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserPermission } from '@/permissions/can';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company_id: string | null;
}

export interface Company {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  currency: string;
  language: string;
  logo: string | null;
  footer: string | null;
  plan?: "core" | "business" | "enterprise";
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'manager' | 'user' | 'accountant' | 'hr' | 'sales' | 'superadmin';
  created_at: string;
}

export interface AppContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  company: Company | null;
  memberships: UserCompany[];
  permissions: UserPermission[];
  isAdmin: boolean;
  isSuperadmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isSuperadmin?: boolean }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, companyName: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Mappe les rôles aux permissions de modules
 * Pour l'instant, basé sur les rôles. Peut être étendu avec une table user_permissions plus tard.
 */
function getPermissionsFromRole(role: string): UserPermission[] {
  const allModules: UserPermission['module_code'][] = ['dashboard', 'ventes', 'crm', 'rh', 'comptabilite', 'parametres'];
  
  switch (role) {
    case 'admin':
      // Admin a tous les droits sur tous les modules
      return allModules.map(module => ({
        module_code: module,
        can_read: true,
        can_create: true,
        can_update: true,
        can_delete: true,
      }));
    
    case 'manager':
      // Manager a tous les droits sauf paramètres
      return allModules
        .filter(m => m !== 'parametres')
        .map(module => ({
          module_code: module,
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: true,
        }));
    
    case 'sales':
      // Sales a accès à Dashboard, Ventes, CRM
      return [
        { module_code: 'dashboard', can_read: true, can_create: false, can_update: false, can_delete: false },
        { module_code: 'ventes', can_read: true, can_create: true, can_update: true, can_delete: false },
        { module_code: 'crm', can_read: true, can_create: true, can_update: true, can_delete: false },
      ];
    
    case 'accountant':
      // Accountant a accès à Dashboard, Comptabilité
      return [
        { module_code: 'dashboard', can_read: true, can_create: false, can_update: false, can_delete: false },
        { module_code: 'comptabilite', can_read: true, can_create: true, can_update: true, can_delete: false },
      ];
    
    case 'hr':
      // HR a accès à Dashboard, RH
      return [
        { module_code: 'dashboard', can_read: true, can_create: false, can_update: false, can_delete: false },
        { module_code: 'rh', can_read: true, can_create: true, can_update: true, can_delete: false },
      ];
    
    case 'user':
    default:
      // User standard a seulement lecture sur Dashboard
      return [
        { module_code: 'dashboard', can_read: true, can_create: false, can_update: false, can_delete: false },
      ];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [memberships, setMemberships] = useState<UserCompany[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculer isAdmin, isSuperadmin et permissions à partir des memberships
  const isAdmin = memberships.some(m => m.role === 'admin');
  const isSuperadmin = memberships.some(m => m.role === 'superadmin');
  const currentRole = memberships[0]?.role || 'user';

  // Charger les données utilisateur dans l'ordre spécifié
  const loadUserData = async (userId: string) => {
    try {
      // 1. Charger le profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);

        // 2. Charger les user_roles (memberships)
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId);

        if (rolesError) {
          console.error('Error fetching user_roles:', rolesError);
        } else if (rolesData && rolesData.length > 0) {
          const formattedMemberships: UserCompany[] = rolesData.map(r => ({
            id: r.id,
            user_id: r.user_id,
            company_id: r.company_id,
            role: r.role as UserCompany['role'],
            created_at: r.created_at,
          }));
          setMemberships(formattedMemberships);

          // 3. Charger la company (via le premier membership ou profile.company_id)
          const companyId = formattedMemberships[0]?.company_id || profileData.company_id;
          if (companyId) {
            const { data: companyData, error: companyError } = await supabase
              .from('companies')
              .select('*')
              .eq('id', companyId)
              .maybeSingle();

            if (companyError) {
              console.error('Error fetching company:', companyError);
            } else {
              setCompany(companyData);
            }
          }

          // 4. Calculer les permissions à partir du rôle
          const rolePermissions = getPermissionsFromRole(formattedMemberships[0]?.role || 'user');
          setPermissions(rolePermissions);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refresh = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  useEffect(() => {
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            loadUserData(session.user.id).finally(() => {
              setLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setCompany(null);
          setMemberships([]);
          setPermissions([]);
          setLoading(false);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; isSuperadmin?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user is superadmin
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'superadmin')
          .maybeSingle();
        
        return { success: true, isSuperadmin: !!roleData };
      }

      return { success: true, isSuperadmin: false };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: 'Une erreur est survenue lors de la connexion' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    companyName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Erreur lors de la création du compte' };
      }

      // 2. Créer la société
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          email: email,
          currency: 'TND',
          language: 'fr',
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        return { success: false, error: 'Erreur lors de la création de l\'entreprise' };
      }

      // 3. Mettre à jour le profile avec company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: companyData.id,
          full_name: name,
        })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // 4. Ajouter le rôle admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          company_id: companyData.id,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
      }

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompany(null);
    setMemberships([]);
    setPermissions([]);
  };

  const value: AppContextType = {
    user,
    profile,
    company,
    memberships,
    permissions,
    isAdmin,
    isSuperadmin,
    loading,
    refresh,
    login,
    logout,
    register,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
