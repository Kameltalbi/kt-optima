import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company_id: string | null;
}

interface Company {
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

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  company: Company | null;
  companyId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, companyName: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile and company data
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (profileData) {
        setProfile(profileData);

        // Fetch company if profile has company_id
        if (profileData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (companyError) {
            console.error('Error fetching company:', companyError);
          } else {
            setCompany(companyData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCompany(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
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
      // 1. Create the user account
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

      // 2. Create the company
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

      // 3. Update the profile with company_id
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

      // 4. Add admin role for the user
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
  };

  const value: AuthContextType = {
    user,
    profile,
    company,
    companyId: profile?.company_id ?? null,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
