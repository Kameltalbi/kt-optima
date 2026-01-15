import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Employe {
  id: string;
  code: string | null;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  date_naissance: string | null;
  numero_cin: string | null;
  numero_cnss: string | null;
  poste: string | null;
  departement: string | null;
  date_embauche: string;
  date_depart: string | null;
  salaire_base: number;
  actif: boolean;
  notes: string | null;
  company_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateEmployeInput {
  code?: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  numero_cin?: string;
  numero_cnss?: string;
  poste?: string;
  departement?: string;
  date_embauche: string;
  date_depart?: string;
  salaire_base: number;
  actif?: boolean;
  notes?: string;
}

export function useEmployes() {
  const { companyId } = useAuth();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEmployes = useCallback(async () => {
    if (!companyId) {
      setEmployes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('employes')
      .select('*')
      .eq('company_id', companyId)
      .order('nom', { ascending: true });

    if (error) {
      console.error('Erreur chargement employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } else {
      setEmployes(data || []);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadEmployes();
  }, [loadEmployes]);

  const createEmploye = async (input: CreateEmployeInput): Promise<Employe | null> => {
    if (!companyId) {
      toast.error('Entreprise non sélectionnée');
      return null;
    }

    const { data, error } = await supabase
      .from('employes')
      .insert({
        ...input,
        company_id: companyId,
        actif: input.actif ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création employé:', error);
      toast.error('Erreur lors de la création de l\'employé');
      return null;
    }

    toast.success('Employé créé avec succès');
    await loadEmployes();
    return data;
  };

  const updateEmploye = async (id: string, input: Partial<CreateEmployeInput>): Promise<Employe | null> => {
    const { data, error } = await supabase
      .from('employes')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour employé:', error);
      toast.error('Erreur lors de la mise à jour de l\'employé');
      return null;
    }

    toast.success('Employé mis à jour avec succès');
    await loadEmployes();
    return data;
  };

  const deleteEmploye = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression employé:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
      return false;
    }

    toast.success('Employé supprimé avec succès');
    await loadEmployes();
    return true;
  };

  const toggleActif = async (id: string, actif: boolean): Promise<boolean> => {
    const { error } = await supabase
      .from('employes')
      .update({ actif })
      .eq('id', id);

    if (error) {
      console.error('Erreur changement statut employé:', error);
      toast.error('Erreur lors du changement de statut');
      return false;
    }

    toast.success(actif ? 'Employé activé' : 'Employé désactivé');
    await loadEmployes();
    return true;
  };

  // Stats
  const activeCount = employes.filter(e => e.actif).length;
  const inactiveCount = employes.filter(e => !e.actif).length;
  const departments = Array.from(new Set(employes.map(e => e.departement).filter(Boolean)));

  return {
    employes,
    loading,
    createEmploye,
    updateEmploye,
    deleteEmploye,
    toggleActif,
    refresh: loadEmployes,
    activeCount,
    inactiveCount,
    departments,
  };
}
