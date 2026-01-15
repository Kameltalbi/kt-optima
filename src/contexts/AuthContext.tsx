/**
 * Wrapper de compatibilité pour AuthContext
 * Réexporte useApp avec les mêmes noms pour la compatibilité ascendante
 */
import { useApp } from '@/context/AppContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Réexporter les types pour compatibilité
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

export interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  company: Company | null;
  companyId: string | null;
  refreshCompany?: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, companyName: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook de compatibilité useAuth
 * Utilise useApp en interne et mappe les propriétés
 */
export function useAuth(): AuthContextType {
  const app = useApp();
  
  return {
    user: app.user,
    profile: app.profile,
    company: app.company,
    companyId: app.profile?.company_id ?? app.company?.id ?? null,
    refreshCompany: app.refresh,
    login: app.login,
    logout: app.logout,
    register: app.register,
    isLoading: app.loading,
    isAuthenticated: !!app.user,
  };
}

/**
 * Provider de compatibilité AuthProvider
 * Utilise AppProvider en interne
 */
export { AppProvider as AuthProvider } from '@/context/AppContext';
