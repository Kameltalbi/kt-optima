import { useState, useEffect, useCallback } from 'react';
import { Currency, defaultCurrencies } from '@/types/currency';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'bilvoxa_erp_currencies';
const DEFAULT_CURRENCY_CODE_KEY = 'bilvoxa_erp_default_currency_code';

interface UseCurrencyOptions {
  companyId?: string;
  companyCurrency?: string;
}

export function useCurrency(options?: UseCurrencyOptions) {
  const { companyId, companyCurrency } = options || {};
  
  const [currencies, setCurrencies] = useState<Currency[]>(() => {
    // Charger depuis localStorage ou utiliser les devises par défaut
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultCurrencies;
        }
      }
    }
    return defaultCurrencies;
  });

  // Charger le code de devise par défaut depuis localStorage ou company
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState<string>(() => {
    if (companyCurrency) return companyCurrency;
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem(DEFAULT_CURRENCY_CODE_KEY);
      if (storedCode) return storedCode;
    }
    return 'TND'; // Devise par défaut
  });

  // Calculer la devise par défaut à partir du code
  const defaultCurrency = currencies.find(c => c.code === defaultCurrencyCode) || 
                          currencies.find(c => c.isDefault) || 
                          currencies[0];

  // Synchroniser avec la company si fournie
  useEffect(() => {
    if (companyCurrency && companyCurrency !== defaultCurrencyCode) {
      setDefaultCurrencyCode(companyCurrency);
    }
  }, [companyCurrency]);

  // Sauvegarder les devises et le code par défaut dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
      localStorage.setItem(DEFAULT_CURRENCY_CODE_KEY, defaultCurrencyCode);
    }
  }, [currencies, defaultCurrencyCode]);

  // Mettre à jour isDefault dans la liste quand le code change
  useEffect(() => {
    setCurrencies(prev => {
      const hasChange = prev.some(c => 
        (c.code === defaultCurrencyCode && !c.isDefault) || 
        (c.code !== defaultCurrencyCode && c.isDefault)
      );
      if (hasChange) {
        return prev.map(c => ({ ...c, isDefault: c.code === defaultCurrencyCode }));
      }
      return prev;
    });
  }, [defaultCurrencyCode]);

  const addCurrency = useCallback((currency: Omit<Currency, 'id' | 'isDefault'>) => {
    const newCurrency: Currency = {
      ...currency,
      id: `currency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isDefault: false,
    };
    setCurrencies(prev => [...prev, newCurrency]);
    return newCurrency;
  }, []);

  const updateCurrency = useCallback((id: string, updates: Partial<Currency>) => {
    setCurrencies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCurrency = useCallback((id: string) => {
    setCurrencies(prev => {
      const toDelete = prev.find(c => c.id === id);
      const filtered = prev.filter(c => c.id !== id);
      // Si on supprime la devise par défaut, définir la première comme défaut
      if (toDelete?.code === defaultCurrencyCode && filtered.length > 0) {
        setDefaultCurrencyCode(filtered[0].code);
      }
      return filtered;
    });
  }, [defaultCurrencyCode]);

  // Définir une devise comme défaut et mettre à jour la company en base
  const setAsDefault = useCallback(async (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (!currency) return;

    // Mettre à jour localement
    setDefaultCurrencyCode(currency.code);

    // Mettre à jour en base de données si un companyId est fourni
    if (companyId) {
      try {
        const { error } = await supabase
          .from('companies')
          .update({ currency: currency.code })
          .eq('id', companyId);
        
        if (error) {
          console.error('Erreur lors de la mise à jour de la devise:', error);
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la devise:', err);
      }
    }
  }, [currencies, companyId]);

  const formatAmount = useCallback((amount: number, currency?: Currency) => {
    const curr = currency || defaultCurrency;
    if (!curr) return amount.toFixed(2);
    
    const formatted = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: curr.decimalPlaces,
      maximumFractionDigits: curr.decimalPlaces,
    });
    
    if (curr.symbolPosition === 'before') {
      return `${curr.symbol}${formatted}`;
    }
    return `${formatted} ${curr.symbol}`;
  }, [defaultCurrency]);

  return {
    currencies,
    defaultCurrency,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    setAsDefault,
    formatAmount,
    formatCurrency: formatAmount, // Alias for backward compatibility
  };
}
