export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  balance: number; // positive = customer owes us (debit balance), negative = credit balance
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export type InvoiceStatus = 'draft' | 'unpaid' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  items: InvoiceItem[];
  notes?: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'other';

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type LedgerEntryType = 'debit' | 'credit';
export type LedgerReferenceType = 'invoice' | 'payment' | 'adjustment' | 'opening_balance';

export interface LedgerEntry {
  id: string;
  customerId?: string; // Optional for general ledger, required for customer ledger
  customerName?: string;
  date: string;
  description: string;
  type: LedgerEntryType; // debit = increases balance (invoicing), credit = decreases balance (payments)
  amount: number;
  runningBalance: number;
  referenceId?: string; // Invoice ID or Payment ID
  referenceType: LedgerReferenceType;
}

export interface DashboardStats {
  totalRevenue: number;
  outstandingAmount: number;
  activeCustomersCount: number;
  paidInvoicesCount: number;
  unpaidInvoicesCount: number;
  revenueChangePercent: number;
  outstandingChangePercent: number;
  customerChangePercent: number;
}
