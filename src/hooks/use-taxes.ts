import { useState, useEffect, useCallback } from 'react';

export interface Tax {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // Pourcentage (ex: 19) ou montant fixe
  enabled: boolean;
  isDefault?: boolean;
}

const STORAGE_KEY = 'bilvoxa_erp_taxes';

const defaultTaxes: Tax[] = [
  {
    id: 'tva_default',
    name: 'TVA',
    type: 'percentage',
    value: 19, // 19%
    enabled: true,
    isDefault: true,
  },
];

export function useTaxes() {
  const [taxes, setTaxes] = useState<Tax[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultTaxes;
        }
      }
    }
    return defaultTaxes;
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taxes));
    }
  }, [taxes]);

  const addTax = useCallback((tax: Omit<Tax, 'id'>) => {
    const newTax: Tax = {
      ...tax,
      id: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setTaxes(prev => [...prev, newTax]);
    return newTax;
  }, []);

  const updateTax = useCallback((id: string, updates: Partial<Tax>) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTax = useCallback((id: string) => {
    setTaxes(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTax = useCallback((id: string) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }, []);

  const getEnabledTaxes = useCallback(() => {
    return taxes.filter(t => t.enabled);
  }, [taxes]);

  const calculateTax = useCallback((amount: number, tax: Tax): number => {
    if (tax.type === 'percentage') {
      return (amount * tax.value) / 100;
    }
    return tax.value;
  }, []);

  return {
    taxes,
    enabledTaxes: getEnabledTaxes(),
    addTax,
    updateTax,
    deleteTax,
    toggleTax,
    calculateTax,
  };
}
