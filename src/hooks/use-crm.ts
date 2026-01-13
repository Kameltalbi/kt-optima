import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { CRMContact, CRMCompany, CRMOpportunity, CRMActivity } from '@/types/database';

const STORAGE_PREFIX = 'bilvoxa_erp_crm_';

// Mock data
const mockContacts: CRMContact[] = [
  {
    id: 'contact_1',
    firstName: 'Ahmed',
    lastName: 'Benali',
    phone: '+216 12 345 678',
    email: 'ahmed.benali@techsolutions.tn',
    function: 'Directeur Général',
    companyId: 'company_crm_1',
    tags: ['prospect', 'tech'],
    notes: 'Intéressé par notre solution ERP',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'contact_2',
    firstName: 'Fatima',
    lastName: 'Alaoui',
    phone: '+216 98 765 432',
    email: 'fatima@iexport.tn',
    function: 'Responsable Achats',
    companyId: 'company_crm_2',
    tags: ['client'],
    company_id: '1',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
];

const mockCompanies: CRMCompany[] = [
  {
    id: 'company_crm_1',
    name: 'Tech Solutions SA',
    taxNumber: '12345678',
    address: 'Tunis, Avenue Habib Bourguiba',
    phone: '+216 71 123 456',
    email: 'contact@techsolutions.tn',
    sector: 'Technologie',
    salesRepId: 'user_1',
    website: 'www.techsolutions.tn',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'company_crm_2',
    name: 'Import Export Plus',
    taxNumber: '87654321',
    address: 'Sfax, Zone Industrielle',
    sector: 'Commerce',
    salesRepId: 'user_1',
    company_id: '1',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
];

const mockOpportunities: CRMOpportunity[] = [
  {
    id: 'opp_1',
    name: 'ERP pour Tech Solutions',
    companyId: 'company_crm_1',
    contactId: 'contact_1',
    estimatedAmount: 45000,
    probability: 70,
    expectedCloseDate: '2024-04-30',
    salesRepId: 'user_1',
    stage: 'negotiation',
    status: 'active',
    description: 'Besoin d\'un ERP complet pour gérer leur croissance',
    company_id: '1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'opp_2',
    name: 'Solution Stock pour Import Export',
    companyId: 'company_crm_2',
    contactId: 'contact_2',
    estimatedAmount: 25000,
    probability: 50,
    expectedCloseDate: '2024-05-15',
    salesRepId: 'user_1',
    stage: 'proposal',
    status: 'active',
    company_id: '1',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
];

const mockActivities: CRMActivity[] = [
  {
    id: 'act_1',
    type: 'call',
    subject: 'Appel de suivi - Tech Solutions',
    contactId: 'contact_1',
    companyId: 'company_crm_1',
    opportunityId: 'opp_1',
    date: '2024-03-15',
    time: '14:00',
    duration: 30,
    salesRepId: 'user_1',
    description: 'Discussion sur les besoins ERP',
    completed: true,
    company_id: '1',
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
  },
  {
    id: 'act_2',
    type: 'meeting',
    subject: 'Réunion de présentation',
    companyId: 'company_crm_2',
    opportunityId: 'opp_2',
    date: '2024-03-20',
    time: '10:00',
    duration: 60,
    salesRepId: 'user_1',
    description: 'Présentation de la solution Stock',
    completed: false,
    company_id: '1',
    createdAt: '2024-03-18T10:00:00Z',
    updatedAt: '2024-03-18T10:00:00Z',
  },
];

export function useCRM() {
  const { companyId } = useAuth();

  const [contacts, setContacts] = useState<CRMContact[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}contacts`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: CRMContact) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockContacts.filter(c => c.company_id === companyId) : mockContacts;
        }
      }
    }
    return companyId ? mockContacts.filter(c => c.company_id === companyId) : mockContacts;
  });

  const [companies, setCompanies] = useState<CRMCompany[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}companies`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: CRMCompany) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockCompanies.filter(c => c.company_id === companyId) : mockCompanies;
        }
      }
    }
    return companyId ? mockCompanies.filter(c => c.company_id === companyId) : mockCompanies;
  });

  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}opportunities`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((o: CRMOpportunity) => o.company_id === companyId) : data;
        } catch {
          return companyId ? mockOpportunities.filter(o => o.company_id === companyId) : mockOpportunities;
        }
      }
    }
    return companyId ? mockOpportunities.filter(o => o.company_id === companyId) : mockOpportunities;
  });

  const [activities, setActivities] = useState<CRMActivity[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}activities`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((a: CRMActivity) => a.company_id === companyId) : data;
        } catch {
          return companyId ? mockActivities.filter(a => a.company_id === companyId) : mockActivities;
        }
      }
    }
    return companyId ? mockActivities.filter(a => a.company_id === companyId) : mockActivities;
  });

  // Re-load data when companyId changes
  useEffect(() => {
    if (!companyId) return;

    const loadAndFilter = <T extends { company_id: string }>(
      storageKey: string,
      mockData: T[],
      setter: (data: T[]) => void
    ) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const allData = JSON.parse(stored);
            const filtered = allData.filter((item: T) => item.company_id === companyId);
            setter(filtered);
            return;
          } catch {
            // Fall through to mock data
          }
        }
      }
      const filtered = mockData.filter(item => item.company_id === companyId);
      setter(filtered);
    };

    loadAndFilter(`${STORAGE_PREFIX}contacts`, mockContacts, setContacts);
    loadAndFilter(`${STORAGE_PREFIX}companies`, mockCompanies, setCompanies);
    loadAndFilter(`${STORAGE_PREFIX}opportunities`, mockOpportunities, setOpportunities);
    loadAndFilter(`${STORAGE_PREFIX}activities`, mockActivities, setActivities);
  }, [companyId]);

  // Save functions
  const saveContacts = useCallback((data: CRMContact[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setContacts(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}contacts`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: CRMContact) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveCompanies = useCallback((data: CRMCompany[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setCompanies(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}companies`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: CRMCompany) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}companies`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}companies`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}companies`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveOpportunities = useCallback((data: CRMOpportunity[]) => {
    const filtered = companyId ? data.filter(o => o.company_id === companyId) : data;
    setOpportunities(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}opportunities`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((o: CRMOpportunity) => o.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}opportunities`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}opportunities`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}opportunities`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveActivities = useCallback((data: CRMActivity[]) => {
    const filtered = companyId ? data.filter(a => a.company_id === companyId) : data;
    setActivities(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}activities`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((a: CRMActivity) => a.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}activities`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  // Contact methods
  const createContact = useCallback((contactData: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newContact: CRMContact = {
      ...contactData,
      company_id: companyId,
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveContacts([...contacts, newContact]);
    return newContact;
  }, [contacts, saveContacts, companyId]);

  const updateContact = useCallback((id: string, updates: Partial<CRMContact>) => {
    const updated = contacts.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveContacts(updated);
    return updated.find(c => c.id === id);
  }, [contacts, saveContacts]);

  const deleteContact = useCallback((id: string) => {
    const filtered = contacts.filter(c => c.id !== id);
    saveContacts(filtered);
  }, [contacts, saveContacts]);

  // Company methods
  const createCompany = useCallback((companyData: Omit<CRMCompany, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newCompany: CRMCompany = {
      ...companyData,
      company_id: companyId,
      id: `company_crm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCompanies([...companies, newCompany]);
    return newCompany;
  }, [companies, saveCompanies, companyId]);

  const updateCompany = useCallback((id: string, updates: Partial<CRMCompany>) => {
    const updated = companies.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveCompanies(updated);
    return updated.find(c => c.id === id);
  }, [companies, saveCompanies]);

  const deleteCompany = useCallback((id: string) => {
    const filtered = companies.filter(c => c.id !== id);
    saveCompanies(filtered);
  }, [companies, saveCompanies]);

  // Opportunity methods
  const createOpportunity = useCallback((opportunityData: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newOpportunity: CRMOpportunity = {
      ...opportunityData,
      company_id: companyId,
      id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveOpportunities([...opportunities, newOpportunity]);
    return newOpportunity;
  }, [opportunities, saveOpportunities, companyId]);

  const updateOpportunity = useCallback((id: string, updates: Partial<CRMOpportunity>) => {
    const updated = opportunities.map(o =>
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    saveOpportunities(updated);
    return updated.find(o => o.id === id);
  }, [opportunities, saveOpportunities]);

  const deleteOpportunity = useCallback((id: string) => {
    const filtered = opportunities.filter(o => o.id !== id);
    saveOpportunities(filtered);
  }, [opportunities, saveOpportunities]);

  const markOpportunityWon = useCallback((id: string) => {
    return updateOpportunity(id, { status: 'won', stage: 'won' });
  }, [updateOpportunity]);

  const markOpportunityLost = useCallback((id: string) => {
    return updateOpportunity(id, { status: 'lost', stage: 'lost' });
  }, [updateOpportunity]);

  // Activity methods
  const createActivity = useCallback((activityData: Omit<CRMActivity, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newActivity: CRMActivity = {
      ...activityData,
      company_id: companyId,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveActivities([...activities, newActivity]);
    return newActivity;
  }, [activities, saveActivities, companyId]);

  const updateActivity = useCallback((id: string, updates: Partial<CRMActivity>) => {
    const updated = activities.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    saveActivities(updated);
    return updated.find(a => a.id === id);
  }, [activities, saveActivities]);

  const deleteActivity = useCallback((id: string) => {
    const filtered = activities.filter(a => a.id !== id);
    saveActivities(filtered);
  }, [activities, saveActivities]);

  // Helper methods
  const getContactsByCompany = useCallback((companyId: string): CRMContact[] => {
    return contacts.filter(c => c.companyId === companyId);
  }, [contacts]);

  const getOpportunitiesByCompany = useCallback((companyId: string): CRMOpportunity[] => {
    return opportunities.filter(o => o.companyId === companyId);
  }, [opportunities]);

  const getActivitiesByContact = useCallback((contactId: string): CRMActivity[] => {
    return activities.filter(a => a.contactId === contactId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const getActivitiesByCompany = useCallback((companyId: string): CRMActivity[] => {
    return activities.filter(a => a.companyId === companyId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const getActivitiesByOpportunity = useCallback((opportunityId: string): CRMActivity[] => {
    return activities.filter(a => a.opportunityId === opportunityId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  // Pipeline calculations
  const getPipelineValue = useCallback((): number => {
    return opportunities
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + (o.estimatedAmount * o.probability / 100), 0);
  }, [opportunities]);

  return {
    contacts,
    companies,
    opportunities,
    activities,
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
  };
}
