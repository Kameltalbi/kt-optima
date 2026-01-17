import { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

// Use the database type directly
export type Company = Tables<'companies'>;

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
  code: 'depart' | 'starter' | 'business' | 'enterprise';
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
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
  // MODULES MANAGEMENT
  // ============================================
  const getModules = async (): Promise<Module[]> => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as Module[];
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
        code: 'depart',
        name: 'Plan Départ',
        description: 'Pour indépendants et tests',
        price_monthly: 0,
        price_yearly: 0,
        currency: 'TND',
        features: [
          'Devis & factures clients',
          'Gestion des clients',
          'Produits & services',
          'Bons de livraison',
          'Historique des ventes',
        ],
      },
      {
        code: 'starter',
        name: 'Plan Starter',
        description: 'Pour petites entreprises',
        price_monthly: 45,
        price_yearly: 450,
        currency: 'TND',
        features: [
          'Tout Départ',
          'Encaissements clients',
          'Suivi des paiements',
          'Inventaire simple',
          'Avoirs clients',
        ],
      },
      {
        code: 'business',
        name: 'Plan Business',
        description: 'Pour PME en croissance',
        price_monthly: 79,
        price_yearly: 790,
        currency: 'TND',
        features: [
          'Tout Starter',
          'Gestion avancée du stock',
          'Multi-entrepôts',
          'Trésorerie & rapprochement bancaire',
          'Fournisseurs & commandes',
          'Ressources humaines',
        ],
      },
      {
        code: 'enterprise',
        name: 'Plan Enterprise',
        description: 'Pour entreprises structurées',
        price_monthly: 139,
        price_yearly: 1390,
        currency: 'TND',
        features: [
          'Tout Business',
          'Comptabilité & journaux',
          'Déclarations TVA',
          'Paie & congés',
          'Immobilisations',
          'Point de vente (POS)',
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
    // Modules
    getModules,
    updateModule,
    toggleModule,
    // Plans
    getPlans,
  };
}
