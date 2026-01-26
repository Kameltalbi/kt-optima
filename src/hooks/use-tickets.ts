import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket, TicketMessage, TicketAttachment } from '@/types/database';
import { toast } from 'sonner';

export function useTickets(companyId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadTickets();
    }
  }, [companyId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          company_id: companyId,
          created_by: user.id,
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [data, ...prev]);
      toast.success('Ticket créé avec succès');
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erreur lors de la création du ticket');
      throw error;
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => prev.map(t => t.id === ticketId ? data : t));
      toast.success('Ticket mis à jour');
      return data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Erreur lors de la mise à jour du ticket');
      throw error;
    }
  };

  const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
      return [];
    }
  };

  const addTicketMessage = async (ticketId: string, message: string, isInternal: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket's updated_at
      await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      toast.success('Message ajouté');
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Erreur lors de l\'ajout du message');
      throw error;
    }
  };

  return {
    tickets,
    loading,
    loadTickets,
    createTicket,
    updateTicket,
    getTicketMessages,
    addTicketMessage,
  };
}

// Hook for superadmin to view all tickets
export function useAllTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllTickets();
  }, []);

  const loadAllTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading all tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => prev.map(t => t.id === ticketId ? data : t));
      toast.success('Ticket mis à jour');
      return data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Erreur lors de la mise à jour du ticket');
      throw error;
    }
  };

  const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  const addTicketMessage = async (ticketId: string, message: string, isInternal: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket's updated_at
      await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Erreur lors de l\'ajout du message');
      throw error;
    }
  };

  return {
    tickets,
    loading,
    loadAllTickets,
    updateTicket,
    getTicketMessages,
    addTicketMessage,
  };
}
