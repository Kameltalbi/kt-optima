import { useState, useEffect, useCallback } from 'react';
import { Currency, defaultCurrencies } from '@/types/currency';

const STORAGE_KEY = 'bilvoxa_erp_currencies';
const DEFAULT_CURRENCY_KEY = 'bilvoxa_erp_default_currency';

export function useCurrency() {
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

  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(DEFAULT_CURRENCY_KEY);
      if (storedId) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const allCurrencies = JSON.parse(stored);
            return allCurrencies.find((c: Currency) => c.id === storedId) || allCurrencies.find((c: Currency) => c.isDefault) || allCurrencies[0];
          } catch {
            return defaultCurrencies.find(c => c.isDefault) || defaultCurrencies[0];
          }
        }
      }
    }
    return currencies.find(c => c.isDefault) || currencies[0];
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
      if (defaultCurrency) {
        localStorage.setItem(DEFAULT_CURRENCY_KEY, defaultCurrency.id);
      }
    }
  }, [currencies, defaultCurrency]);

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
      setDefaultCurrency(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [defaultCurrency]);

  const deleteCurrency = useCallback((id: string) => {
    setCurrencies(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // Si on supprime la devise par défaut, définir la première comme défaut
      if (defaultCurrency?.id === id && filtered.length > 0) {
        setDefaultCurrency(filtered[0]);
      }
      return filtered;
    });
  }, [defaultCurrency]);

  const setAsDefault = useCallback((id: string) => {
    setCurrencies(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    const currency = currencies.find(c => c.id === id);
    if (currency) {
      setDefaultCurrency(currency);
    }
  }, [currencies]);

  const formatAmount = useCallback((amount: number, currency?: Currency) => {
    const curr = currency || defaultCurrency;
    if (!curr) return amount.toFixed(2);
    
    const formatted = amount.toFixed(curr.decimalPlaces);
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
