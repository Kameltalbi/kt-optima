// ============================================
// BILVOXA ERP - DATABASE SCHEMA TYPES
// ============================================

// CORE SYSTEM
export interface Company {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  tax_number: string;
  currency: string;
  language: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// MODULE 1: CLIENTS & SUPPLIERS
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_number?: string;
  company_id: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_number?: string;
  company_id: string;
  balance: number;
}

export interface SupplierInvoice {
  id: string;
  number: string;
  supplier_id: string;
  date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

// MODULE 2: PRODUCTS & SERVICES (REFERENTIEL GLOBAL)
export interface Product {
  id: string;
  code: string; // Code produit
  name: string; // Libellé
  category_id?: string; // Catégorie
  purchase_price?: number; // Prix d'achat
  sale_price: number; // Prix de vente
  tax_rate: number; // TVA
  unit?: string; // Unité (pièce, kg, m, etc.)
  stockable: boolean; // Produit stockable (oui / non)
  active: boolean; // Actif / inactif
  description?: string;
  sku?: string; // Ancien champ, gardé pour compatibilité
  cost?: number; // Ancien champ, gardé pour compatibilité
  price?: number; // Ancien champ, gardé pour compatibilité
  category?: string; // Ancien champ, gardé pour compatibilité
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  code: string; // Code service
  name: string; // Libellé
  category_id?: string; // Catégorie
  price: number; // Prix de vente
  tax_rate: number; // TVA
  billing_type: 'fixed' | 'duration'; // Type de facturation (forfait / durée)
  active: boolean; // Actif / inactif
  description?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string; // Nom de la catégorie
  type: 'product' | 'service'; // Type : Produit ou Service
  description?: string; // Description optionnelle
  active: boolean; // Actif / inactif
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

// MODULE 3: INVOICING & SALES
export interface Invoice {
  id: string;
  number: string;
  client_id: string;
  date: string;
  total: number;
  tax: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  company_id: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_or_service: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank' | 'check' | 'card';
}

// AVOIRS (CREDITS)
export interface SupplierCredit {
  id: string;
  number: string;
  supplier_invoice_id: string; // Facture d'origine obligatoire
  supplier_id: string;
  date: string;
  type: 'full' | 'partial'; // Avoir total ou partiel
  reason: 'return' | 'price_error' | 'commercial_discount' | 'other'; // Motif
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'applied'; // applied = imputé sur échéancier
  stock_impact: boolean; // Si retour marchandise
  comments?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreditItem {
  id: string;
  supplier_credit_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface ClientCredit {
  id: string;
  number: string;
  invoice_id: string; // Facture d'origine obligatoire
  client_id: string;
  date: string;
  type: 'full' | 'partial'; // Avoir total ou partiel
  reason: 'return' | 'commercial_gesture' | 'billing_error' | 'other'; // Motif
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'applied' | 'refunded'; // applied = imputé, refunded = remboursé
  stock_impact: boolean; // Si retour marchandise
  refund_method?: 'future_invoice' | 'cash_refund'; // Méthode de remboursement
  comments?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreditItem {
  id: string;
  client_credit_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

// MODULE: CRM (CUSTOMER RELATIONSHIP MANAGEMENT)
export interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  position?: string; // Fonction/poste (colonne: position)
  crm_company_id?: string; // Société liée (colonne: crm_company_id)
  tags?: string[]; // Tags pour catégorisation
  notes?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  // Aliases pour compatibilité avec le code existant
  firstName?: string;
  lastName?: string;
  function?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMCompany {
  id: string;
  name: string; // Raison sociale
  tax_number?: string; // Matricule fiscal (colonne: tax_number)
  address?: string;
  phone?: string;
  email?: string;
  sector?: string; // Secteur d'activité
  sales_rep_id?: string; // Responsable commercial (colonne: sales_rep_id)
  website?: string;
  notes?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  // Aliases pour compatibilité avec le code existant
  taxNumber?: string;
  salesRepId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMOpportunity {
  id: string;
  name: string; // Nom de l'opportunité
  crm_company_id: string; // Société (colonne: crm_company_id)
  crm_contact_id?: string; // Contact principal (colonne: crm_contact_id)
  estimated_amount: number; // Montant estimé (colonne: estimated_amount)
  probability: number; // Probabilité (0-100)
  expected_close_date?: string; // Date de conclusion prévue (colonne: expected_close_date)
  sales_rep_id?: string; // Responsable (colonne: sales_rep_id)
  stage: 'new' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost'; // Étape
  status: 'active' | 'won' | 'lost'; // Statut global
  quote_id?: string; // Devis généré (colonne: quote_id)
  description?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  // Aliases pour compatibilité avec le code existant
  companyId?: string;
  contactId?: string;
  estimatedAmount?: number;
  expectedCloseDate?: string;
  salesRepId?: string;
  quoteId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'task'; // Type d'activité
  subject: string; // Sujet
  crm_contact_id?: string; // Contact lié (colonne: crm_contact_id)
  crm_company_id?: string; // Société liée (colonne: crm_company_id)
  crm_opportunity_id?: string; // Opportunité liée (colonne: crm_opportunity_id)
  date: string; // Date
  time?: string; // Heure
  duration?: number; // Durée en minutes
  sales_rep_id?: string; // Responsable (colonne: sales_rep_id)
  description?: string; // Commentaire
  completed: boolean; // Tâche complétée
  company_id: string;
  created_at: string;
  updated_at: string;
  // Aliases pour compatibilité avec le code existant
  contactId?: string;
  companyId?: string;
  opportunityId?: string;
  salesRepId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// MODULE 4: CASH FLOW / TREASURY
export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'savings';
  balance: number;
  company_id: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

// MODULE 5: PROJECTS & BUDGETS
export interface Project {
  id: string;
  name: string;
  client_id: string;
  budget: number;
  company_id: string;
  status: 'active' | 'completed' | 'on-hold';
}

export interface ProjectExpense {
  id: string;
  project_id: string;
  amount: number;
  description: string;
  date: string;
}

// MODULE 6: REPORTING
export interface Report {
  id: string;
  type: 'revenue' | 'expenses' | 'profit';
  period: string;
  company_id: string;
}

// MODULE 7: STOCK & PURCHASES
export interface StockItem {
  id: string;
  product_id: string;
  quantity: number;
  company_id: string;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  total: number;
  date: string;
  company_id: string;
}

// MODULE 8: HR & INTERNAL EXPENSES
export interface Employee {
  id: string;
  name: string;
  position: string;
  company_id: string;
}

export interface Expense {
  id: string;
  employee_id: string;
  amount: number;
  category: string;
  date: string;
}

// MODULE 12: HR ADVANCED - RESSOURCES HUMAINES AVANCÉ
export interface HREmployee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  cin: string; // Carte d'identité nationale
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'suspended';
  managerId?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRContract {
  id: string;
  employee_id: string;
  type: 'cdi' | 'cdd' | 'stage' | 'consultant';
  startDate: string;
  endDate?: string; // Optionnel pour CDI
  salary: number;
  position: string;
  department: string;
  status: 'active' | 'expired' | 'terminated';
  terminationDate?: string;
  terminationReason?: string;
  contractFileUrl?: string; // URL du fichier contrat (PDF ou image)
  contractFileName?: string; // Nom du fichier original
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  contract_id: string;
  period: string; // Format: YYYY-MM
  date: string;
  salaryBrut: number;
  cotisations: {
    cnss: number;
    assurance: number;
    retraite: number;
    autres: number;
  };
  retenues: {
    irpp: number; // Impôt sur le revenu
    autres: number;
  };
  avantages: {
    prime: number;
    indemnites: number;
    autres: number;
  };
  netAPayer: number;
  statut: 'draft' | 'validated' | 'paid';
  bulletinGenerated: boolean;
  accountingEntryId?: string; // Référence à l'écriture comptable
  financeScheduleId?: string; // Référence à l'échéancier Finance
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;
  annualTotal: number;
  annualUsed: number;
  annualRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  company_id: string;
  updatedAt: string;
}

export interface HRDocument {
  id: string;
  employee_id?: string; // Optionnel pour documents généraux
  name: string;
  type: 'contract' | 'cv' | 'diploma' | 'certificate' | 'evaluation' | 'disciplinary' | 'other';
  category: 'personal' | 'professional' | 'administrative' | 'confidential';
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
  accessLevel: 'public' | 'hr' | 'manager' | 'confidential';
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  employee_id: string;
  campaignId: string;
  campaignName: string;
  period: string; // Format: YYYY ou YYYY-Q1, etc.
  evaluatorId: string;
  evaluatorName: string;
  date: string;
  objectives: {
    id: string;
    description: string;
    target: string;
    achievement: string;
    rating: number; // 1-5
  }[];
  competencies: {
    id: string;
    name: string;
    rating: number; // 1-5
    comment?: string;
  }[];
  overallRating: number; // 1-5
  strengths: string[];
  areasForImprovement: string[];
  comments: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'validated';
  employeeComments?: string;
  validatedBy?: string;
  validatedDate?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationCampaign {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

// MODULE 9: SIMPLE ACCOUNTING
export interface Journal {
  id: string;
  type: 'sales' | 'purchases' | 'treasury';
  amount: number;
  date: string;
  company_id: string;
}

export interface VAT {
  id: string;
  collected: number;
  deductible: number;
  period: string;
  company_id: string;
}

// MODULE 10: DOCUMENTS
export interface Document {
  id: string;
  name: string;
  type: string;
  file_path: string;
  company_id: string;
}

// MODULE 11: NOTIFICATIONS
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  company_id: string;
}

// MODULE 12: GESTION DE PARC (FLEET MANAGEMENT)
export interface Equipment {
  id: string;
  name: string;
  category: 'vehicle' | 'machine' | 'it' | 'other';
  reference: string; // Matricule / Référence
  acquisitionDate: string;
  status: 'active' | 'inactive';
  warehouseId?: string; // Dépôt
  department?: string; // Service
  employeeId?: string; // Employé (optionnel)
  comments?: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  warehouseId?: string;
  department?: string;
  employeeId?: string;
  startDate: string;
  endDate?: string; // null si affectation active
  comments?: string;
  company_id: string;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  equipmentId: string;
  date: string;
  type: 'maintenance' | 'repair' | 'inspection';
  description: string;
  cost: number;
  nextDueDate?: string; // Prochaine échéance
  company_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetAlert {
  id: string;
  equipmentId: string;
  type: 'upcoming_maintenance' | 'overdue_maintenance' | 'inactive_equipment';
  message: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  company_id: string;
  createdAt: string;
}
