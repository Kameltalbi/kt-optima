import { useState, useEffect, useCallback } from 'react';

// Types
export interface AccountingAccount {
  id: string;
  numero: string;
  intitule: string;
  type: 'actif' | 'passif' | 'charge' | 'produit' | 'tresorerie';
  nature: 'debit' | 'credit';
}

export interface AccountingEntryLine {
  compteNumero: string;
  compteIntitule: string;
  libelle: string;
  debit: number;
  credit: number;
}

export interface AccountingEntry {
  id: string;
  numero: string;
  date: string;
  journal: string;
  libelle: string;
  lignes: AccountingEntryLine[];
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
  origine: 'automatique' | 'manuel';
  origineDocument?: string;
  origineType?: string;
  valide: boolean;
}

export interface AccountingConfig {
  enabled: boolean;
  accounts: {
    fournisseurs: string; // 401000
    clients: string; // 411000
    banque: string; // 512000
    caisse: string; // 531000
    tvaDeductible: string; // 345500
    tvaCollectee: string; // 445700
    achats: string; // 60xxx
    ventes: string; // 70xxx
    salaires: string; // 641000
    cnss: string; // 431000
    irpp: string; // 444000
    organismesSociaux: string; // 431000
  };
}

const STORAGE_KEY = 'bilvoxa_erp_accounting_config';
const ENTRIES_STORAGE_KEY = 'bilvoxa_erp_accounting_entries';

const defaultConfig: AccountingConfig = {
  enabled: true,
  accounts: {
    fournisseurs: '401000',
    clients: '411000',
    banque: '512000',
    caisse: '531000',
    tvaDeductible: '345500',
    tvaCollectee: '445700',
    achats: '601000',
    ventes: '701000',
    salaires: '641000',
    cnss: '431000',
    irpp: '444000',
    organismesSociaux: '431000',
  },
};

// Mock accounts pour le PCG tunisien
const mockAccounts: AccountingAccount[] = [
  { id: '401000', numero: '401000', intitule: 'Fournisseurs locaux', type: 'passif', nature: 'credit' },
  { id: '411000', numero: '411000', intitule: 'Clients locaux', type: 'actif', nature: 'debit' },
  { id: '512000', numero: '512000', intitule: 'Banque principale', type: 'tresorerie', nature: 'debit' },
  { id: '531000', numero: '531000', intitule: 'Caisse', type: 'tresorerie', nature: 'debit' },
  { id: '345500', numero: '345500', intitule: 'TVA déductible', type: 'actif', nature: 'debit' },
  { id: '445700', numero: '445700', intitule: 'TVA collectée', type: 'passif', nature: 'credit' },
  { id: '601000', numero: '601000', intitule: 'Achats de marchandises', type: 'charge', nature: 'debit' },
  { id: '701000', numero: '701000', intitule: 'Ventes de marchandises', type: 'produit', nature: 'credit' },
  { id: '641000', numero: '641000', intitule: 'Salaires', type: 'charge', nature: 'debit' },
  { id: '431000', numero: '431000', intitule: 'Organismes sociaux', type: 'passif', nature: 'credit' },
  { id: '444000', numero: '444000', intitule: 'État - Impôts et taxes', type: 'passif', nature: 'credit' },
];

