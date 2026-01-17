import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  code?: string;
  plafond_mensuel?: number;
  plafond_annuel?: number;
  actif: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseNoteItem {
  id?: string;
  expense_note_id?: string;
  category_id?: string;
  description: string;
  amount: number;
  date: string;
  tva_rate?: number;
  tva_amount?: number;
  total_amount: number;
  category?: ExpenseCategory;
}

export interface ExpenseAttachment {
  id: string;
  expense_note_id?: string;
  expense_item_id?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface ExpenseNote {
  id: string;
  number: string;
  employee_id?: string;
  date: string;
  total_amount: number;
  status: "brouillon" | "soumis" | "valide" | "rejete" | "paye";
  submitted_at?: string;
  validated_at?: string;
  validated_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  paid_at?: string;
  paid_by?: string;
  notes?: string;
  company_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: ExpenseNoteItem[];
  attachments?: ExpenseAttachment[];
  employee?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface ExpenseNoteHistory {
  id: string;
  expense_note_id: string;
  action: string;
  old_status?: string;
  new_status?: string;
  user_id?: string;
  comment?: string;
  created_at: string;
}

export function useExpenseNotes() {
  const { company } = useApp();
  const [expenseNotes, setExpenseNotes] = useState<ExpenseNote[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les catégories
  const loadCategories = useCallback(async () => {
    if (!company?.id) return;

    try {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("company_id", company.id)
        .eq("actif", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des catégories:", error);
      toast.error("Erreur lors du chargement des catégories");
    }
  }, [company?.id]);

  // Charger les notes de frais
  const loadExpenseNotes = useCallback(async () => {
    if (!company?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("expense_notes")
        .select(`
          *,
          items:expense_note_items(
            *,
            category:expense_categories(*)
          ),
          attachments:expense_attachments(*),
          employes(id, nom, prenom)
        `)
        .eq("company_id", company.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Formater les données
      const formatted = (data || []).map((note: any) => ({
        ...note,
        items: note.items || [],
        attachments: note.attachments || [],
        employee: note.employes || null,
      }));

      setExpenseNotes(formatted);
    } catch (error: any) {
      console.error("Erreur lors du chargement des notes de frais:", error);
      toast.error("Erreur lors du chargement des notes de frais");
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  // Générer le numéro suivant
  const getNextNumber = useCallback(async (): Promise<string> => {
    if (!company?.id) return "NF-001";

    try {
      const { data, error } = await supabase
        .from("expense_notes")
        .select("number")
        .eq("company_id", company.id)
        .order("number", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "NF-001";
      }

      const lastNumber = data[0].number;
      const match = lastNumber.match(/NF-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10) + 1;
        return `NF-${num.toString().padStart(3, "0")}`;
      }

      return "NF-001";
    } catch (error: any) {
      console.error("Erreur lors de la génération du numéro:", error);
      return "NF-001";
    }
  }, [company?.id]);

  // Créer une note de frais
  const createExpenseNote = useCallback(
    async (noteData: {
      employee_id?: string;
      date: string;
      items: ExpenseNoteItem[];
      notes?: string;
    }): Promise<ExpenseNote | null> => {
      if (!company?.id) {
        toast.error("Aucune entreprise sélectionnée");
        return null;
      }

      try {
        const number = await getNextNumber();
        const { data: userData } = await supabase.auth.getUser();

        // Calculer le total
        const totalAmount = noteData.items.reduce(
          (sum, item) => sum + (item.total_amount || item.amount),
          0
        );

        // Créer la note
        const { data: note, error: noteError } = await supabase
          .from("expense_notes")
          .insert({
            number,
            employee_id: noteData.employee_id,
            date: noteData.date,
            total_amount: totalAmount,
            status: "brouillon",
            notes: noteData.notes,
            company_id: company.id,
            created_by: userData.user?.id,
          })
          .select()
          .single();

        if (noteError) throw noteError;

        // Créer les lignes
        if (noteData.items.length > 0) {
          const itemsToInsert = noteData.items.map((item) => ({
            expense_note_id: note.id,
            category_id: item.category_id,
            description: item.description,
            amount: item.amount,
            date: item.date,
            tva_rate: item.tva_rate || 0,
            tva_amount: item.tva_amount || 0,
            total_amount: item.total_amount || item.amount,
          }));

          const { error: itemsError } = await supabase
            .from("expense_note_items")
            .insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }

        toast.success("Note de frais créée avec succès");
        await loadExpenseNotes();
        return note;
      } catch (error: any) {
        console.error("Erreur lors de la création:", error);
        toast.error(`Erreur: ${error.message}`);
        return null;
      }
    },
    [company?.id, getNextNumber, loadExpenseNotes]
  );

  // Mettre à jour une note de frais
  const updateExpenseNote = useCallback(
    async (
      id: string,
      updates: {
        date?: string;
        items?: ExpenseNoteItem[];
        notes?: string;
      }
    ): Promise<boolean> => {
      try {
        // Mettre à jour la note
        const updateData: any = {};
        if (updates.date) updateData.date = updates.date;
        if (updates.notes !== undefined) updateData.notes = updates.notes;

        if (Object.keys(updateData).length > 0) {
          const { error: noteError } = await supabase
            .from("expense_notes")
            .update(updateData)
            .eq("id", id);

          if (noteError) throw noteError;
        }

        // Mettre à jour les lignes si fournies
        if (updates.items) {
          // Supprimer les anciennes lignes
          await supabase.from("expense_note_items").delete().eq("expense_note_id", id);

          // Insérer les nouvelles lignes
          if (updates.items.length > 0) {
            const itemsToInsert = updates.items.map((item) => ({
              expense_note_id: id,
              category_id: item.category_id,
              description: item.description,
              amount: item.amount,
              date: item.date,
              tva_rate: item.tva_rate || 0,
              tva_amount: item.tva_amount || 0,
              total_amount: item.total_amount || item.amount,
            }));

            const { error: itemsError } = await supabase
              .from("expense_note_items")
              .insert(itemsToInsert);

            if (itemsError) throw itemsError;
          }
        }

        toast.success("Note de frais mise à jour");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Soumettre une note de frais
  const submitExpenseNote = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("expense_notes")
          .update({
            status: "soumis",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        toast.success("Note de frais soumise");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la soumission:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Valider une note de frais
  const validateExpenseNote = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("expense_notes")
          .update({
            status: "valide",
            validated_at: new Date().toISOString(),
            validated_by: userData.user?.id,
          })
          .eq("id", id);

        if (error) throw error;

        toast.success("Note de frais validée");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la validation:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Rejeter une note de frais
  const rejectExpenseNote = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("expense_notes")
          .update({
            status: "rejete",
            rejected_at: new Date().toISOString(),
            rejected_by: userData.user?.id,
            rejection_reason: reason,
          })
          .eq("id", id);

        if (error) throw error;

        toast.success("Note de frais rejetée");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors du rejet:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Marquer comme payé
  const markAsPaid = useCallback(
    async (id: string, compteTresorerieId?: string, moyenPaiement?: string): Promise<boolean> => {
      if (!company?.id) {
        toast.error("Aucune entreprise sélectionnée");
        return false;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();
        
        // Récupérer la note de frais avec l'employé
        const { data: note, error: noteError } = await supabase
          .from("expense_notes")
          .select(`
            *,
            employee:employes(id, nom, prenom)
          `)
          .eq("id", id)
          .single();

        if (noteError) throw noteError;

        // Mettre à jour le statut
        const { error: updateError } = await supabase
          .from("expense_notes")
          .update({
            status: "paye",
            paid_at: new Date().toISOString(),
            paid_by: userData.user?.id,
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Créer un mouvement de trésorerie si un compte est fourni
        if (compteTresorerieId) {
          const { error: tresorerieError } = await supabase
            .from("mouvements_tresorerie")
            .insert({
              compte_tresorerie_id: compteTresorerieId,
              type: "sortie",
              date_mouvement: note.date,
              montant: note.total_amount,
              libelle: `Paiement note de frais ${note.number}`,
              reference_type: "note_de_frais",
              reference_id: id,
              moyen_paiement: moyenPaiement || "virement",
              beneficiaire: note.employee ? `${note.employee.prenom} ${note.employee.nom}` : null,
              notes: `Note de frais ${note.number}`,
              company_id: company.id,
              created_by: userData.user?.id,
            });

          if (tresorerieError) {
            console.error("Erreur lors de la création du mouvement de trésorerie:", tresorerieError);
            // On continue même si l'insertion du mouvement échoue
          }
        }

        toast.success("Note de frais marquée comme payée");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors du paiement:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [company?.id, loadExpenseNotes]
  );

  // Supprimer une note de frais
  const deleteExpenseNote = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase.from("expense_notes").delete().eq("id", id);

        if (error) throw error;

        toast.success("Note de frais supprimée");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Charger l'historique
  const loadHistory = useCallback(async (expenseNoteId: string): Promise<ExpenseNoteHistory[]> => {
    try {
      const { data, error } = await supabase
        .from("expense_note_history")
        .select("*")
        .eq("expense_note_id", expenseNoteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Erreur lors du chargement de l'historique:", error);
      return [];
    }
  }, []);

  // Uploader un justificatif
  const uploadAttachment = useCallback(
    async (
      expenseNoteId: string,
      expenseItemId: string | null,
      file: File
    ): Promise<string | null> => {
      if (!company?.id) {
        toast.error("Aucune entreprise sélectionnée");
        return null;
      }

      try {
        // Vérifier le type de fichier
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Type de fichier non autorisé. Utilisez PDF, JPEG, PNG ou WebP.");
          return null;
        }

        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error("Fichier trop volumineux. Maximum 10 Mo.");
          return null;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${company.id}/${expenseNoteId}/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("expense-attachments")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Enregistrer dans la base de données
        const { data: userData } = await supabase.auth.getUser();
        const { data, error: insertError } = await supabase
          .from("expense_attachments")
          .insert({
            expense_note_id: expenseNoteId,
            expense_item_id: expenseItemId || null,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: userData.user?.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        toast.success("Justificatif téléchargé avec succès");
        await loadExpenseNotes();
        return fileName;
      } catch (error: any) {
        console.error("Erreur lors de l'upload:", error);
        toast.error(`Erreur: ${error.message}`);
        return null;
      }
    },
    [company?.id, loadExpenseNotes]
  );

  // Supprimer un justificatif
  const deleteAttachment = useCallback(
    async (attachmentId: string, filePath: string): Promise<boolean> => {
      try {
        // Supprimer du storage
        const { error: storageError } = await supabase.storage
          .from("expense-attachments")
          .remove([filePath]);

        if (storageError) throw storageError;

        // Supprimer de la base de données
        const { error: dbError } = await supabase
          .from("expense_attachments")
          .delete()
          .eq("id", attachmentId);

        if (dbError) throw dbError;

        toast.success("Justificatif supprimé");
        await loadExpenseNotes();
        return true;
      } catch (error: any) {
        console.error("Erreur lors de la suppression:", error);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }
    },
    [loadExpenseNotes]
  );

  // Obtenir l'URL d'un justificatif
  const getAttachmentUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from("expense-attachments")
        .createSignedUrl(filePath, 3600); // URL valide 1 heure

      return data?.signedUrl || null;
    } catch (error: any) {
      console.error("Erreur lors de la génération de l'URL:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadExpenseNotes();
  }, [loadCategories, loadExpenseNotes]);

  return {
    expenseNotes,
    categories,
    loading,
    loadExpenseNotes,
    loadCategories,
    createExpenseNote,
    updateExpenseNote,
    submitExpenseNote,
    validateExpenseNote,
    rejectExpenseNote,
    markAsPaid,
    deleteExpenseNote,
    loadHistory,
    uploadAttachment,
    deleteAttachment,
    getAttachmentUrl,
  };
}
