import { useState, useCallback, useMemo } from 'react';
import { useAccounting } from './use-accounting';
import { useAuth } from '@/contexts/AuthContext';
import type {
  HREmployee,
  HRContract,
  Payroll,
  Leave,
  LeaveBalance,
  HRDocument,
  Evaluation,
  EvaluationCampaign,
} from '@/types/database';

const STORAGE_PREFIX = 'bilvoxa_erp_hr_';

// Mock data
const mockEmployees: HREmployee[] = [
  {
    id: '1',
    matricule: 'EMP001',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'ahmed.benali@company.tn',
    phone: '+216 12 345 678',
    address: 'Tunis, Tunisie',
    dateOfBirth: '1985-05-15',
    cin: '12345678',
    position: 'Développeur Senior',
    department: 'IT',
    hireDate: '2020-01-15',
    status: 'active',
    company_id: '1',
    createdAt: '2020-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    matricule: 'EMP002',
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    email: 'fatma.trabelsi@company.tn',
    phone: '+216 98 765 432',
    address: 'Sfax, Tunisie',
    dateOfBirth: '1990-08-22',
    cin: '87654321',
    position: 'Comptable',
    department: 'Finance',
    hireDate: '2021-03-10',
    status: 'active',
    managerId: '3',
    company_id: '1',
    createdAt: '2021-03-10',
    updatedAt: '2024-01-15',
  },
  {
    id: '3',
    matricule: 'EMP003',
    firstName: 'Mohamed',
    lastName: 'Khelifi',
    email: 'mohamed.khelifi@company.tn',
    phone: '+216 11 222 333',
    address: 'Tunis, Tunisie',
    dateOfBirth: '1980-12-05',
    cin: '11223344',
    position: 'Directeur Financier',
    department: 'Finance',
    hireDate: '2018-06-01',
    status: 'active',
    company_id: '1',
    createdAt: '2018-06-01',
    updatedAt: '2024-01-15',
  },
];

const mockContracts: HRContract[] = [
  {
    id: '1',
    employee_id: '1',
    type: 'cdi',
    startDate: '2020-01-15',
    salary: 3500,
    position: 'Développeur Senior',
    department: 'IT',
    status: 'active',
    company_id: '1',
    createdAt: '2020-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    employee_id: '2',
    type: 'cdi',
    startDate: '2021-03-10',
    salary: 2800,
    position: 'Comptable',
    department: 'Finance',
    status: 'active',
    company_id: '1',
    createdAt: '2021-03-10',
    updatedAt: '2024-01-15',
  },
  {
    id: '3',
    employee_id: '3',
    type: 'cdi',
    startDate: '2018-06-01',
    salary: 6500,
    position: 'Directeur Financier',
    department: 'Finance',
    status: 'active',
    company_id: '1',
    createdAt: '2018-06-01',
    updatedAt: '2024-01-15',
  },
];

const mockPayrolls: Payroll[] = [
  {
    id: '1',
    employee_id: '1',
    contract_id: '1',
    period: '2024-01',
    date: '2024-01-31',
    salaryBrut: 3500,
    cotisations: {
      cnss: 350,
      assurance: 105,
      retraite: 175,
      autres: 0,
    },
    retenues: {
      irpp: 420,
      autres: 0,
    },
    avantages: {
      prime: 500,
      indemnites: 200,
      autres: 0,
    },
    netAPayer: 3150,
    statut: 'validated',
    bulletinGenerated: true,
    company_id: '1',
    createdAt: '2024-01-31',
    updatedAt: '2024-01-31',
  },
];

const mockLeaves: Leave[] = [
  {
    id: '1',
    employee_id: '1',
    type: 'annual',
    startDate: '2024-07-01',
    endDate: '2024-07-15',
    days: 15,
    status: 'approved',
    requestedDate: '2024-06-01',
    approvedBy: '3',
    approvedDate: '2024-06-02',
    company_id: '1',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-02',
  },
];

const mockLeaveBalances: LeaveBalance[] = [
  {
    id: '1',
    employee_id: '1',
    year: 2024,
    annualTotal: 25,
    annualUsed: 5,
    annualRemaining: 20,
    sickTotal: 30,
    sickUsed: 2,
    sickRemaining: 28,
    company_id: '1',
    updatedAt: '2024-01-15',
  },
];

