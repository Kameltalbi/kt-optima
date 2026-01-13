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

// MODULE 2: PRODUCTS & SERVICES
export interface Product {
  id: string;
  name: string;
  price: number;
  tax_rate: number;
  category: string;
  company_id: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  tax_rate: number;
  company_id: string;
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
