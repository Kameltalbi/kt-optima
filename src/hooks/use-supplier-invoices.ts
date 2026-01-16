import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Note: Ce hook est un placeholder en attendant la création des tables
// Les tables supplier_invoices, supplier_invoice_items doivent être créées

export interface SupplierInvoice {
  id: string;
  number: string;
  supplier_id: string;
  purchase_order_id: string | null;
  date: string;
  due_date: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'received' | 'paid' | 'overdue' | 'partial';
  notes: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    name: string;
  };
  purchase_order?: {
    id: string;
    number: string;
  };
  items?: SupplierInvoiceItem[];
}

export interface SupplierInvoiceItem {
  id: string;
  supplier_invoice_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
  created_at: string;
}

export interface CreateSupplierInvoiceData {
  number: string;
  supplier_id: string;
  purchase_order_id?: string | null;
  date: string;
  due_date?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status?: 'draft' | 'received' | 'paid' | 'overdue' | 'partial';
  notes?: string | null;
  items: Array<{
    product_id?: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
  }>;
}

export function useSupplierInvoices() {
  const [loading] = useState(false);
  const [invoices] = useState<SupplierInvoice[]>([]);

  const fetchInvoices = useCallback(async (_filters?: {
    status?: string;
    supplier_id?: string;
  }) => {
    console.log('Supplier invoices: Tables not yet created');
  }, []);

  const createInvoice = useCallback(async (_invoiceData: CreateSupplierInvoiceData) => {
    toast.error('Module factures fournisseurs non configuré');
    return null;
  }, []);

  const updateInvoice = useCallback(async (_id: string, _updates: Partial<SupplierInvoice>) => {
    toast.error('Module factures fournisseurs non configuré');
  }, []);

  const deleteInvoice = useCallback(async (_id: string) => {
    toast.error('Module factures fournisseurs non configuré');
  }, []);

  return {
    loading,
    invoices,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
