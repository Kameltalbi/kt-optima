import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Equipment, Maintenance, FleetAlert, EquipmentAssignment } from '@/types/database';

const STORAGE_PREFIX = 'bilvoxa_erp_fleet_';

// Mock data
const mockEquipment: Equipment[] = [
  {
    id: 'eq_1',
    name: 'Véhicule utilitaire - Renault Kangoo',
    category: 'vehicle',
    reference: 'VH-2024-001',
    acquisitionDate: '2024-01-15',
    status: 'active',
    warehouseId: 'wh_1',
    department: 'Logistique',
    employeeId: 'emp_1',
    comments: 'Véhicule de livraison',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'eq_2',
    name: 'Imprimante multifonction',
    category: 'it',
    reference: 'IT-2024-002',
    acquisitionDate: '2024-02-20',
    status: 'active',
    department: 'Administration',
    comments: 'Imprimante bureau',
    company_id: '1',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'eq_3',
    name: 'Machine de production',
    category: 'machine',
    reference: 'MC-2023-015',
    acquisitionDate: '2023-06-10',
    status: 'active',
    warehouseId: 'wh_1',
    comments: 'Machine principale',
    company_id: '1',
    createdAt: '2023-06-10T10:00:00Z',
    updatedAt: '2023-06-10T10:00:00Z',
  },
];