const mockDocuments: HRDocument[] = [
  {
    id: '1',
    employee_id: '1',
    name: 'Contrat de travail',
    type: 'contract',
    category: 'administrative',
    filePath: '/documents/hr/contract_1.pdf',
    fileName: 'contract_1.pdf',
    fileSize: 245760,
    mimeType: 'application/pdf',
    uploadedBy: 'admin',
    uploadedDate: '2020-01-15',
    accessLevel: 'hr',
    company_id: '1',
    createdAt: '2020-01-15',
    updatedAt: '2020-01-15',
  },
];

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    employee_id: '1',
    campaignId: '1',
    campaignName: 'Évaluation annuelle 2023',
    period: '2023',
    evaluatorId: '3',
    evaluatorName: 'Mohamed Khelifi',
    date: '2023-12-15',
    objectives: [
      {
        id: '1',
        description: 'Développer 3 nouvelles fonctionnalités',
        target: '3 fonctionnalités',
        achievement: '3 fonctionnalités complétées',
        rating: 5,
      },
    ],
    competencies: [
      {
        id: '1',
        name: 'Compétences techniques',
        rating: 5,
        comment: 'Excellent niveau technique',
      },
    ],
    overallRating: 5,
    strengths: ['Très compétent techniquement', 'Autonome'],
    areasForImprovement: ['Communication inter-équipes'],
    comments: 'Excellent travail cette année',
    status: 'validated',
    validatedBy: '3',
    validatedDate: '2023-12-20',
    company_id: '1',
    createdAt: '2023-12-15',
    updatedAt: '2023-12-20',
  },
];

const mockCampaigns: EvaluationCampaign[] = [
  {
    id: '1',
    name: 'Évaluation annuelle 2023',
    period: '2023',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    status: 'completed',
    company_id: '1',
    createdAt: '2023-11-15',
    updatedAt: '2023-12-31',
  },
];

