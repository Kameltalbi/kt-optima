import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  currency: string;
  language: string;
  plan: 'core' | 'business' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan: 'core' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  price: number | null;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  code: 'core' | 'business' | 'enterprise';
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export function useSuperadmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // ============================================
  // COMPANIES MANAGEMENT
  // ============================================
  const getCompanies = async (): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les entreprises',
        variant: 'destructive',
      });
      return [];
    }
  };

  const createCompany = async (companyData: Partial<Company>): Promise<Company | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name!,
          logo: companyData.logo || null,
          address: companyData.address || null,
          phone: companyData.phone || null,
          email: companyData.email || null,
          tax_number: companyData.tax_number || null,
          currency: companyData.currency || 'TND',
          language: companyData.language || 'fr',
          plan: companyData.plan || 'core',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise créée avec succès',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'entreprise',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id: string, companyData: Partial<Company>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('companies')
        .update({
          ...companyData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise mise à jour avec succès',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'entreprise',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Entreprise supprimée avec succès',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'entreprise',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SUBSCRIPTIONS MANAGEMENT
  // ============================================
  const getSubscriptions = async (): Promise<Subscription[]> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les abonnements',
        variant: 'destructive',
      });
      return [];
    }
  };

  const createSubscription = async (subscriptionData: Partial<Subscription>): Promise<Subscription | null> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          company_id: subscriptionData.company_id!,
          plan: subscriptionData.plan!,
          status: subscriptionData.status || 'active',
          start_date: subscriptionData.start_date || new Date().toISOString(),
          end_date: subscriptionData.end_date || null,
          trial_end_date: subscriptionData.trial_end_date || null,
          price: subscriptionData.price || null,
          currency: subscriptionData.currency || 'TND',
          billing_cycle: subscriptionData.billing_cycle || null,
          notes: subscriptionData.notes || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le plan de l'entreprise
      await supabase
        .from('companies')
        .update({ plan: subscriptionData.plan! })
        .eq('id', subscriptionData.company_id!);

      toast({
        title: 'Succès',
        description: 'Abonnement créé avec succès',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'abonnement',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, subscriptionData: Partial<Subscription>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('subscriptions')
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Si le plan change, mettre à jour l'entreprise
      if (subscriptionData.plan) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('company_id')
          .eq('id', id)
          .single();

        if (subscription) {
          await supabase
            .from('companies')
            .update({ plan: subscriptionData.plan })
            .eq('id', subscription.company_id);
        }
      }

      toast({
        title: 'Succès',
        description: 'Abonnement mis à jour avec succès',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'abonnement',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscription = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Abonnement supprimé avec succès',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'abonnement',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MODULES MANAGEMENT
  // ============================================
  const getModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les modules',
        variant: 'destructive',
      });
      return [];
    }
  };

  const updateModule = async (id: string, moduleData: Partial<Module>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('modules')
        .update({
          ...moduleData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Module mis à jour avec succès',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating module:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le module',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (id: string, active: boolean): Promise<boolean> => {
    return updateModule(id, { active });
  };

  // ============================================
  // PLANS (Static data)
  // ============================================
  const getPlans = (): Plan[] => {
    return [
      {
        code: 'core',
        name: 'Plan Core',
        description: 'CRM + Ventes + Trésorerie',
        price_monthly: 99,
        price_yearly: 990,
        features: [
          'Gestion des clients (CRM)',
          'Devis et factures',
          'Trésorerie et encaissements',
          'Support email',
        ],
      },
      {
        code: 'business',
        name: 'Plan Business',
        description: 'Core + Achats + Produits + Stocks',
        price_monthly: 199,
        price_yearly: 1990,
        features: [
          'Tout du Plan Core',
          'Gestion des fournisseurs',
          'Gestion des produits et services',
          'Gestion des stocks',
          'Support prioritaire',
        ],
      },
      {
        code: 'enterprise',
        name: 'Plan Enterprise',
        description: 'Business + Comptabilité + RH + Parc',
        price_monthly: 399,
        price_yearly: 3990,
        features: [
          'Tout du Plan Business',
          'Comptabilité complète',
          'Ressources humaines',
          'Gestion de parc',
          'Support dédié 24/7',
        ],
      },
    ];
  };

  return {
    loading,
    // Companies
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    // Subscriptions
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    // Modules
    getModules,
    updateModule,
    toggleModule,
    // Plans
    getPlans,
  };
}
