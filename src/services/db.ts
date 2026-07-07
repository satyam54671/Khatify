import type { Customer, Invoice, Payment, LedgerEntry, DashboardStats, InvoiceStatus } from '../types';
import { generateId, generateInvoiceNumber } from '../utils';

// Helper to delay responses for realistic TanStack Query loading states
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  CUSTOMERS: 'khatify_customers',
  INVOICES: 'khatify_invoices',
  PAYMENTS: 'khatify_payments',
  LEDGER: 'khatify_ledger',
};

// Initial Seed Data
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 019-2834',
    address: '123 Industrial Parkway, Suite 400, Chicago, IL 60607',
    balance: 1250,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Stark Industries',
    email: 'finance@stark.com',
    phone: '+1 (555) 284-9102',
    address: '10880 Malibu Point, Malibu, CA 90265',
    balance: 0,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c3',
    name: 'Wayne Enterprises',
    email: 'accounts@waynecorp.com',
    phone: '+1 (555) 732-9011',
    address: '1007 Mountain Drive, Gotham City, NJ 07001',
    balance: 5000,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c4',
    name: 'Globex Corporation',
    email: 'info@globex.org',
    phone: '+1 (555) 438-2910',
    address: '1000 Cypress Creek Rd, Cypress Creek, OR 97401',
    balance: -450, // Credit balance (overpaid)
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'i1',
    customerId: 'c1',
    customerName: 'Acme Corporation',
    invoiceNumber: 'INV-0001',
    amount: 1250,
    status: 'unpaid',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item1', description: 'Cloud Infrastructure Setup Services', quantity: 1, price: 1000 },
      { id: 'item2', description: 'Monthly Premium Support Tier', quantity: 1, price: 250 },
    ],
    notes: 'Payment terms: Net 15 days.',
  },
  {
    id: 'i2',
    customerId: 'c2',
    customerName: 'Stark Industries',
    invoiceNumber: 'INV-0002',
    amount: 3500,
    status: 'paid',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item3', description: 'Arc Reactor Integration Analysis', quantity: 1, price: 3500 },
    ],
    notes: 'Invoice settled in full.',
  },
  {
    id: 'i3',
    customerId: 'c3',
    customerName: 'Wayne Enterprises',
    invoiceNumber: 'INV-0003',
    amount: 5000,
    status: 'overdue',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item4', description: 'Tactical Sub-suit Composite Engineering', quantity: 1, price: 5000 },
    ],
    notes: 'Please expedite payment.',
  },
  {
    id: 'i4',
    customerId: 'c4',
    customerName: 'Globex Corporation',
    invoiceNumber: 'INV-0004',
    amount: 1500,
    status: 'paid',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item5', description: 'Satellite Communications Consultation', quantity: 1, price: 1500 },
    ],
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    customerId: 'c2',
    customerName: 'Stark Industries',
    invoiceId: 'i2',
    invoiceNumber: 'INV-0002',
    amount: 3500,
    method: 'bank_transfer',
    notes: 'Wire transfer ref #STARK-88192A',
    createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    customerId: 'c4',
    customerName: 'Globex Corporation',
    invoiceId: 'i4',
    invoiceNumber: 'INV-0004',
    amount: 1950, // paid 1950 for 1500 invoice, resulting in 450 credit balance
    method: 'card',
    notes: 'Online credit card payment. Overpaid $450 to credit future ledger transactions.',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  // Acme Corporation Ledger
  {
    id: 'l1',
    customerId: 'c1',
    customerName: 'Acme Corporation',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Invoiced INV-0001 (Cloud Infrastructure Setup Services)',
    type: 'debit',
    amount: 1250,
    runningBalance: 1250,
    referenceId: 'i1',
    referenceType: 'invoice',
  },
  // Stark Industries Ledger
  {
    id: 'l2',
    customerId: 'c2',
    customerName: 'Stark Industries',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Invoiced INV-0002 (Arc Reactor Integration Analysis)',
    type: 'debit',
    amount: 3500,
    runningBalance: 3500,
    referenceId: 'i2',
    referenceType: 'invoice',
  },
  {
    id: 'l3',
    customerId: 'c2',
    customerName: 'Stark Industries',
    date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Payment received for INV-0002 [Wire transfer ref #STARK-88192A]',
    type: 'credit',
    amount: 3500,
    runningBalance: 0,
    referenceId: 'p1',
    referenceType: 'payment',
  },
  // Wayne Enterprises Ledger
  {
    id: 'l4',
    customerId: 'c3',
    customerName: 'Wayne Enterprises',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Invoiced INV-0003 (Tactical Sub-suit Composite Engineering)',
    type: 'debit',
    amount: 5000,
    runningBalance: 5000,
    referenceId: 'i3',
    referenceType: 'invoice',
  },
  // Globex Corporation Ledger
  {
    id: 'l5',
    customerId: 'c4',
    customerName: 'Globex Corporation',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Invoiced INV-0004 (Satellite Communications Consultation)',
    type: 'debit',
    amount: 1500,
    runningBalance: 1500,
    referenceId: 'i4',
    referenceType: 'invoice',
  },
  {
    id: 'l6',
    customerId: 'c4',
    customerName: 'Globex Corporation',
    date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Payment received for INV-0004 [Online credit card payment]',
    type: 'credit',
    amount: 1950,
    runningBalance: -450,
    referenceId: 'p2',
    referenceType: 'payment',
  },
];

