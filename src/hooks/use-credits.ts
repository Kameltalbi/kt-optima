import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { SupplierCredit, SupplierCreditItem, ClientCredit, ClientCreditItem } from '@/types/database';

const STORAGE_PREFIX = 'bilvoxa_erp_credits_';

// Mock data
const mockSupplierCredits: SupplierCredit[] = [
  {
    id: 'sc_1',
    number: 'AV-FOUR-2024-001',
    supplier_invoice_id: 'si_1',
    supplier_id: 'sup_1',
    date: '2024-03-15',
    type: 'partial',
    reason: 'return',
    subtotal: 1000,
    tax: 190,
    total: 1190,
    status: 'applied',
    stock_impact: true,
    comments: 'Retour marchandise défectueuse',
    company_id: '1',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
];

const mockClientCredits: ClientCredit[] = [
  {
    id: 'cc_1',
    number: 'AV-CLI-2024-001',
    invoice_id: 'inv_1',
    client_id: 'cli_1',
    date: '2024-03-20',
    type: 'partial',
    reason: 'commercial_gesture',
    subtotal: 500,
    tax: 95,
    total: 595,
    status: 'applied',
    stock_impact: false,
    refund_method: 'future_invoice',
    comments: 'Geste commercial',
    company_id: '1',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

export function useCredits() {
  const { companyId } = useAuth();

  const [supplierCredits, setSupplierCredits] = useState<SupplierCredit[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}supplier`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: SupplierCredit) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockSupplierCredits.filter(c => c.company_id === companyId) : mockSupplierCredits;
        }
      }
    }
    return companyId ? mockSupplierCredits.filter(c => c.company_id === companyId) : mockSupplierCredits;
  });

  const [clientCredits, setClientCredits] = useState<ClientCredit[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}client`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: ClientCredit) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockClientCredits.filter(c => c.company_id === companyId) : mockClientCredits;
        }
      }
    }
    return companyId ? mockClientCredits.filter(c => c.company_id === companyId) : mockClientCredits;
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

    loadAndFilter(`${STORAGE_PREFIX}supplier`, mockSupplierCredits, setSupplierCredits);
    loadAndFilter(`${STORAGE_PREFIX}client`, mockClientCredits, setClientCredits);
  }, [companyId]);

  // Save functions
  const saveSupplierCredits = useCallback((data: SupplierCredit[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setSupplierCredits(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}supplier`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: SupplierCredit) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}supplier`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}supplier`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}supplier`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveClientCredits = useCallback((data: ClientCredit[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setClientCredits(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}client`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: ClientCredit) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}client`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}client`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}client`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  // Supplier Credit methods
  const createSupplierCredit = useCallback((
    creditData: Omit<SupplierCredit, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'company_id'>
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const creditNumber = `AV-FOUR-${new Date().getFullYear()}-${String(supplierCredits.length + 1).padStart(3, '0')}`;
    const newCredit: SupplierCredit = {
      ...creditData,
      number: creditNumber,
      company_id: companyId,
      id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSupplierCredits([...supplierCredits, newCredit]);
    return newCredit;
  }, [supplierCredits, saveSupplierCredits, companyId]);

  const updateSupplierCredit = useCallback((id: string, updates: Partial<SupplierCredit>) => {
    const updated = supplierCredits.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveSupplierCredits(updated);
    return updated.find(c => c.id === id);
  }, [supplierCredits, saveSupplierCredits]);

  const applySupplierCredit = useCallback((id: string) => {
    // Appliquer l'avoir = mettre à jour le solde fournisseur et l'échéancier
    const credit = supplierCredits.find(c => c.id === id);
    if (!credit) return null;
    
    // En production, ici on mettrait à jour :
    // - Le solde du fournisseur (supplier.balance -= credit.total)
    // - L'échéancier (payment_schedules)
    // - Les écritures comptables
    
    return updateSupplierCredit(id, { status: 'applied' });
  }, [supplierCredits, updateSupplierCredit]);

  // Client Credit methods
  const createClientCredit = useCallback(async (
    creditData: Omit<ClientCredit, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'company_id'>,
    numero?: string
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    
    // Utiliser le numéro fourni ou générer un nouveau via la séquence unifiée
    let creditNumber = numero;
    if (!creditNumber || creditNumber.trim() === '') {
      const { getNextDocumentNumber } = await import('./use-document-numbering');
      creditNumber = await getNextDocumentNumber('avoir', creditData.date);
    }
    
    const newCredit: ClientCredit = {
      ...creditData,
      number: creditNumber,
      company_id: companyId,
      id: `cc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveClientCredits([...clientCredits, newCredit]);
    return newCredit;
  }, [clientCredits, saveClientCredits, companyId]);

  const updateClientCredit = useCallback((id: string, updates: Partial<ClientCredit>) => {
    const updated = clientCredits.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveClientCredits(updated);
    return updated.find(c => c.id === id);
  }, [clientCredits, saveClientCredits]);

  const applyClientCredit = useCallback((id: string) => {
    // Appliquer l'avoir = mettre à jour le solde client
    const credit = clientCredits.find(c => c.id === id);
    if (!credit) return null;
    
    // En production, ici on mettrait à jour :
    // - Le solde du client (client.balance -= credit.total)
    // - Si refund_method = 'future_invoice', on crée une note de crédit
    // - Si refund_method = 'cash_refund', on crée une transaction trésorerie
    
    return updateClientCredit(id, { status: 'applied' });
  }, [clientCredits, updateClientCredit]);

  const refundClientCredit = useCallback((id: string) => {
    // Rembourser l'avoir = créer une transaction trésorerie
    const credit = clientCredits.find(c => c.id === id);
    if (!credit || credit.status !== 'applied') return null;
    
    // En production, ici on créerait :
    // - Une transaction trésorerie (sortie de fonds)
    // - Une écriture comptable
    
    return updateClientCredit(id, { status: 'refunded' });
  }, [clientCredits, updateClientCredit]);

  return {
    supplierCredits,
    clientCredits,
    createSupplierCredit,
    updateSupplierCredit,
    applySupplierCredit,
    createClientCredit,
    updateClientCredit,
    applyClientCredit,
    refundClientCredit,
  };
}