export function useHR() {
  const { generateEntryFromPayroll, config: accountingConfig } = useAccounting();
  const { companyId } = useAuth();
  
  const [employees, setEmployees] = useState<HREmployee[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}employees`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Filtrer par company_id si disponible
          return companyId ? data.filter((e: HREmployee) => e.company_id === companyId) : data;
        } catch {
          return companyId ? mockEmployees.filter(e => e.company_id === companyId) : mockEmployees;
        }
      }
    }
    return companyId ? mockEmployees.filter(e => e.company_id === companyId) : mockEmployees;
  });

  const [contracts, setContracts] = useState<HRContract[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}contracts`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: HRContract) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockContracts.filter(c => c.company_id === companyId) : mockContracts;
        }
      }
    }
    return companyId ? mockContracts.filter(c => c.company_id === companyId) : mockContracts;
  });

  const [payrolls, setPayrolls] = useState<Payroll[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}payrolls`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((p: Payroll) => p.company_id === companyId) : data;
        } catch {
          return companyId ? mockPayrolls.filter(p => p.company_id === companyId) : mockPayrolls;
        }
      }
    }
    return companyId ? mockPayrolls.filter(p => p.company_id === companyId) : mockPayrolls;
  });

  const [leaves, setLeaves] = useState<Leave[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}leaves`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((l: Leave) => l.company_id === companyId) : data;
        } catch {
          return companyId ? mockLeaves.filter(l => l.company_id === companyId) : mockLeaves;
        }
      }
    }
    return companyId ? mockLeaves.filter(l => l.company_id === companyId) : mockLeaves;
  });

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}leaveBalances`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((lb: LeaveBalance) => lb.company_id === companyId) : data;
        } catch {
          return companyId ? mockLeaveBalances.filter(lb => lb.company_id === companyId) : mockLeaveBalances;
        }
      }
    }
    return companyId ? mockLeaveBalances.filter(lb => lb.company_id === companyId) : mockLeaveBalances;
  });

  const [documents, setDocuments] = useState<HRDocument[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}documents`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((d: HRDocument) => d.company_id === companyId) : data;
        } catch {
          return companyId ? mockDocuments.filter(d => d.company_id === companyId) : mockDocuments;
        }
      }
    }
    return companyId ? mockDocuments.filter(d => d.company_id === companyId) : mockDocuments;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}evaluations`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((e: Evaluation) => e.company_id === companyId) : data;
        } catch {
          return companyId ? mockEvaluations.filter(e => e.company_id === companyId) : mockEvaluations;
        }
      }
    }
    return companyId ? mockEvaluations.filter(e => e.company_id === companyId) : mockEvaluations;
  });

  const [campaigns, setCampaigns] = useState<EvaluationCampaign[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}campaigns`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: EvaluationCampaign) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockCampaigns.filter(c => c.company_id === companyId) : mockCampaigns;
        }
      }
    }
    return companyId ? mockCampaigns.filter(c => c.company_id === companyId) : mockCampaigns;
  });

  // Persist to localStorage (with company filtering)
  const saveEmployees = useCallback((data: HREmployee[]) => {
    // Filtrer par company_id avant de sauvegarder
    const filtered = companyId ? data.filter(e => e.company_id === companyId) : data;
    setEmployees(filtered);
    if (typeof window !== 'undefined') {
      // Charger toutes les données existantes et fusionner
      const existing = localStorage.getItem(`${STORAGE_PREFIX}employees`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((e: HREmployee) => e.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}employees`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}employees`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}employees`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveContracts = useCallback((data: HRContract[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setContracts(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}contracts`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: HRContract) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}contracts`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}contracts`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}contracts`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const savePayrolls = useCallback((data: Payroll[]) => {
    const filtered = companyId ? data.filter(p => p.company_id === companyId) : data;
    setPayrolls(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}payrolls`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((p: Payroll) => p.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}payrolls`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}payrolls`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}payrolls`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveLeaves = useCallback((data: Leave[]) => {
    const filtered = companyId ? data.filter(l => l.company_id === companyId) : data;
    setLeaves(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}leaves`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((l: Leave) => l.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}leaves`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}leaves`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}leaves`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveDocuments = useCallback((data: HRDocument[]) => {
    const filtered = companyId ? data.filter(d => d.company_id === companyId) : data;
    setDocuments(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}documents`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((d: HRDocument) => d.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}documents`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}documents`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}documents`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveEvaluations = useCallback((data: Evaluation[]) => {
    const filtered = companyId ? data.filter(e => e.company_id === companyId) : data;
    setEvaluations(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}evaluations`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((e: Evaluation) => e.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}evaluations`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}evaluations`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}evaluations`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  // Re-load data when companyId changes
  useEffect(() => {
    if (!companyId) return;

    // Re-load from localStorage when company changes
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

    loadAndFilter(`${STORAGE_PREFIX}employees`, mockEmployees, setEmployees);
    loadAndFilter(`${STORAGE_PREFIX}contracts`, mockContracts, setContracts);
    loadAndFilter(`${STORAGE_PREFIX}payrolls`, mockPayrolls, setPayrolls);
    loadAndFilter(`${STORAGE_PREFIX}leaves`, mockLeaves, setLeaves);
    loadAndFilter(`${STORAGE_PREFIX}leaveBalances`, mockLeaveBalances, setLeaveBalances);
    loadAndFilter(`${STORAGE_PREFIX}documents`, mockDocuments, setDocuments);
    loadAndFilter(`${STORAGE_PREFIX}evaluations`, mockEvaluations, setEvaluations);
    loadAndFilter(`${STORAGE_PREFIX}campaigns`, mockCampaigns, setCampaigns);
  }, [companyId]);

  // Employee methods
  const createEmployee = useCallback((employee: Omit<HREmployee, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newEmployee: HREmployee = {
      ...employee,
      company_id: companyId,
      id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveEmployees([...employees, newEmployee]);
    return newEmployee;
  }, [employees, saveEmployees, companyId]);

  const updateEmployee = useCallback((id: string, updates: Partial<HREmployee>) => {
    const updated = employees.map(emp =>
      emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp
    );
    saveEmployees(updated);
    return updated.find(e => e.id === id);
  }, [employees, saveEmployees]);

  const getActiveContract = useCallback((employeeId: string): HRContract | undefined => {
    return contracts.find(c => c.employee_id === employeeId && c.status === 'active');
  }, [contracts]);

  // Payroll methods
  const calculatePayroll = useCallback((employeeId: string, period: string, salaryBrut: number) => {
    // Calculs simplifiés selon la législation tunisienne
    const cnss = salaryBrut * 0.10; // 10% CNSS
    const assurance = salaryBrut * 0.03; // 3% Assurance
    const retraite = salaryBrut * 0.05; // 5% Retraite
    const totalCotisations = cnss + assurance + retraite;

    // IRPP simplifié (barème progressif)
    let irpp = 0;
    const baseImposable = salaryBrut - totalCotisations;
    if (baseImposable > 5000) {
      irpp = (baseImposable - 5000) * 0.35 + 1500 * 0.25 + 2000 * 0.15;
    } else if (baseImposable > 3500) {
      irpp = (baseImposable - 3500) * 0.25 + 2000 * 0.15;
    } else if (baseImposable > 1500) {
      irpp = (baseImposable - 1500) * 0.15;
    }

    const totalRetenues = irpp;
    const netAPayer = salaryBrut - totalCotisations - totalRetenues;

    return {
      salaryBrut,
      cotisations: {
        cnss,
        assurance,
        retraite,
        autres: 0,
      },
      retenues: {
        irpp,
        autres: 0,
      },
      avantages: {
        prime: 0,
        indemnites: 0,
        autres: 0,
      },
      netAPayer: Math.max(0, netAPayer),
    };
  }, []);

  const createPayroll = useCallback((
    employeeId: string,
    contractId: string,
    period: string,
    date: string,
    salaryBrut: number,
    avantages?: { prime?: number; indemnites?: number; autres?: number }
  ): Payroll => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) throw new Error('Contrat introuvable');

    const calculated = calculatePayroll(employeeId, period, salaryBrut);
    const avantagesFinal = avantages || { prime: 0, indemnites: 0, autres: 0 };
    const netAPayer = calculated.netAPayer + (avantagesFinal.prime || 0) + (avantagesFinal.indemnites || 0);

    const payroll: Payroll = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      employee_id: employeeId,
      contract_id: contractId,
      period,
      date,
      salaryBrut,
      cotisations: calculated.cotisations,
      retenues: calculated.retenues,
      avantages: avantagesFinal,
      netAPayer,
      statut: 'draft',
      bulletinGenerated: false,
      company_id: companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePayrolls([...payrolls, payroll]);
    return payroll;
  }, [contracts, calculatePayroll, payrolls, savePayrolls, companyId]);

  const validatePayroll = useCallback((payrollId: string, generateAccounting: boolean = true) => {
    const payroll = payrolls.find(p => p.id === payrollId);
    if (!payroll) return null;

    let accountingEntryId: string | undefined;
    let financeScheduleId: string | undefined;

    if (generateAccounting && accountingConfig.enabled) {
      // Générer l'écriture comptable
      const entry = generateEntryFromPayroll(
        payroll.period,
        payroll.date,
        payroll.employee_id,
        payroll.salaryBrut,
        payroll.cotisations,
        payroll.retenues,
        payroll.netAPayer
      );
      if (entry) {
        accountingEntryId = entry.id;
      }

      // Créer l'échéance dans Finance (simulé - devrait être dans un hook Finance)
      financeScheduleId = `schedule_${Date.now()}`;
    }

    const updated: Payroll = {
      ...payroll,
      statut: 'validated',
      accountingEntryId,
      financeScheduleId,
      updatedAt: new Date().toISOString(),
    };

    savePayrolls(payrolls.map(p => p.id === payrollId ? updated : p));
    return updated;
  }, [payrolls, savePayrolls, accountingConfig, generateEntryFromPayroll]);

  return {
    // Data
    employees,
    contracts,
    payrolls,
    leaves,
    leaveBalances,
    documents,
    evaluations,
    campaigns,

    // Employee methods
    createEmployee,
    updateEmployee,
    getActiveContract,

    // Payroll methods
    calculatePayroll,
    createPayroll,
    validatePayroll,

    // Direct setters for other operations
    saveEmployees,
    saveContracts,
    savePayrolls,
    saveLeaves,
    saveDocuments,
    saveEvaluations,
  };
}
