import { useState, useEffect, useCallback } from 'react';
import { Currency, defaultCurrencies } from '@/types/currency';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'bilvoxa_erp_currencies';

export function useCurrency() {
  const { company } = useAuth();
  
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

  // La devise par défaut est déterminée par la company en base de données
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency | null>(() => {
    // Initialiser avec la première devise par défaut
    return defaultCurrencies.find(c => c.isDefault) || defaultCurrencies[0];
  });

  // Synchroniser la devise par défaut avec la company de la base de données
  useEffect(() => {
    if (company?.currency) {
      // Chercher la devise correspondante dans la liste
      const companyCurrency = currencies.find(c => c.code === company.currency);
      if (companyCurrency) {
        setDefaultCurrencyState(companyCurrency);
        // Mettre à jour isDefault dans la liste
        setCurrencies(prev => prev.map(c => ({ ...c, isDefault: c.code === company.currency })));
      }
    }
  }, [company?.currency, currencies.length]);

  // Sauvegarder les devises dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
    }
  }, [currencies]);

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
    if (defaultCurrency?.id === id) {
      setDefaultCurrencyState(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [defaultCurrency]);

  const deleteCurrency = useCallback((id: string) => {
    setCurrencies(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // Si on supprime la devise par défaut, définir la première comme défaut
      if (defaultCurrency?.id === id && filtered.length > 0) {
        setDefaultCurrencyState(filtered[0]);
      }
      return filtered;
    });
  }, [defaultCurrency]);

  // Définir une devise comme défaut et mettre à jour la company en base
  const setAsDefault = useCallback(async (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (!currency) return;

    // Mettre à jour localement
    setCurrencies(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    setDefaultCurrencyState(currency);

    // Mettre à jour en base de données si une company existe
    if (company?.id) {
      try {
        const { error } = await supabase
          .from('companies')
          .update({ currency: currency.code })
          .eq('id', company.id);
        
        if (error) {
          console.error('Erreur lors de la mise à jour de la devise:', error);
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la devise:', err);
      }
    }
  }, [currencies, company?.id]);

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