export function useAccounting() {
  const [config, setConfig] = useState<AccountingConfig>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultConfig;
        }
      }
    }
    return defaultConfig;
  });

  const [entries, setEntries] = useState<AccountingEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ENTRIES_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries]);

  const getAccount = useCallback((numero: string): AccountingAccount | undefined => {
    return mockAccounts.find(a => a.numero === numero);
  }, []);

  const generateEntryFromSupplierInvoice = useCallback((
    invoiceNumber: string,
    date: string,
    supplierName: string,
    amountHT: number,
    amountTVA: number,
    amountTTC: number
  ): AccountingEntry | null => {
    if (!config.enabled) return null;

    const lignes: AccountingEntryLine[] = [
      {
        compteNumero: config.accounts.achats,
        compteIntitule: getAccount(config.accounts.achats)?.intitule || 'Achats',
        libelle: `Facture fournisseur ${invoiceNumber}`,
        debit: amountHT,
        credit: 0,
      },
      {
        compteNumero: config.accounts.tvaDeductible,
        compteIntitule: getAccount(config.accounts.tvaDeductible)?.intitule || 'TVA déductible',
        libelle: `Facture fournisseur ${invoiceNumber}`,
        debit: amountTVA,
        credit: 0,
      },
      {
        compteNumero: config.accounts.fournisseurs,
        compteIntitule: getAccount(config.accounts.fournisseurs)?.intitule || 'Fournisseurs',
        libelle: `Facture fournisseur ${invoiceNumber} - ${supplierName}`,
        debit: 0,
        credit: amountTTC,
      },
    ];

    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      numero: `ECR-${date.replace(/-/g, '')}-${String(entries.length + 1).padStart(3, '0')}`,
      date,
      journal: 'Achats',
      libelle: `Facture fournisseur ${invoiceNumber} - ${supplierName}`,
      lignes,
      totalDebit,
      totalCredit,
      equilibre: totalDebit === totalCredit,
      origine: 'automatique',
      origineDocument: invoiceNumber,
      origineType: 'Facture fournisseur',
      valide: true,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  }, [config, entries.length, getAccount]);

  const generateEntryFromSupplierPayment = useCallback((
    invoiceNumber: string,
    date: string,
    supplierName: string,
    amount: number,
    paymentMethod: 'bank' | 'cash'
  ): AccountingEntry | null => {
    if (!config.enabled) return null;

    const compteTresorerie = paymentMethod === 'bank' ? config.accounts.banque : config.accounts.caisse;

    const lignes: AccountingEntryLine[] = [
      {
        compteNumero: config.accounts.fournisseurs,
        compteIntitule: getAccount(config.accounts.fournisseurs)?.intitule || 'Fournisseurs',
        libelle: `Paiement facture ${invoiceNumber} - ${supplierName}`,
        debit: amount,
        credit: 0,
      },
      {
        compteNumero: compteTresorerie,
        compteIntitule: getAccount(compteTresorerie)?.intitule || (paymentMethod === 'bank' ? 'Banque' : 'Caisse'),
        libelle: `Paiement facture ${invoiceNumber}`,
        debit: 0,
        credit: amount,
      },
    ];

    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      numero: `ECR-${date.replace(/-/g, '')}-${String(entries.length + 1).padStart(3, '0')}`,
      date,
      journal: 'Banque',
      libelle: `Paiement facture fournisseur ${invoiceNumber} - ${supplierName}`,
      lignes,
      totalDebit,
      totalCredit,
      equilibre: totalDebit === totalCredit,
      origine: 'automatique',
      origineDocument: invoiceNumber,
      origineType: 'Paiement fournisseur',
      valide: true,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  }, [config, entries.length, getAccount]);

  const generateEntryFromClientInvoice = useCallback((
    invoiceNumber: string,
    date: string,
    clientName: string,
    amountHT: number,
    amountTVA: number,
    amountTTC: number
  ): AccountingEntry | null => {
    if (!config.enabled) return null;

    const lignes: AccountingEntryLine[] = [
      {
        compteNumero: config.accounts.clients,
        compteIntitule: getAccount(config.accounts.clients)?.intitule || 'Clients',
        libelle: `Facture client ${invoiceNumber} - ${clientName}`,
        debit: amountTTC,
        credit: 0,
      },
      {
        compteNumero: config.accounts.ventes,
        compteIntitule: getAccount(config.accounts.ventes)?.intitule || 'Ventes',
        libelle: `Facture client ${invoiceNumber}`,
        debit: 0,
        credit: amountHT,
      },
      {
        compteNumero: config.accounts.tvaCollectee,
        compteIntitule: getAccount(config.accounts.tvaCollectee)?.intitule || 'TVA collectée',
        libelle: `Facture client ${invoiceNumber}`,
        debit: 0,
        credit: amountTVA,
      },
    ];

    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      numero: `ECR-${date.replace(/-/g, '')}-${String(entries.length + 1).padStart(3, '0')}`,
      date,
      journal: 'Ventes',
      libelle: `Facture client ${invoiceNumber} - ${clientName}`,
      lignes,
      totalDebit,
      totalCredit,
      equilibre: totalDebit === totalCredit,
      origine: 'automatique',
      origineDocument: invoiceNumber,
      origineType: 'Facture client',
      valide: true,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  }, [config, entries.length, getAccount]);

  const generateEntryFromClientPayment = useCallback((
    invoiceNumber: string,
    date: string,
    clientName: string,
    amount: number,
    paymentMethod: 'bank' | 'cash'
  ): AccountingEntry | null => {
    if (!config.enabled) return null;

    const compteTresorerie = paymentMethod === 'bank' ? config.accounts.banque : config.accounts.caisse;

    const lignes: AccountingEntryLine[] = [
      {
        compteNumero: compteTresorerie,
        compteIntitule: getAccount(compteTresorerie)?.intitule || (paymentMethod === 'bank' ? 'Banque' : 'Caisse'),
        libelle: `Encaissement facture ${invoiceNumber}`,
        debit: amount,
        credit: 0,
      },
      {
        compteNumero: config.accounts.clients,
        compteIntitule: getAccount(config.accounts.clients)?.intitule || 'Clients',
        libelle: `Encaissement facture ${invoiceNumber} - ${clientName}`,
        debit: 0,
        credit: amount,
      },
    ];

    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      numero: `ECR-${date.replace(/-/g, '')}-${String(entries.length + 1).padStart(3, '0')}`,
      date,
      journal: 'Banque',
      libelle: `Encaissement facture client ${invoiceNumber} - ${clientName}`,
      lignes,
      totalDebit,
      totalCredit,
      equilibre: totalDebit === totalCredit,
      origine: 'automatique',
      origineDocument: invoiceNumber,
      origineType: 'Encaissement client',
      valide: true,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  }, [config, entries.length, getAccount]);

  const generateEntryFromPayroll = useCallback((
    period: string,
    date: string,
    employeeId: string,
    salaryBrut: number,
    cotisations: { cnss: number; assurance: number; retraite: number; autres: number },
    retenues: { irpp: number; autres: number },
    netAPayer: number
  ): AccountingEntry | null => {
    if (!config.enabled) return null;

    const totalCotisations = cotisations.cnss + cotisations.assurance + cotisations.retraite + cotisations.autres;
    const totalRetenues = retenues.irpp + retenues.autres;

    const lignes: AccountingEntryLine[] = [
      {
        compteNumero: config.accounts.salaires,
        compteIntitule: getAccount(config.accounts.salaires)?.intitule || 'Salaires',
        libelle: `Paie ${period} - Employé ${employeeId}`,
        debit: salaryBrut,
        credit: 0,
      },
      {
        compteNumero: config.accounts.organismesSociaux,
        compteIntitule: getAccount(config.accounts.organismesSociaux)?.intitule || 'Organismes sociaux',
        libelle: `Cotisations sociales ${period} - CNSS, Assurance, Retraite`,
        debit: 0,
        credit: totalCotisations,
      },
      {
        compteNumero: config.accounts.irpp,
        compteIntitule: getAccount(config.accounts.irpp)?.intitule || 'IRPP',
        libelle: `IRPP ${period}`,
        debit: 0,
        credit: retenues.irpp,
      },
      {
        compteNumero: config.accounts.banque,
        compteIntitule: getAccount(config.accounts.banque)?.intitule || 'Banque',
        libelle: `Paiement salaire net ${period} - Employé ${employeeId}`,
        debit: 0,
        credit: netAPayer,
      },
    ];

    const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0);

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      numero: `ECR-${date.replace(/-/g, '')}-${String(entries.length + 1).padStart(3, '0')}`,
      date,
      journal: 'Paie',
      libelle: `Paie ${period} - Employé ${employeeId}`,
      lignes,
      totalDebit,
      totalCredit,
      equilibre: totalDebit === totalCredit,
      origine: 'automatique',
      origineDocument: `PAIE-${period}`,
      origineType: 'Paie',
      valide: true,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  }, [config, entries.length, getAccount]);

  const updateConfig = useCallback((updates: Partial<AccountingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    config,
    entries,
    updateConfig,
    generateEntryFromSupplierInvoice,
    generateEntryFromSupplierPayment,
    generateEntryFromClientInvoice,
    generateEntryFromClientPayment,
    generateEntryFromPayroll,
    getAccount,
  };
}
