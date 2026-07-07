import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dbService } from '@/services/db';
import type { Customer, Invoice, InvoiceItem, InvoiceStatus } from '@/types';
import { formatCurrency, formatDate, generateId } from '@/utils';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Search,
  Plus,
  FileText,
  Printer,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  CheckCircle,
  Eye,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

// Form validation schemas
const invoiceItemSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Min 1'),
  price: z.coerce.number().min(0.01, 'Min $0.01'),
});

const invoiceFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  dueDate: z.string().min(1, 'Please specify a due date'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function Invoices() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation states based on query parameters
  const viewMode = searchParams.get('create') === 'true'
    ? 'create'
    : searchParams.get('id')
      ? 'view'
      : 'list';
  const activeInvoiceId = searchParams.get('id');

  // List states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Queries
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: dbService.getInvoices,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: dbService.getCustomers,
  });

  const { data: activeInvoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['invoice', activeInvoiceId],
    queryFn: () => dbService.getInvoice(activeInvoiceId!),
    enabled: !!activeInvoiceId && viewMode === 'view',
  });

  // React Hook Form for Invoice Creation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, price: 0 }],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Thank you for your business!',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Dynamically calculate subtotals and totals in form creation mode
  const watchItems = watch('items');
  const totalAmount = watchItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + (qty * price);
  }, 0) || 0;

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: dbService.createInvoice,
    onSuccess: (newInv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      reset();
      setViewParams({ id: newInv.id }); // view the newly created invoice
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => dbService.updateInvoiceStatus(id, 'paid'),
    onSuccess: (updatedInv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', updatedInv.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  // Navigation helpers
  const setViewParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, val]) => {
      if (val === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    setSearchParams(newParams);
  };

  const handleCreateInvoice = (values: InvoiceFormValues) => {
    const customerObj = customers.find(c => c.id === values.customerId);
    if (!customerObj) return;

    const invoiceItems: InvoiceItem[] = values.items.map(item => ({
      id: 'it_' + generateId(),
      description: item.description,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    createInvoiceMutation.mutate({
      customerId: values.customerId,
      customerName: customerObj.name,
      amount: totalAmount,
      status: 'unpaid',
      dueDate: values.dueDate,
      items: invoiceItems,
      notes: values.notes,
    });
  };

  // Form check for query params (e.g. if navigation from dashboard triggers add invoice screen)
  useEffect(() => {
    const isCreateParam = searchParams.get('create') === 'true';
    if (!isCreateParam && viewMode === 'create') {
      reset();
    }
  }, [searchParams, viewMode]);

  // Statistics calculation for Invoice List
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collected = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ----------------------------------------------------
  // RENDER STATE: Create Invoice Form
  // ----------------------------------------------------
  if (viewMode === 'create') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewParams({ create: null })} className="gap-1.5 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
        </div>

        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Create Invoice</h2>
            <p className="text-sm text-muted-foreground">Bill clients for custom engineering, setup, or consulting services.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleCreateInvoice)} className="grid gap-6 md:grid-cols-12">
          {/* Main Info Card */}
          <Card className="md:col-span-8 space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Billed Customer</label>
                <Select {...register('customerId')}>
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                {errors.customerId && <p className="text-xs text-rose-500">{errors.customerId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                <Input type="date" {...register('dueDate')} />
                {errors.dueDate && <p className="text-xs text-rose-500">{errors.dueDate.message}</p>}
              </div>
            </div>

            {/* Line Items Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Invoice Line Items</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => append({ description: '', quantity: 1, price: 0 })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>}
                      <Input
                        placeholder="Service descriptions..."
                        {...register(`items.${index}.description` as const)}
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase">Qty</label>}
                      <Input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity` as const)}
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      {index === 0 && <label className="text-[10px] font-semibold text-muted-foreground uppercase">Price</label>}
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-6"
                          placeholder="0.00"
                          {...register(`items.${index}.price` as const)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-rose-500 h-9 w-9 shrink-0"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.items && <p className="text-xs text-rose-500">{errors.items.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Terms / Footer Notes</label>
              <Input placeholder="Enter extra invoice text..." {...register('notes')} />
            </div>
          </Card>

          {/* Pricing & Submission Sidebar */}
          <Card className="md:col-span-4 p-6 self-start space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase block border-b border-border/40 pb-2">Order Summary</span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-border/20 pt-3">
                <span className="text-muted-foreground">Sales Tax (0%)</span>
                <span className="font-semibold text-foreground">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-base border-t border-border/40 pt-4 font-bold">
                <span className="text-foreground">Total Invoice</span>
                <span className="text-xl text-foreground">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 gap-1.5"
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? 'Generating...' : 'Issue Invoice'} <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER STATE: View Invoice Printable Details
  // ----------------------------------------------------
  if (viewMode === 'view') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" size="sm" onClick={() => setViewParams({ id: null })} className="gap-1.5 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            {activeInvoice?.status !== 'paid' && (
              <Button size="sm" className="gap-1.5" onClick={() => markPaidMutation.mutate(activeInvoice!.id)} disabled={markPaidMutation.isPending}>
                <CheckCircle className="h-4 w-4" /> Mark Paid
              </Button>
            )}
          </div>
        </div>

        {invoiceLoading ? (
          <Card className="p-12 space-y-6">
            <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-40 w-full bg-muted animate-pulse rounded" />
          </Card>
        ) : activeInvoice ? (
          <Card className="p-8 md:p-12 bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-sm print:border-0 print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                  <TrendingUp className="h-6 w-6 text-zinc-900 dark:text-zinc-50 shrink-0" />
                  <span>Khatify Inc.</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  100 Pine Street, suite 1200<br />
                  San Francisco, CA 94111<br />
                  accounts@khatify.com
                </p>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{activeInvoice.invoiceNumber}</div>
                <div className="flex sm:justify-end">
                  <StatusBadge status={activeInvoice.status} />
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  Issued: {formatDate(activeInvoice.createdAt)}
                </div>
              </div>
            </div>

            {/* Billed To Row */}
            <div className="grid gap-6 sm:grid-cols-2 py-8 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Billed To</span>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{activeInvoice.customerName}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Customer ID: {activeInvoice.customerId}
                </div>
              </div>
              <div className="space-y-1.5 text-left sm:text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Due By</span>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{formatDate(activeInvoice.dueDate)}</div>
                {activeInvoice.status === 'overdue' && (
                  <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <AlertTriangle className="h-3 w-3" /> Invoice Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-8">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 uppercase font-bold">
                    <th className="py-3">Description</th>
                    <th className="py-3 text-center">Quantity</th>
                    <th className="py-3 text-right">Price</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.description}</td>
                      <td className="py-4 text-center text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                      <td className="py-4 text-right text-zinc-600 dark:text-zinc-400">{formatCurrency(item.price)}</td>
                      <td className="py-4 text-right font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Total Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-t border-zinc-200 dark:border-zinc-800 pt-8 gap-6">
              <div className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400 italic">
                {activeInvoice.notes && (
                  <p><strong>Notes:</strong> {activeInvoice.notes}</p>
                )}
              </div>
              <div className="w-full sm:w-64 space-y-3">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(activeInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Sales Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-zinc-100 dark:border-zinc-800 pt-3 text-zinc-900 dark:text-zinc-50">
                  <span>Total Amount</span>
                  <span className="text-base">{formatCurrency(activeInvoice.amount)}</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            Invoice not found.
          </Card>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER STATE: Invoice List Grid
  // ----------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Invoices</h2>
          <p className="text-sm text-muted-foreground">Manage accounts receivable billings, outstanding invoices, and aging accounts.</p>
        </div>
        <Button className="gap-1.5 self-start md:self-auto" onClick={() => setViewParams({ create: 'true' })}>
          <Plus className="h-4 w-4" /> Issue Invoice
        </Button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Invoiced</span>
          <div className="text-lg font-bold text-foreground mt-1">{formatCurrency(totalInvoiced)}</div>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Collected</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(collected)}</div>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Outstanding Balance</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(outstanding)}</div>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Overdue Amount</span>
          <div className="text-lg font-bold text-rose-700 dark:text-rose-500 mt-1">{formatCurrency(overdueAmount)}</div>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 self-start md:self-auto">
            {['all', 'unpaid', 'paid', 'overdue'].map((status) => (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                className={`h-7 px-3 text-xs capitalize ${statusFilter === status ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {invoicesLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/60 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-semibold text-foreground">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground/80">{inv.customerName}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell className="text-right font-bold text-foreground">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell className="text-right no-print">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground" onClick={() => setViewParams({ id: inv.id })}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No invoices found matching criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