// Database initialisation check
export function initDb() {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(INITIAL_LEDGER));
  }
}

// Helper readers and writers
function readData<T>(key: string): T[] {
  initDb();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function writeData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// API Services
export const dbService = {
  // --- CUSTOMERS ---
  async getCustomers(): Promise<Customer[]> {
    await delay();
    return readData<Customer>(STORAGE_KEYS.CUSTOMERS);
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    await delay();
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.find(c => c.id === id);
  },

  async createCustomer(customerData: Omit<Customer, 'id' | 'balance' | 'createdAt'>): Promise<Customer> {
    await delay();
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);
    const newCustomer: Customer = {
      ...customerData,
      id: 'c_' + generateId(),
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    writeData(STORAGE_KEYS.CUSTOMERS, customers);

    // Add opening balance ledger entry
    const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
    const newLedgerEntry: LedgerEntry = {
      id: 'l_' + generateId(),
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      date: new Date().toISOString(),
      description: 'Account opened',
      type: 'credit', // Credit of 0
      amount: 0,
      runningBalance: 0,
      referenceType: 'opening_balance',
    };
    ledger.push(newLedgerEntry);
    writeData(STORAGE_KEYS.LEDGER, ledger);

    return newCustomer;
  },

  async updateCustomer(id: string, update: Partial<Omit<Customer, 'id' | 'balance' | 'createdAt'>>): Promise<Customer> {
    await delay();
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const updated = { ...customers[index], ...update };
    customers[index] = updated;
    writeData(STORAGE_KEYS.CUSTOMERS, customers);

    // Also update customer name in related invoices, payments, and ledger logs
    if (update.name) {
      const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);
      writeData(STORAGE_KEYS.INVOICES, invoices.map(i => i.customerId === id ? { ...i, customerName: update.name! } : i));

      const payments = readData<Payment>(STORAGE_KEYS.PAYMENTS);
      writeData(STORAGE_KEYS.PAYMENTS, payments.map(p => p.customerId === id ? { ...p, customerName: update.name! } : p));

      const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
      writeData(STORAGE_KEYS.LEDGER, ledger.map(l => l.customerId === id ? { ...l, customerName: update.name! } : l));
    }

    return updated;
  },

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    await delay();
    return readData<Invoice>(STORAGE_KEYS.INVOICES);
  },

  async getInvoice(id: string): Promise<Invoice | undefined> {
    await delay();
    const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);
    return invoices.find(i => i.id === id);
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<Invoice> {
    await delay();
    const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);

    const customer = customers.find(c => c.id === invoiceData.customerId);
    if (!customer) throw new Error('Customer not found');

    const nextInvoiceNumber = generateInvoiceNumber(invoices.length);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: 'i_' + generateId(),
      invoiceNumber: nextInvoiceNumber,
      createdAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    writeData(STORAGE_KEYS.INVOICES, invoices);

    // Update Customer Balance (Invoicing DEBITS the customer balance)
    customer.balance += newInvoice.amount;
    writeData(STORAGE_KEYS.CUSTOMERS, customers);

    // Write to Ledger
    const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
    const newLedgerEntry: LedgerEntry = {
      id: 'l_' + generateId(),
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString(),
      description: `Invoiced ${newInvoice.invoiceNumber} (${newInvoice.items.map(it => it.description).join(', ')})`,
      type: 'debit',
      amount: newInvoice.amount,
      runningBalance: customer.balance,
      referenceId: newInvoice.id,
      referenceType: 'invoice',
    };
    ledger.push(newLedgerEntry);
    writeData(STORAGE_KEYS.LEDGER, ledger);

    return newInvoice;
  },

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    await delay();
    const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);
    const idx = invoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Invoice not found');

    invoices[idx].status = status;
    writeData(STORAGE_KEYS.INVOICES, invoices);
    return invoices[idx];
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<Payment[]> {
    await delay();
    return readData<Payment>(STORAGE_KEYS.PAYMENTS);
  },

  async recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    await delay();
    const payments = readData<Payment>(STORAGE_KEYS.PAYMENTS);
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);
    const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);

    const customer = customers.find(c => c.id === paymentData.customerId);
    if (!customer) throw new Error('Customer not found');

    const newPayment: Payment = {
      ...paymentData,
      id: 'p_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    writeData(STORAGE_KEYS.PAYMENTS, payments);

    // Update Invoice Status if linked
    if (newPayment.invoiceId) {
      const invoice = invoices.find(i => i.id === newPayment.invoiceId);
      if (invoice) {
        // If payment matches or exceeds amount, mark paid. In a full system we'd check previous payments,
        // here we'll check if the amount recorded is >= invoice amount or close to it.
        // Let's mark it as Paid.
        invoice.status = 'paid';
        writeData(STORAGE_KEYS.INVOICES, invoices);
      }
    }

    // Update Customer Balance (Payment CREDITS the customer balance, reducing what they owe us)
    customer.balance -= newPayment.amount;
    writeData(STORAGE_KEYS.CUSTOMERS, customers);

    // Write to Ledger
    const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
    const refDesc = newPayment.invoiceNumber ? ` for ${newPayment.invoiceNumber}` : '';
    const newLedgerEntry: LedgerEntry = {
      id: 'l_' + generateId(),
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString(),
      description: `Payment received${refDesc}${newPayment.notes ? ' [' + newPayment.notes + ']' : ''}`,
      type: 'credit',
      amount: newPayment.amount,
      runningBalance: customer.balance,
      referenceId: newPayment.id,
      referenceType: 'payment',
    };
    ledger.push(newLedgerEntry);
    writeData(STORAGE_KEYS.LEDGER, ledger);

    return newPayment;
  },

  // --- LEDGER ---
  async getLedgerEntries(): Promise<LedgerEntry[]> {
    await delay();
    // Return all entries sorted by date descending
    const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
    return [...ledger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getCustomerLedgerEntries(customerId: string): Promise<LedgerEntry[]> {
    await delay();
    const ledger = readData<LedgerEntry>(STORAGE_KEYS.LEDGER);
    const customerLedger = ledger.filter(l => l.customerId === customerId);

    // Recalculate running balance specifically for this customer chronologically
    const sortedChronological = [...customerLedger].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    const entriesWithRunningBalance = sortedChronological.map(entry => {
      if (entry.type === 'debit') {
        currentBalance += entry.amount;
      } else {
        currentBalance -= entry.amount;
      }
      return { ...entry, runningBalance: currentBalance };
    });

    // Return descending sorted for easier UI rendering (latest first)
    return entriesWithRunningBalance.reverse();
  },

  // --- DASHBOARD ---
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    const invoices = readData<Invoice>(STORAGE_KEYS.INVOICES);
    const customers = readData<Customer>(STORAGE_KEYS.CUSTOMERS);

    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const outstandingAmount = customers
      .reduce((sum, c) => sum + Math.max(0, c.balance), 0);

    const activeCustomersCount = customers.length;
    const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
    const unpaidInvoicesCount = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;

    return {
      totalRevenue,
      outstandingAmount,
      activeCustomersCount,
      paidInvoicesCount,
      unpaidInvoicesCount,
      revenueChangePercent: 12.5,     // Mock monthly changes
      outstandingChangePercent: -4.2, // Mock monthly changes
      customerChangePercent: 8.3,     // Mock monthly changes
    };
  },
};