const mockMaintenance: Maintenance[] = [
  {
    id: 'mnt_1',
    equipmentId: 'eq_1',
    date: '2024-03-15',
    type: 'maintenance',
    description: 'Révision générale et changement d\'huile',
    cost: 450,
    nextDueDate: '2024-09-15',
    company_id: '1',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'mnt_2',
    equipmentId: 'eq_1',
    date: '2024-01-20',
    type: 'repair',
    description: 'Réparation freins',
    cost: 320,
    nextDueDate: '2025-01-20',
    company_id: '1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'mnt_3',
    equipmentId: 'eq_3',
    date: '2024-02-10',
    type: 'inspection',
    description: 'Contrôle technique annuel',
    cost: 150,
    nextDueDate: '2025-02-10',
    company_id: '1',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
];

const mockAssignments: EquipmentAssignment[] = [
  {
    id: 'asg_1',
    equipmentId: 'eq_1',
    warehouseId: 'wh_1',
    department: 'Logistique',
    employeeId: 'emp_1',
    startDate: '2024-01-15',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
  },
];

export function useFleet() {
  const { companyId } = useAuth();

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}equipment`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((e: Equipment) => e.company_id === companyId) : data;
        } catch {
          return companyId ? mockEquipment.filter(e => e.company_id === companyId) : mockEquipment;
        }
      }
    }
    return companyId ? mockEquipment.filter(e => e.company_id === companyId) : mockEquipment;
  });

  const [maintenance, setMaintenance] = useState<Maintenance[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}maintenance`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((m: Maintenance) => m.company_id === companyId) : data;
        } catch {
          return companyId ? mockMaintenance.filter(m => m.company_id === companyId) : mockMaintenance;
        }
      }
    }
    return companyId ? mockMaintenance.filter(m => m.company_id === companyId) : mockMaintenance;
  });

  const [assignments, setAssignments] = useState<EquipmentAssignment[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}assignments`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((a: EquipmentAssignment) => a.company_id === companyId) : data;
        } catch {
          return companyId ? mockAssignments.filter(a => a.company_id === companyId) : mockAssignments;
        }
      }
    }
    return companyId ? mockAssignments.filter(a => a.company_id === companyId) : mockAssignments;
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

    loadAndFilter(`${STORAGE_PREFIX}equipment`, mockEquipment, setEquipment);
    loadAndFilter(`${STORAGE_PREFIX}maintenance`, mockMaintenance, setMaintenance);
    loadAndFilter(`${STORAGE_PREFIX}assignments`, mockAssignments, setAssignments);
  }, [companyId]);

  // Save functions
  const saveEquipment = useCallback((data: Equipment[]) => {
    const filtered = companyId ? data.filter(e => e.company_id === companyId) : data;
    setEquipment(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}equipment`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((e: Equipment) => e.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}equipment`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}equipment`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}equipment`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveMaintenance = useCallback((data: Maintenance[]) => {
    const filtered = companyId ? data.filter(m => m.company_id === companyId) : data;
    setMaintenance(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}maintenance`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((m: Maintenance) => m.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}maintenance`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}maintenance`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}maintenance`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  // Equipment methods
  const createEquipment = useCallback((equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newEquipment: Equipment = {
      ...equipmentData,
      company_id: companyId,
      id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveEquipment([...equipment, newEquipment]);
    return newEquipment;
  }, [equipment, saveEquipment, companyId]);

  const updateEquipment = useCallback((id: string, updates: Partial<Equipment>) => {
    const updated = equipment.map(eq =>
      eq.id === id ? { ...eq, ...updates, updatedAt: new Date().toISOString() } : eq
    );
    saveEquipment(updated);
    return updated.find(e => e.id === id);
  }, [equipment, saveEquipment]);

  const deleteEquipment = useCallback((id: string) => {
    const filtered = equipment.filter(e => e.id !== id);
    saveEquipment(filtered);
  }, [equipment, saveEquipment]);

  // Maintenance methods
  const createMaintenance = useCallback((maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newMaintenance: Maintenance = {
      ...maintenanceData,
      company_id: companyId,
      id: `mnt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMaintenance([...maintenance, newMaintenance]);
    return newMaintenance;
  }, [maintenance, saveMaintenance, companyId]);

  const updateMaintenance = useCallback((id: string, updates: Partial<Maintenance>) => {
    const updated = maintenance.map(m =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    saveMaintenance(updated);
    return updated.find(m => m.id === id);
  }, [maintenance, saveMaintenance]);

  const deleteMaintenance = useCallback((id: string) => {
    const filtered = maintenance.filter(m => m.id !== id);
    saveMaintenance(filtered);
  }, [maintenance, saveMaintenance]);

  // Alerts generation
  const alerts = useMemo<FleetAlert[]>(() => {
    if (!companyId) return [];
    
    const alertsList: FleetAlert[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Check for upcoming maintenance
    maintenance.forEach(m => {
      if (m.nextDueDate) {
        const dueDate = new Date(m.nextDueDate);
        if (dueDate <= thirtyDaysFromNow && dueDate >= today) {
          const equipmentItem = equipment.find(e => e.id === m.equipmentId);
          alertsList.push({
            id: `alert_${m.id}_upcoming`,
            equipmentId: m.equipmentId,
            type: 'upcoming_maintenance',
            message: `Entretien prévu pour ${equipmentItem?.name || 'équipement'}`,
            dueDate: m.nextDueDate,
            priority: dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium',
            company_id: companyId,
            createdAt: new Date().toISOString(),
          });
        } else if (dueDate < today) {
          const equipmentItem = equipment.find(e => e.id === m.equipmentId);
          alertsList.push({
            id: `alert_${m.id}_overdue`,
            equipmentId: m.equipmentId,
            type: 'overdue_maintenance',
            message: `Entretien en retard pour ${equipmentItem?.name || 'équipement'}`,
            dueDate: m.nextDueDate,
            priority: 'high',
            company_id: companyId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Check for inactive equipment
    equipment.forEach(eq => {
      if (eq.status === 'inactive') {
        alertsList.push({
          id: `alert_${eq.id}_inactive`,
          equipmentId: eq.id,
          type: 'inactive_equipment',
          message: `${eq.name} est hors service`,
          priority: 'low',
          company_id: companyId,
          createdAt: new Date().toISOString(),
        });
      }
    });

    return alertsList.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [maintenance, equipment, companyId]);

  // Get maintenance history for an equipment
  const getMaintenanceHistory = useCallback((equipmentId: string): Maintenance[] => {
    return maintenance
      .filter(m => m.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenance]);

  // Get assignment history for an equipment
  const getAssignmentHistory = useCallback((equipmentId: string): EquipmentAssignment[] => {
    return assignments
      .filter(a => a.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [assignments]);

  return {
    equipment,
    maintenance,
    assignments,
    alerts,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getMaintenanceHistory,
    getAssignmentHistory,
  };
}
