import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { CRMContact, CRMCompany, CRMOpportunity, CRMActivity } from '@/types/database';

// Helper function to map database fields to interface aliases
const mapContactFromDB = (db: any): CRMContact => ({
  ...db,
  firstName: db.first_name,
  lastName: db.last_name,
  function: db.position,
  companyId: db.crm_company_id,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapCompanyFromDB = (db: any): CRMCompany => ({
  ...db,
  taxNumber: db.tax_number,
  salesRepId: db.sales_rep_id,
  status: db.status || 'prospect', // Ajouter le statut avec valeur par défaut
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapOpportunityFromDB = (db: any): CRMOpportunity => ({
  ...db,
  companyId: db.crm_company_id,
  contactId: db.crm_contact_id,
  estimatedAmount: db.estimated_amount,
  expectedCloseDate: db.expected_close_date,
  salesRepId: db.sales_rep_id,
  quoteId: db.quote_id,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapActivityFromDB = (db: any): CRMActivity => ({
  ...db,
  contactId: db.crm_contact_id,
  companyId: db.crm_company_id,
  opportunityId: db.crm_opportunity_id,
  salesRepId: db.sales_rep_id,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export function useCRM() {
  const { companyId } = useAuth();
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [companies, setCompanies] = useState<CRMCompany[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all CRM data
  const fetchAll = useCallback(async () => {
    if (!companyId) {
      setContacts([]);
      setCompanies([]);
      setOpportunities([]);
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts((contactsData || []).map(mapContactFromDB));

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('crm_companies')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;
      setCompanies((companiesData || []).map(mapCompanyFromDB));

      // Fetch opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('crm_opportunities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (opportunitiesError) throw opportunitiesError;
      setOpportunities((opportunitiesData || []).map(mapOpportunityFromDB));

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities((activitiesData || []).map(mapActivityFromDB));
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast.error('Erreur lors du chargement des données CRM');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Contact methods
  const createContact = useCallback(async (contactData: Partial<CRMContact> & { firstName?: string; lastName?: string; function?: string; companyId?: string }) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .insert({
          first_name: contactData.first_name || contactData.firstName || '',
          last_name: contactData.last_name || contactData.lastName || '',
          phone: contactData.phone || null,
          email: contactData.email || null,
          position: contactData.position || contactData.function || null,
          crm_company_id: contactData.crm_company_id || contactData.companyId || null,
          tags: contactData.tags || null,
          notes: contactData.notes || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Contact créé avec succès');
      await fetchAll();
      return mapContactFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du contact');
      throw error;
    }
  }, [companyId, fetchAll]);

  const updateContact = useCallback(async (id: string, updates: Partial<CRMContact>) => {
    try {
      const updateData: any = {};
      if (updates.first_name !== undefined) updateData.first_name = updates.first_name;
      if (updates.last_name !== undefined) updateData.last_name = updates.last_name;
      if (updates.phone !== undefined) updateData.phone = updates.phone || null;
      if (updates.email !== undefined) updateData.email = updates.email || null;
      if (updates.position !== undefined) updateData.position = updates.position || null;
      if (updates.crm_company_id !== undefined) updateData.crm_company_id = updates.crm_company_id || null;
      if (updates.tags !== undefined) updateData.tags = updates.tags || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      // Handle aliases
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.function !== undefined) updateData.position = updates.function;
      if (updates.companyId !== undefined) updateData.crm_company_id = updates.companyId || null;

      const { data, error } = await supabase
        .from('crm_contacts')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Contact mis à jour avec succès');
      await fetchAll();
      return mapContactFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du contact');
      throw error;
    }
  }, [companyId, fetchAll]);

  const deleteContact = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Contact supprimé avec succès');
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du contact');
      throw error;
    }
  }, [companyId, fetchAll]);

  // Company methods
  const createCompany = useCallback(async (companyData: Partial<CRMCompany> & { taxNumber?: string; salesRepId?: string }) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('crm_companies')
        .insert({
          name: companyData.name || '',
          tax_number: companyData.tax_number || companyData.taxNumber || null,
          address: companyData.address || null,
          phone: companyData.phone || null,
          email: companyData.email || null,
          sector: companyData.sector || null,
          sales_rep_id: companyData.sales_rep_id || companyData.salesRepId || null,
          website: companyData.website || null,
          status: companyData.status || 'prospect',
          notes: companyData.notes || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Société créée avec succès');
      await fetchAll();
      return mapCompanyFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la société');
      throw error;
    }
  }, [companyId, fetchAll]);

  const updateCompany = useCallback(async (id: string, updates: Partial<CRMCompany>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.tax_number !== undefined) updateData.tax_number = updates.tax_number || null;
      if (updates.address !== undefined) updateData.address = updates.address || null;
      if (updates.phone !== undefined) updateData.phone = updates.phone || null;
      if (updates.email !== undefined) updateData.email = updates.email || null;
      if (updates.sector !== undefined) updateData.sector = updates.sector || null;
      if (updates.sales_rep_id !== undefined) updateData.sales_rep_id = updates.sales_rep_id || null;
      if (updates.website !== undefined) updateData.website = updates.website || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;

      // Handle aliases
      if (updates.taxNumber !== undefined) updateData.tax_number = updates.taxNumber || null;
      if (updates.salesRepId !== undefined) updateData.sales_rep_id = updates.salesRepId || null;

      const { data, error } = await supabase
        .from('crm_companies')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Société mise à jour avec succès');
      await fetchAll();
      return mapCompanyFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de la société');
      throw error;
    }
  }, [companyId, fetchAll]);

  const deleteCompany = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_companies')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Société supprimée avec succès');
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de la société');
      throw error;
    }
  }, [companyId, fetchAll]);

  // Opportunity methods
  const createOpportunity = useCallback(async (opportunityData: Partial<CRMOpportunity> & { name: string; companyId?: string; contactId?: string; estimatedAmount?: number; expectedCloseDate?: string; salesRepId?: string; quoteId?: string }) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('crm_opportunities')
        .insert({
          name: opportunityData.name,
          crm_company_id: opportunityData.crm_company_id || opportunityData.companyId || '',
          crm_contact_id: opportunityData.crm_contact_id || opportunityData.contactId || null,
          estimated_amount: opportunityData.estimated_amount || opportunityData.estimatedAmount || 0,
          probability: opportunityData.probability || 50,
          expected_close_date: opportunityData.expected_close_date || opportunityData.expectedCloseDate || null,
          sales_rep_id: opportunityData.sales_rep_id || opportunityData.salesRepId || null,
          stage: opportunityData.stage || 'new',
          status: opportunityData.status || 'active',
          quote_id: opportunityData.quote_id || opportunityData.quoteId || null,
          description: opportunityData.description || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Opportunité créée avec succès');
      await fetchAll();
      return mapOpportunityFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'opportunité');
      throw error;
    }
  }, [companyId, fetchAll]);

  const updateOpportunity = useCallback(async (id: string, updates: Partial<CRMOpportunity>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.crm_company_id !== undefined) updateData.crm_company_id = updates.crm_company_id;
      if (updates.crm_contact_id !== undefined) updateData.crm_contact_id = updates.crm_contact_id || null;
      if (updates.estimated_amount !== undefined) updateData.estimated_amount = updates.estimated_amount;
      if (updates.probability !== undefined) updateData.probability = updates.probability;
      if (updates.expected_close_date !== undefined) updateData.expected_close_date = updates.expected_close_date || null;
      if (updates.sales_rep_id !== undefined) updateData.sales_rep_id = updates.sales_rep_id || null;
      if (updates.stage !== undefined) updateData.stage = updates.stage;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.quote_id !== undefined) updateData.quote_id = updates.quote_id || null;
      if (updates.description !== undefined) updateData.description = updates.description || null;

      // Handle aliases
      if (updates.companyId !== undefined) updateData.crm_company_id = updates.companyId;
      if (updates.contactId !== undefined) updateData.crm_contact_id = updates.contactId || null;
      if (updates.estimatedAmount !== undefined) updateData.estimated_amount = updates.estimatedAmount;
      if (updates.expectedCloseDate !== undefined) updateData.expected_close_date = updates.expectedCloseDate || null;
      if (updates.salesRepId !== undefined) updateData.sales_rep_id = updates.salesRepId || null;
      if (updates.quoteId !== undefined) updateData.quote_id = updates.quoteId || null;

      const { data, error } = await supabase
        .from('crm_opportunities')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Opportunité mise à jour avec succès');
      await fetchAll();
      return mapOpportunityFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'opportunité');
      throw error;
    }
  }, [companyId, fetchAll]);

  const deleteOpportunity = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_opportunities')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Opportunité supprimée avec succès');
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de l\'opportunité');
      throw error;
    }
  }, [companyId, fetchAll]);

  const markOpportunityWon = useCallback(async (id: string) => {
    return updateOpportunity(id, { status: 'won', stage: 'won' });
  }, [updateOpportunity]);

  const markOpportunityLost = useCallback(async (id: string) => {
    return updateOpportunity(id, { status: 'lost', stage: 'lost' });
  }, [updateOpportunity]);

  // Activity methods
  const createActivity = useCallback(async (activityData: Partial<CRMActivity> & { type: 'call' | 'meeting' | 'email' | 'task'; subject: string; date: string; completed?: boolean; contactId?: string; companyId?: string; opportunityId?: string; salesRepId?: string }) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('crm_activities')
        .insert({
          type: activityData.type,
          subject: activityData.subject,
          crm_contact_id: activityData.crm_contact_id || activityData.contactId || null,
          crm_company_id: activityData.crm_company_id || activityData.companyId || null,
          crm_opportunity_id: activityData.crm_opportunity_id || activityData.opportunityId || null,
          date: activityData.date,
          time: activityData.time || null,
          duration: activityData.duration || null,
          sales_rep_id: activityData.sales_rep_id || activityData.salesRepId || null,
          description: activityData.description || null,
          completed: activityData.completed || false,
          company_id: companyId,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Activité créée avec succès');
      await fetchAll();
      return mapActivityFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'activité');
      throw error;
    }
  }, [companyId, fetchAll]);

  const updateActivity = useCallback(async (id: string, updates: Partial<CRMActivity>) => {
    try {
      const updateData: any = {};
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.crm_contact_id !== undefined) updateData.crm_contact_id = updates.crm_contact_id || null;
      if (updates.crm_company_id !== undefined) updateData.crm_company_id = updates.crm_company_id || null;
      if (updates.crm_opportunity_id !== undefined) updateData.crm_opportunity_id = updates.crm_opportunity_id || null;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.time !== undefined) updateData.time = updates.time || null;
      if (updates.duration !== undefined) updateData.duration = updates.duration || null;
      if (updates.sales_rep_id !== undefined) updateData.sales_rep_id = updates.sales_rep_id || null;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      // Handle aliases
      if (updates.contactId !== undefined) updateData.crm_contact_id = updates.contactId || null;
      if (updates.companyId !== undefined) updateData.crm_company_id = updates.companyId || null;
      if (updates.opportunityId !== undefined) updateData.crm_opportunity_id = updates.opportunityId || null;
      if (updates.salesRepId !== undefined) updateData.sales_rep_id = updates.salesRepId || null;

      const { data, error } = await supabase
        .from('crm_activities')
        .update(updateData)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Activité mise à jour avec succès');
      await fetchAll();
      return mapActivityFromDB(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'activité');
      throw error;
    }
  }, [companyId, fetchAll]);

  const deleteActivity = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_activities')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      toast.success('Activité supprimée avec succès');
      await fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression de l\'activité');
      throw error;
    }
  }, [companyId, fetchAll]);

  // Helper methods
  const getContactsByCompany = useCallback((companyId: string): CRMContact[] => {
    return contacts.filter(c => c.crm_company_id === companyId || c.companyId === companyId);
  }, [contacts]);

  const getOpportunitiesByCompany = useCallback((companyId: string): CRMOpportunity[] => {
    return opportunities.filter(o => o.crm_company_id === companyId || o.companyId === companyId);
  }, [opportunities]);

  const getActivitiesByContact = useCallback((contactId: string): CRMActivity[] => {
    return activities.filter(a => (a.crm_contact_id === contactId || a.contactId === contactId)).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const getActivitiesByCompany = useCallback((companyId: string): CRMActivity[] => {
    return activities.filter(a => (a.crm_company_id === companyId || a.companyId === companyId)).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const getActivitiesByOpportunity = useCallback((opportunityId: string): CRMActivity[] => {
    return activities.filter(a => (a.crm_opportunity_id === opportunityId || a.opportunityId === opportunityId)).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  // Pipeline calculations
  const getPipelineValue = useCallback((): number => {
    return opportunities
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + (o.estimated_amount * o.probability / 100), 0);
  }, [opportunities]);

  return {
    contacts,
    companies,
    opportunities,
    activities,
    loading,
    createContact,
    updateContact,
    deleteContact,
    createCompany,
    updateCompany,
    deleteCompany,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    markOpportunityWon,
    markOpportunityLost,
    createActivity,
    updateActivity,
    deleteActivity,
    getContactsByCompany,
    getOpportunitiesByCompany,
    getActivitiesByContact,
    getActivitiesByCompany,
    getActivitiesByOpportunity,
    getPipelineValue,
    refresh: fetchAll,
  };
}
