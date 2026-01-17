export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bon_livraison_lignes: {
        Row: {
          bon_livraison_id: string
          created_at: string | null
          description: string | null
          id: string
          ordre: number | null
          produit_id: string | null
          quantite: number
          unite: string | null
        }
        Insert: {
          bon_livraison_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          ordre?: number | null
          produit_id?: string | null
          quantite?: number
          unite?: string | null
        }
        Update: {
          bon_livraison_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ordre?: number | null
          produit_id?: string | null
          quantite?: number
          unite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bon_livraison_lignes_bon_livraison_id_fkey"
            columns: ["bon_livraison_id"]
            isOneToOne: false
            referencedRelation: "bons_livraison"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bon_livraison_lignes_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      bons_livraison: {
        Row: {
          adresse_livraison: string | null
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          date_livraison: string
          facture_vente_id: string | null
          id: string
          notes: string | null
          numero: string
          statut: string
          updated_at: string | null
        }
        Insert: {
          adresse_livraison?: string | null
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_livraison?: string
          facture_vente_id?: string | null
          id?: string
          notes?: string | null
          numero: string
          statut?: string
          updated_at?: string | null
        }
        Update: {
          adresse_livraison?: string | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_livraison?: string
          facture_vente_id?: string | null
          id?: string
          notes?: string | null
          numero?: string
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bons_livraison_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bons_livraison_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bons_livraison_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "factures_ventes"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          actif: boolean | null
          adresse: string | null
          code: string | null
          code_postal: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          numero_fiscal: string | null
          numero_registre_commerce: string | null
          pays: string | null
          site_web: string | null
          solde_actuel: number | null
          solde_initial: number | null
          telephone: string | null
          type: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          code_postal?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          numero_fiscal?: string | null
          numero_registre_commerce?: string | null
          pays?: string | null
          site_web?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          telephone?: string | null
          type?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          code_postal?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          numero_fiscal?: string | null
          numero_registre_commerce?: string | null
          pays?: string | null
          site_web?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          telephone?: string | null
          type?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          currency: string
          email: string | null
          footer: string | null
          id: string
          language: string
          logo: string | null
          name: string
          phone: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency?: string
          email?: string | null
          footer?: string | null
          id?: string
          language?: string
          logo?: string | null
          name: string
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency?: string
          email?: string | null
          footer?: string | null
          id?: string
          language?: string
          logo?: string | null
          name?: string
          phone?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comptes_tresorerie: {
        Row: {
          actif: boolean | null
          banque: string | null
          code: string | null
          company_id: string
          created_at: string | null
          iban: string | null
          id: string
          nom: string
          numero_compte: string | null
          solde_actuel: number | null
          solde_initial: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          banque?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          iban?: string | null
          id?: string
          nom: string
          numero_compte?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          banque?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          iban?: string | null
          id?: string
          nom?: string
          numero_compte?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comptes_tresorerie_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          company_id: string
          completed: boolean | null
          created_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          crm_opportunity_id: string | null
          date: string
          description: string | null
          duration: number | null
          id: string
          sales_rep_id: string | null
          subject: string
          time: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          completed?: boolean | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_opportunity_id?: string | null
          date: string
          description?: string | null
          duration?: number | null
          id?: string
          sales_rep_id?: string | null
          subject: string
          time?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          completed?: boolean | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_opportunity_id?: string | null
          date?: string
          description?: string | null
          duration?: number | null
          id?: string
          sales_rep_id?: string | null
          subject?: string
          time?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_crm_company_id_fkey"
            columns: ["crm_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_crm_opportunity_id_fkey"
            columns: ["crm_opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          sales_rep_id: string | null
          sector: string | null
          tax_number: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          sales_rep_id?: string | null
          sector?: string | null
          tax_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          sales_rep_id?: string | null
          sector?: string | null
          tax_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company_id: string
          created_at: string | null
          crm_company_id: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          position: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          crm_company_id?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          crm_company_id?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_crm_company_id_fkey"
            columns: ["crm_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          company_id: string
          created_at: string | null
          crm_company_id: string
          crm_contact_id: string | null
          description: string | null
          estimated_amount: number | null
          expected_close_date: string | null
          id: string
          name: string
          probability: number | null
          quote_id: string | null
          sales_rep_id: string | null
          stage: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          crm_company_id: string
          crm_contact_id?: string | null
          description?: string | null
          estimated_amount?: number | null
          expected_close_date?: string | null
          id?: string
          name: string
          probability?: number | null
          quote_id?: string | null
          sales_rep_id?: string | null
          stage?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          crm_company_id?: string
          crm_contact_id?: string | null
          description?: string | null
          estimated_amount?: number | null
          expected_close_date?: string | null
          id?: string
          name?: string
          probability?: number | null
          quote_id?: string | null
          sales_rep_id?: string | null
          stage?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_crm_company_id_fkey"
            columns: ["crm_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      demande_achat_lignes: {
        Row: {
          created_at: string | null
          demande_achat_id: string
          description: string
          id: string
          montant_estime: number | null
          notes: string | null
          ordre: number | null
          prix_unitaire_estime: number | null
          produit_id: string | null
          quantite: number
          unite: string | null
        }
        Insert: {
          created_at?: string | null
          demande_achat_id: string
          description: string
          id?: string
          montant_estime?: number | null
          notes?: string | null
          ordre?: number | null
          prix_unitaire_estime?: number | null
          produit_id?: string | null
          quantite: number
          unite?: string | null
        }
        Update: {
          created_at?: string | null
          demande_achat_id?: string
          description?: string
          id?: string
          montant_estime?: number | null
          notes?: string | null
          ordre?: number | null
          prix_unitaire_estime?: number | null
          produit_id?: string | null
          quantite?: number
          unite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demande_achat_lignes_demande_achat_id_fkey"
            columns: ["demande_achat_id"]
            isOneToOne: false
            referencedRelation: "demandes_achat"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_achat: {
        Row: {
          approbateur_id: string | null
          bon_commande_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          date_approbation: string | null
          date_demande: string
          demandeur_id: string | null
          departement: string | null
          id: string
          notes: string | null
          numero: string
          priorite: string
          statut: string
          updated_at: string | null
        }
        Insert: {
          approbateur_id?: string | null
          bon_commande_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_approbation?: string | null
          date_demande: string
          demandeur_id?: string | null
          departement?: string | null
          id?: string
          notes?: string | null
          numero: string
          priorite?: string
          statut?: string
          updated_at?: string | null
        }
        Update: {
          approbateur_id?: string | null
          bon_commande_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_approbation?: string | null
          date_demande?: string
          demandeur_id?: string | null
          departement?: string | null
          id?: string
          notes?: string | null
          numero?: string
          priorite?: string
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandes_achat_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ecriture_lignes: {
        Row: {
          compte_comptable: string
          created_at: string | null
          ecriture_id: string
          id: string
          libelle: string | null
          montant: number
          ordre: number | null
          type: Database["public"]["Enums"]["ecriture_ligne_type"]
        }
        Insert: {
          compte_comptable: string
          created_at?: string | null
          ecriture_id: string
          id?: string
          libelle?: string | null
          montant: number
          ordre?: number | null
          type: Database["public"]["Enums"]["ecriture_ligne_type"]
        }
        Update: {
          compte_comptable?: string
          created_at?: string | null
          ecriture_id?: string
          id?: string
          libelle?: string | null
          montant?: number
          ordre?: number | null
          type?: Database["public"]["Enums"]["ecriture_ligne_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ecriture_lignes_ecriture_id_fkey"
            columns: ["ecriture_id"]
            isOneToOne: false
            referencedRelation: "ecritures_comptables"
            referencedColumns: ["id"]
          },
        ]
      }
      ecritures_comptables: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          date_ecriture: string
          id: string
          journal: string | null
          libelle: string
          numero: string | null
          piece_jointe: string | null
          reference_id: string | null
          reference_type: string | null
          total_credit: number
          total_debit: number
          updated_at: string | null
          validee: boolean | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_ecriture: string
          id?: string
          journal?: string | null
          libelle: string
          numero?: string | null
          piece_jointe?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string | null
          validee?: boolean | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_ecriture?: string
          id?: string
          journal?: string | null
          libelle?: string
          numero?: string | null
          piece_jointe?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string | null
          validee?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ecritures_comptables_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employes: {
        Row: {
          actif: boolean | null
          adresse: string | null
          code: string | null
          company_id: string
          created_at: string | null
          date_depart: string | null
          date_embauche: string
          date_naissance: string | null
          departement: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          numero_cin: string | null
          numero_cnss: string | null
          poste: string | null
          prenom: string
          salaire_base: number
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          date_depart?: string | null
          date_embauche: string
          date_naissance?: string | null
          departement?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          numero_cin?: string | null
          numero_cnss?: string | null
          poste?: string | null
          prenom: string
          salaire_base: number
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          date_depart?: string | null
          date_embauche?: string
          date_naissance?: string | null
          departement?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          numero_cin?: string | null
          numero_cnss?: string | null
          poste?: string | null
          prenom?: string
          salaire_base?: number
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      encaissements: {
        Row: {
          allocated_amount: number
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          mode_paiement: string
          montant: number
          notes: string | null
          reference: string | null
          remaining_amount: number
          status: string
          type_encaissement: string
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          mode_paiement: string
          montant: number
          notes?: string | null
          reference?: string | null
          remaining_amount?: number
          status?: string
          type_encaissement?: string
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          mode_paiement?: string
          montant?: number
          notes?: string | null
          reference?: string | null
          remaining_amount?: number
          status?: string
          type_encaissement?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encaissements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaissements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      facture_achat_lignes: {
        Row: {
          created_at: string | null
          description: string | null
          facture_achat_id: string
          id: string
          montant_ht: number
          montant_ttc: number
          montant_tva: number
          ordre: number | null
          prix_unitaire: number
          produit_id: string | null
          quantite: number
          taux_tva: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          facture_achat_id: string
          id?: string
          montant_ht: number
          montant_ttc: number
          montant_tva: number
          ordre?: number | null
          prix_unitaire: number
          produit_id?: string | null
          quantite?: number
          taux_tva?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          facture_achat_id?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          montant_tva?: number
          ordre?: number | null
          prix_unitaire?: number
          produit_id?: string | null
          quantite?: number
          taux_tva?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facture_achat_lignes_facture_achat_id_fkey"
            columns: ["facture_achat_id"]
            isOneToOne: false
            referencedRelation: "factures_achats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facture_achat_lignes_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      facture_encaissements: {
        Row: {
          created_at: string | null
          encaissement_id: string
          facture_id: string
          id: string
          montant_alloue: number
        }
        Insert: {
          created_at?: string | null
          encaissement_id: string
          facture_id: string
          id?: string
          montant_alloue: number
        }
        Update: {
          created_at?: string | null
          encaissement_id?: string
          facture_id?: string
          id?: string
          montant_alloue?: number
        }
        Relationships: [
          {
            foreignKeyName: "facture_encaissements_encaissement_id_fkey"
            columns: ["encaissement_id"]
            isOneToOne: false
            referencedRelation: "encaissements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facture_encaissements_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures_ventes"
            referencedColumns: ["id"]
          },
        ]
      }
      facture_vente_lignes: {
        Row: {
          created_at: string | null
          description: string | null
          facture_vente_id: string
          id: string
          montant_ht: number
          montant_ttc: number
          montant_tva: number
          ordre: number | null
          prix_unitaire: number
          produit_id: string | null
          quantite: number
          taux_tva: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          facture_vente_id: string
          id?: string
          montant_ht: number
          montant_ttc: number
          montant_tva: number
          ordre?: number | null
          prix_unitaire: number
          produit_id?: string | null
          quantite?: number
          taux_tva?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          facture_vente_id?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          montant_tva?: number
          ordre?: number | null
          prix_unitaire?: number
          produit_id?: string | null
          quantite?: number
          taux_tva?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facture_vente_lignes_facture_vente_id_fkey"
            columns: ["facture_vente_id"]
            isOneToOne: false
            referencedRelation: "factures_ventes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facture_vente_lignes_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_achats: {
        Row: {
          company_id: string
          conditions_paiement: string | null
          created_at: string | null
          created_by: string | null
          date_echeance: string | null
          date_facture: string
          fournisseur_id: string
          id: string
          montant_ht: number
          montant_paye: number | null
          montant_restant: number
          montant_ttc: number
          montant_tva: number
          notes: string | null
          numero: string
          numero_interne: string | null
          statut: Database["public"]["Enums"]["facture_statut"] | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          conditions_paiement?: string | null
          created_at?: string | null
          created_by?: string | null
          date_echeance?: string | null
          date_facture: string
          fournisseur_id: string
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_restant?: number
          montant_ttc?: number
          montant_tva?: number
          notes?: string | null
          numero: string
          numero_interne?: string | null
          statut?: Database["public"]["Enums"]["facture_statut"] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          conditions_paiement?: string | null
          created_at?: string | null
          created_by?: string | null
          date_echeance?: string | null
          date_facture?: string
          fournisseur_id?: string
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_restant?: number
          montant_ttc?: number
          montant_tva?: number
          notes?: string | null
          numero?: string
          numero_interne?: string | null
          statut?: Database["public"]["Enums"]["facture_statut"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_achats_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_achats_fournisseur_id_fkey"
            columns: ["fournisseur_id"]
            isOneToOne: false
            referencedRelation: "fournisseurs"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_ventes: {
        Row: {
          client_id: string
          company_id: string
          conditions_paiement: string | null
          created_at: string | null
          created_by: string | null
          date_echeance: string | null
          date_facture: string
          id: string
          montant_ht: number
          montant_paye: number | null
          montant_restant: number
          montant_ttc: number
          montant_tva: number
          notes: string | null
          numero: string
          remise_montant: number | null
          remise_type: string | null
          remise_valeur: number | null
          statut: Database["public"]["Enums"]["facture_statut"] | null
          type_facture: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_id: string
          conditions_paiement?: string | null
          created_at?: string | null
          created_by?: string | null
          date_echeance?: string | null
          date_facture: string
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_restant?: number
          montant_ttc?: number
          montant_tva?: number
          notes?: string | null
          numero: string
          remise_montant?: number | null
          remise_type?: string | null
          remise_valeur?: number | null
          statut?: Database["public"]["Enums"]["facture_statut"] | null
          type_facture?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string
          conditions_paiement?: string | null
          created_at?: string | null
          created_by?: string | null
          date_echeance?: string | null
          date_facture?: string
          id?: string
          montant_ht?: number
          montant_paye?: number | null
          montant_restant?: number
          montant_ttc?: number
          montant_tva?: number
          notes?: string | null
          numero?: string
          remise_montant?: number | null
          remise_type?: string | null
          remise_valeur?: number | null
          statut?: Database["public"]["Enums"]["facture_statut"] | null
          type_facture?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_ventes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_ventes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fiches_paie: {
        Row: {
          autres_retenues: number | null
          base_imposable: number
          brut: number
          cnss_employeur: number
          cnss_salarie: number
          company_id: string
          created_at: string | null
          created_by: string | null
          date_paiement: string
          employe_id: string
          heures_sup: number | null
          id: string
          indemnites: number | null
          irpp_annuel: number
          irpp_mensuel: number
          net_a_payer: number
          notes: string | null
          numero: string | null
          periode: string
          primes: number | null
          salaire_base: number
          statut: string
          taux_cnss_employeur: number
          taux_cnss_salarie: number
          updated_at: string | null
        }
        Insert: {
          autres_retenues?: number | null
          base_imposable: number
          brut: number
          cnss_employeur: number
          cnss_salarie: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_paiement: string
          employe_id: string
          heures_sup?: number | null
          id?: string
          indemnites?: number | null
          irpp_annuel: number
          irpp_mensuel: number
          net_a_payer: number
          notes?: string | null
          numero?: string | null
          periode: string
          primes?: number | null
          salaire_base: number
          statut?: string
          taux_cnss_employeur: number
          taux_cnss_salarie: number
          updated_at?: string | null
        }
        Update: {
          autres_retenues?: number | null
          base_imposable?: number
          brut?: number
          cnss_employeur?: number
          cnss_salarie?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_paiement?: string
          employe_id?: string
          heures_sup?: number | null
          id?: string
          indemnites?: number | null
          irpp_annuel?: number
          irpp_mensuel?: number
          net_a_payer?: number
          notes?: string | null
          numero?: string | null
          periode?: string
          primes?: number | null
          salaire_base?: number
          statut?: string
          taux_cnss_employeur?: number
          taux_cnss_salarie?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiches_paie_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiches_paie_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employes"
            referencedColumns: ["id"]
          },
        ]
      }
      fournisseurs: {
        Row: {
          actif: boolean | null
          adresse: string | null
          code: string | null
          code_postal: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          numero_fiscal: string | null
          numero_registre_commerce: string | null
          pays: string | null
          site_web: string | null
          solde_actuel: number | null
          solde_initial: number | null
          telephone: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          code_postal?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          numero_fiscal?: string | null
          numero_registre_commerce?: string | null
          pays?: string | null
          site_web?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          code?: string | null
          code_postal?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          numero_fiscal?: string | null
          numero_registre_commerce?: string | null
          pays?: string | null
          site_web?: string | null
          solde_actuel?: number | null
          solde_initial?: number | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fournisseurs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      irpp_brackets: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          max_amount: number | null
          min_amount: number
          order_index: number
          rate: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount: number
          order_index?: number
          rate: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number
          order_index?: number
          rate?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "irpp_brackets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mouvements_stock: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          date_mouvement: string
          depot: string | null
          id: string
          notes: string | null
          prix_unitaire: number | null
          produit_id: string
          quantite: number
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["mouvement_stock_type"]
          valeur_totale: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_mouvement?: string
          depot?: string | null
          id?: string
          notes?: string | null
          prix_unitaire?: number | null
          produit_id: string
          quantite: number
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["mouvement_stock_type"]
          valeur_totale?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_mouvement?: string
          depot?: string | null
          id?: string
          notes?: string | null
          prix_unitaire?: number | null
          produit_id?: string
          quantite?: number
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["mouvement_stock_type"]
          valeur_totale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mouvements_stock_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mouvements_stock_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      mouvements_tresorerie: {
        Row: {
          beneficiaire: string | null
          company_id: string
          compte_tresorerie_id: string
          created_at: string | null
          created_by: string | null
          date_mouvement: string
          id: string
          libelle: string
          montant: number
          moyen_paiement: string | null
          notes: string | null
          numero_piece: string | null
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["mouvement_tresorerie_type"]
        }
        Insert: {
          beneficiaire?: string | null
          company_id: string
          compte_tresorerie_id: string
          created_at?: string | null
          created_by?: string | null
          date_mouvement?: string
          id?: string
          libelle: string
          montant: number
          moyen_paiement?: string | null
          notes?: string | null
          numero_piece?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["mouvement_tresorerie_type"]
        }
        Update: {
          beneficiaire?: string | null
          company_id?: string
          compte_tresorerie_id?: string
          created_at?: string | null
          created_by?: string | null
          date_mouvement?: string
          id?: string
          libelle?: string
          montant?: number
          moyen_paiement?: string | null
          notes?: string | null
          numero_piece?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["mouvement_tresorerie_type"]
        }
        Relationships: [
          {
            foreignKeyName: "mouvements_tresorerie_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mouvements_tresorerie_compte_tresorerie_id_fkey"
            columns: ["compte_tresorerie_id"]
            isOneToOne: false
            referencedRelation: "comptes_tresorerie"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres_paie: {
        Row: {
          actif: boolean | null
          code: string
          company_id: string
          created_at: string | null
          id: string
          libelle: string
          type: string
          updated_at: string | null
          valeur: number
        }
        Insert: {
          actif?: boolean | null
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          libelle: string
          type?: string
          updated_at?: string | null
          valeur: number
        }
        Update: {
          actif?: boolean | null
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          libelle?: string
          type?: string
          updated_at?: string | null
          valeur?: number
        }
        Relationships: [
          {
            foreignKeyName: "parametres_paie_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      parc_actifs: {
        Row: {
          actif: boolean | null
          code: string | null
          company_id: string
          created_at: string | null
          date_acquisition: string | null
          duree_amortissement: number | null
          etat: string | null
          id: string
          immatriculation: string | null
          localisation: string | null
          marque: string | null
          modele: string | null
          nom: string
          notes: string | null
          numero_serie: string | null
          type: Database["public"]["Enums"]["parc_actif_type"]
          updated_at: string | null
          valeur_acquisition: number | null
          valeur_comptable: number | null
          valeur_residuelle: number | null
        }
        Insert: {
          actif?: boolean | null
          code?: string | null
          company_id: string
          created_at?: string | null
          date_acquisition?: string | null
          duree_amortissement?: number | null
          etat?: string | null
          id?: string
          immatriculation?: string | null
          localisation?: string | null
          marque?: string | null
          modele?: string | null
          nom: string
          notes?: string | null
          numero_serie?: string | null
          type: Database["public"]["Enums"]["parc_actif_type"]
          updated_at?: string | null
          valeur_acquisition?: number | null
          valeur_comptable?: number | null
          valeur_residuelle?: number | null
        }
        Update: {
          actif?: boolean | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          date_acquisition?: string | null
          duree_amortissement?: number | null
          etat?: string | null
          id?: string
          immatriculation?: string | null
          localisation?: string | null
          marque?: string | null
          modele?: string | null
          nom?: string
          notes?: string | null
          numero_serie?: string | null
          type?: Database["public"]["Enums"]["parc_actif_type"]
          updated_at?: string | null
          valeur_acquisition?: number | null
          valeur_comptable?: number | null
          valeur_residuelle?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parc_actifs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      parc_affectations: {
        Row: {
          actif_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          date_debut: string
          date_fin: string | null
          employe_id: string | null
          id: string
          notes: string | null
          statut: Database["public"]["Enums"]["parc_affectation_statut"] | null
          updated_at: string | null
        }
        Insert: {
          actif_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          date_debut: string
          date_fin?: string | null
          employe_id?: string | null
          id?: string
          notes?: string | null
          statut?: Database["public"]["Enums"]["parc_affectation_statut"] | null
          updated_at?: string | null
        }
        Update: {
          actif_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          date_debut?: string
          date_fin?: string | null
          employe_id?: string | null
          id?: string
          notes?: string | null
          statut?: Database["public"]["Enums"]["parc_affectation_statut"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parc_affectations_actif_id_fkey"
            columns: ["actif_id"]
            isOneToOne: false
            referencedRelation: "parc_actifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parc_affectations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parc_affectations_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_id: string | null
          amount: number
          company_id: string
          created_at: string | null
          date: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          reference: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          company_id: string
          created_at?: string | null
          date: string
          id?: string
          invoice_id?: string | null
          method: string
          notes?: string | null
          reference?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          company_id?: string
          created_at?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_settings: {
        Row: {
          archive_path: string | null
          bonus_subject_cnss: boolean | null
          bonus_taxable: boolean | null
          child_deduction: number
          cnss_active: boolean | null
          cnss_ceiling: number | null
          cnss_rate_employee: number
          company_id: string
          confidential_label: boolean | null
          created_at: string | null
          css_exemption_threshold: number | null
          css_rate: number
          currency: string | null
          default_children_count: number | null
          default_cnss_active: boolean | null
          default_contract_type: string | null
          default_fiscal_status: string | null
          default_head_family: boolean | null
          default_payment_method: string | null
          family_deduction: number
          id: string
          irpp_professional_cap: number
          irpp_professional_rate: number
          overtime_rate_1: number | null
          overtime_rate_2: number | null
          overtime_threshold: number | null
          pay_frequency: string | null
          payslip_language: string | null
          retention_period: number | null
          secure_access: boolean | null
          show_signature: boolean | null
          show_stamp: boolean | null
          updated_at: string | null
        }
        Insert: {
          archive_path?: string | null
          bonus_subject_cnss?: boolean | null
          bonus_taxable?: boolean | null
          child_deduction?: number
          cnss_active?: boolean | null
          cnss_ceiling?: number | null
          cnss_rate_employee?: number
          company_id: string
          confidential_label?: boolean | null
          created_at?: string | null
          css_exemption_threshold?: number | null
          css_rate?: number
          currency?: string | null
          default_children_count?: number | null
          default_cnss_active?: boolean | null
          default_contract_type?: string | null
          default_fiscal_status?: string | null
          default_head_family?: boolean | null
          default_payment_method?: string | null
          family_deduction?: number
          id?: string
          irpp_professional_cap?: number
          irpp_professional_rate?: number
          overtime_rate_1?: number | null
          overtime_rate_2?: number | null
          overtime_threshold?: number | null
          pay_frequency?: string | null
          payslip_language?: string | null
          retention_period?: number | null
          secure_access?: boolean | null
          show_signature?: boolean | null
          show_stamp?: boolean | null
          updated_at?: string | null
        }
        Update: {
          archive_path?: string | null
          bonus_subject_cnss?: boolean | null
          bonus_taxable?: boolean | null
          child_deduction?: number
          cnss_active?: boolean | null
          cnss_ceiling?: number | null
          cnss_rate_employee?: number
          company_id?: string
          confidential_label?: boolean | null
          created_at?: string | null
          css_exemption_threshold?: number | null
          css_rate?: number
          currency?: string | null
          default_children_count?: number | null
          default_cnss_active?: boolean | null
          default_contract_type?: string | null
          default_fiscal_status?: string | null
          default_head_family?: boolean | null
          default_payment_method?: string | null
          family_deduction?: number
          id?: string
          irpp_professional_cap?: number
          irpp_professional_rate?: number
          overtime_rate_1?: number | null
          overtime_rate_2?: number | null
          overtime_threshold?: number | null
          pay_frequency?: string | null
          payslip_language?: string | null
          retention_period?: number | null
          secure_access?: boolean | null
          show_signature?: boolean | null
          show_stamp?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          bonuses: number | null
          cnss: number
          company_id: string
          created_at: string | null
          created_by: string | null
          css: number
          employee_id: string
          family_situation: string | null
          gross_salary: number
          id: string
          irpp: number
          month: number
          net_salary: number
          number_of_children: number | null
          overtime: number | null
          pdf_file_path: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          bonuses?: number | null
          cnss: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          css: number
          employee_id: string
          family_situation?: string | null
          gross_salary: number
          id?: string
          irpp: number
          month: number
          net_salary: number
          number_of_children?: number | null
          overtime?: number | null
          pdf_file_path?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          bonuses?: number | null
          cnss?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          css?: number
          employee_id?: string
          family_situation?: string | null
          gross_salary?: number
          id?: string
          irpp?: number
          month?: number
          net_salary?: number
          number_of_children?: number | null
          overtime?: number | null
          pdf_file_path?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payslips_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          active: boolean | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          code: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          purchase_price: number | null
          sale_price: number
          stockable: boolean | null
          tax_rate: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          purchase_price?: number | null
          sale_price: number
          stockable?: boolean | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          purchase_price?: number | null
          sale_price?: number
          stockable?: boolean | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      produits: {
        Row: {
          actif: boolean | null
          categorie: string | null
          code: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          nom: string
          prix_achat: number | null
          prix_vente: number
          stock_actuel: number | null
          stock_minimum: number | null
          stockable: boolean | null
          taux_tva: number | null
          type: Database["public"]["Enums"]["produit_type"]
          unite: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          categorie?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          prix_achat?: number | null
          prix_vente: number
          stock_actuel?: number | null
          stock_minimum?: number | null
          stockable?: boolean | null
          taux_tva?: number | null
          type?: Database["public"]["Enums"]["produit_type"]
          unite?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          categorie?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          prix_achat?: number | null
          prix_vente?: number
          stock_actuel?: number | null
          stock_minimum?: number | null
          stockable?: boolean | null
          taux_tva?: number | null
          type?: Database["public"]["Enums"]["produit_type"]
          unite?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          product_id: string | null
          purchase_order_id: string
          quantity: number
          tax_rate: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          product_id?: string | null
          purchase_order_id: string
          quantity: number
          tax_rate?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          product_id?: string | null
          purchase_order_id?: string
          quantity?: number
          tax_rate?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          product_id: string | null
          quantity: number
          quote_id: string
          service_id: string | null
          tax_rate: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          product_id?: string | null
          quantity: number
          quote_id: string
          service_id?: string | null
          tax_rate?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string
          service_id?: string | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_id: string
          company_id: string
          created_at: string | null
          date: string
          expires_at: string | null
          id: string
          notes: string | null
          number: string
          status: string
          subtotal: number | null
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string | null
          date: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          number: string
          status?: string
          subtotal?: number | null
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string | null
          date?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          number?: string
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: string
          module_code: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_code: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_code?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      salaires: {
        Row: {
          company_id: string
          compte_tresorerie_id: string | null
          cotisations_patronales: number | null
          cotisations_salariales: number | null
          created_at: string | null
          created_by: string | null
          date_paiement: string
          employe_id: string
          id: string
          net_a_payer: number
          notes: string | null
          numero: string | null
          paye: boolean | null
          periode_debut: string
          periode_fin: string
          prime: number | null
          retenues: number | null
          salaire_brut: number
          salaire_net: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          compte_tresorerie_id?: string | null
          cotisations_patronales?: number | null
          cotisations_salariales?: number | null
          created_at?: string | null
          created_by?: string | null
          date_paiement: string
          employe_id: string
          id?: string
          net_a_payer: number
          notes?: string | null
          numero?: string | null
          paye?: boolean | null
          periode_debut: string
          periode_fin: string
          prime?: number | null
          retenues?: number | null
          salaire_brut: number
          salaire_net: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          compte_tresorerie_id?: string | null
          cotisations_patronales?: number | null
          cotisations_salariales?: number | null
          created_at?: string | null
          created_by?: string | null
          date_paiement?: string
          employe_id?: string
          id?: string
          net_a_payer?: number
          notes?: string | null
          numero?: string | null
          paye?: boolean | null
          periode_debut?: string
          periode_fin?: string
          prime?: number | null
          retenues?: number | null
          salaire_brut?: number
          salaire_net?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salaires_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salaires_compte_tresorerie_id_fkey"
            columns: ["compte_tresorerie_id"]
            isOneToOne: false
            referencedRelation: "comptes_tresorerie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salaires_employe_id_fkey"
            columns: ["employe_id"]
            isOneToOne: false
            referencedRelation: "employes"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          billing_type: string | null
          category_id: string | null
          code: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          billing_type?: string | null
          category_id?: string | null
          code?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          billing_type?: string | null
          category_id?: string | null
          code?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      taxes: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name: string
          type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tranches_irpp: {
        Row: {
          actif: boolean | null
          company_id: string
          created_at: string | null
          id: string
          ordre: number
          taux: number
          tranche_max: number | null
          tranche_min: number
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          ordre: number
          taux: number
          tranche_max?: number | null
          tranche_min?: number
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          ordre?: number
          taux?: number
          tranche_max?: number | null
          tranche_min?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tranches_irpp_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          company_id: string
          created_at: string | null
          id: string
          module_code: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          module_code: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          module_code?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          active: boolean | null
          address: string | null
          capacity: number | null
          city: string | null
          company_id: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          manager: string | null
          name: string
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          capacity?: number | null
          city?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          manager?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          capacity?: number | null
          city?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          manager?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company_and_link_profile: {
        Args: {
          _address?: string
          _currency?: string
          _email?: string
          _language?: string
          _name: string
          _phone?: string
          _tax_number?: string
        }
        Returns: string
      }
      create_default_payroll_params: {
        Args: { _company_id: string }
        Returns: undefined
      }
      create_default_taxes: {
        Args: { _company_id: string }
        Returns: undefined
      }
      format_document_number: {
        Args: { p_date?: string; p_number: number; p_type: string }
        Returns: string
      }
      get_next_document_number: { Args: never; Returns: number }
      get_next_formatted_document_number: {
        Args: { p_date?: string; p_type: string }
        Returns: string
      }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_company_id_from_roles: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      init_default_payroll_settings: {
        Args: { _company_id: string }
        Returns: undefined
      }
      reset_document_number_sequence: {
        Args: { p_start_value?: number }
        Returns: undefined
      }
      user_belongs_to_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_admin_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_hr_or_admin_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "user"
        | "accountant"
        | "hr"
        | "sales"
        | "superadmin"
      ecriture_ligne_type: "debit" | "credit"
      facture_statut: "brouillon" | "validee" | "annulee" | "payee"
      mouvement_stock_type: "entree" | "sortie"
      mouvement_tresorerie_type: "entree" | "sortie"
      parc_actif_type: "vehicule" | "materiel" | "immobilier" | "autre"
      parc_affectation_statut: "active" | "terminee"
      produit_type: "produit" | "service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "manager",
        "user",
        "accountant",
        "hr",
        "sales",
        "superadmin",
      ],
      ecriture_ligne_type: ["debit", "credit"],
      facture_statut: ["brouillon", "validee", "annulee", "payee"],
      mouvement_stock_type: ["entree", "sortie"],
      mouvement_tresorerie_type: ["entree", "sortie"],
      parc_actif_type: ["vehicule", "materiel", "immobilier", "autre"],
      parc_affectation_statut: ["active", "terminee"],
      produit_type: ["produit", "service"],
    },
  },
} as const
