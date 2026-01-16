import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

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
  // Relations
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

// ============================================
// HOOK
// ============================================

export function useSupplierInvoices() {
  const { companyId, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);

  // ============================================
  // CHARGEMENT DES FACTURES
  // ============================================

  const fetchInvoices = useCallback(async (filters?: {
    status?: string;
    supplier_id?: string;
  }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      let query = supabase
        .from('supplier_invoices')
        .select('*')
        .eq('company_id', companyId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      query = query.order('date', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Charger les relations et les lignes
      const invoicesWithDetails = await Promise.all(
        (data || []).map(async (invoice) => {
          // Charger le fournisseur
          let supplier = null;
          if (invoice.supplier_id) {
            const { data: supplierData } = await supabase
              .from('suppliers')
              .select('id, name')
              .eq('id', invoice.supplier_id)
              .maybeSingle();
            if (supplierData) {
              supplier = supplierData;
            }
          }

          // Charger le bon de commande
          let purchaseOrder = null;
          if (invoice.purchase_order_id) {
            const { data: poData } = await supabase
              .from('purchase_orders')
              .select('id, number')
              .eq('id', invoice.purchase_order_id)
              .maybeSingle();
            if (poData) {
              purchaseOrder = poData;
            }
          }

          // Charger les lignes
          const { data: items } = await supabase
            .from('supplier_invoice_items')
            .select('*')
            .eq('supplier_invoice_id', invoice.id)
            .order('created_at');

          return {
            ...invoice,
            supplier,
            purchase_order: purchaseOrder,
            items: items || [],
          };
        })
      );

      setInvoices(invoicesWithDetails as SupplierInvoice[]);
    } catch (error: any) {
      console.error('Error fetching supplier invoices:', error);
      toast.error('Erreur lors du chargement des factures fournisseurs');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ============================================
  // CRÉATION
  // ============================================

  const createInvoice = useCallback(async (invoiceData: CreateSupplierInvoiceData) => {
    if (!companyId || !user?.id) return;

    try {
      // Créer la facture
      const { data: invoice, error: invoiceError } = await supabase
        .from('supplier_invoices')
        .insert({
          number: invoiceData.number,
          supplier_id: invoiceData.supplier_id,
          purchase_order_id: invoiceData.purchase_order_id || null,
          date: invoiceData.date,
          due_date: invoiceData.due_date || null,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          total: invoiceData.total,
          status: invoiceData.status || 'draft',
          notes: invoiceData.notes || null,
          company_id: companyId,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Créer les lignes
      if (invoiceData.items.length > 0) {
        const itemsToInsert = invoiceData.items.map(item => ({
          supplier_invoice_id: invoice.id,
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('supplier_invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchInvoices();
      toast.success('Facture fournisseur créée avec succès');
      return invoice;
    } catch (error: any) {
      console.error('Error creating supplier invoice:', error);
      toast.error(error.message || 'Erreur lors de la création de la facture fournisseur');
      throw error;
    }
  }, [companyId, user?.id, fetchInvoices]);

  // ============================================
  // MISE À JOUR
  // ============================================

  const updateInvoice = useCallback(async (id: string, updates: Partial<SupplierInvoice>) => {
    try {
      const { error } = await supabase
        .from('supplier_invoices')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchInvoices();
      toast.success('Facture fournisseur modifiée avec succès');
    } catch (error: any) {
      console.error('Error updating supplier invoice:', error);
      toast.error(error.message || 'Erreur lors de la modification de la facture fournisseur');
      throw error;
    }
  }, [fetchInvoices]);

  // ============================================
  // SUPPRESSION
  // ============================================

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplier_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchInvoices();
      toast.success('Facture fournisseur supprimée avec succès');
    } catch (error: any) {
      console.error('Error deleting supplier invoice:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la facture fournisseur');
      throw error;
    }
  }, [fetchInvoices]);

  // ============================================
  // INITIALISATION
  // ============================================

  useEffect(() => {
    if (companyId) {
      fetchInvoices();
    }
  }, [companyId, fetchInvoices]);

  return {
    // State
    loading,
    invoices,

    // Actions
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
