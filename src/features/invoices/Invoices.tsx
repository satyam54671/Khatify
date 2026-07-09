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
  ArrowRight,
  DollarSign
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

  // Form check for query params
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
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewParams({ create: null })} className="gap-1.5 -ml-2 rounded-full font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Invoice</h2>
            <p className="text-[15px] font-medium text-muted-foreground mt-1">Bill clients for custom engineering, setup, or consulting services.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleCreateInvoice)} className="grid gap-8 lg:grid-cols-12">
          {/* Main Info Card */}
          <Card className="lg:col-span-8 p-6 bg-white/60 backdrop-blur-sm border-border/60">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Billed Customer</label>
                <Select {...register('customerId')} className="h-11 rounded-xl">
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                {errors.customerId && <p className="text-xs text-rose-500 font-medium">{errors.customerId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Due Date</label>
                <Input type="date" className="h-11 rounded-xl" {...register('dueDate')} />
                {errors.dueDate && <p className="text-xs text-rose-500 font-medium">{errors.dueDate.message}</p>}
              </div>
            </div>

            {/* Line Items Container */}
            <div className="space-y-4 mt-8 pt-8 border-t border-border/40">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Invoice Line Items</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 font-semibold"
                  onClick={() => append({ description: '', quantity: 1, price: 0 })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>

              <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/40">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1.5">
                      {index === 0 && <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>}
                      <Input
                        placeholder="Service descriptions..."
                        className="rounded-lg"
                        {...register(`items.${index}.description` as const)}
                      />
                    </div>
                    <div className="w-20 space-y-1.5">
                      {index === 0 && <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Qty</label>}
                      <Input
                        type="number"
                        min="1"
                        className="rounded-lg text-center"
                        {...register(`items.${index}.quantity` as const)}
                      />
                    </div>
                    <div className="w-32 space-y-1.5">
                      {index === 0 && <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price</label>}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-7 rounded-lg"
                          placeholder="0.00"
                          {...register(`items.${index}.price` as const)}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 h-10 w-10 shrink-0 rounded-full transition-colors"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.items && <p className="text-xs text-rose-500 font-medium pt-2">{errors.items.message}</p>}
              </div>
            </div>

            <div className="space-y-2 mt-8 pt-8 border-t border-border/40">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Terms / Footer Notes</label>
              <Input placeholder="Enter extra invoice text..." className="rounded-xl" {...register('notes')} />
            </div>
          </Card>

          {/* Pricing & Submission Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-border/60">
              <div className="space-y-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block pb-3 border-b border-border/40">Order Summary</span>
                <div className="flex items-center justify-between text-[15px] font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-[15px] font-medium border-t border-border/20 pt-4">
                  <span className="text-muted-foreground">Sales Tax (0%)</span>
                  <span className="text-foreground">$0.00</span>
                </div>
                <div className="flex items-center justify-between text-base border-t border-border/40 pt-5 font-bold">
                  <span className="text-foreground">Total Invoice</span>
                  <span className="text-2xl text-foreground tracking-tight">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 gap-2 mt-6 rounded-full font-semibold text-base shadow-sm"
                disabled={createInvoiceMutation.isPending}
              >
                {createInvoiceMutation.isPending ? 'Generating...' : 'Issue Invoice'} <ArrowRight className="h-5 w-5" />
              </Button>
            </Card>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER STATE: View Invoice Printable Details
  // ----------------------------------------------------
  if (viewMode === 'view') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between no-print mb-4">
          <Button variant="ghost" size="sm" onClick={() => setViewParams({ id: null })} className="gap-1.5 -ml-2 rounded-full font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 rounded-full font-semibold px-5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            {activeInvoice?.status !== 'paid' && (
              <Button size="sm" className="gap-2 rounded-full font-semibold px-5 shadow-sm" onClick={() => markPaidMutation.mutate(activeInvoice!.id)} disabled={markPaidMutation.isPending}>
                <CheckCircle className="h-4 w-4" /> Mark Paid
              </Button>
            )}
          </div>
        </div>

        {invoiceLoading ? (
          <Card className="p-12 space-y-6 bg-white border-border/60">
            <div className="h-10 w-1/3 bg-muted/60 animate-pulse rounded-xl" />
            <div className="h-40 w-full bg-muted/60 animate-pulse rounded-xl" />
          </Card>
        ) : activeInvoice ? (
          <Card className="p-8 md:p-12 bg-white text-zinc-950 border border-zinc-200/80 shadow-sm print:border-0 print:shadow-none print:p-0 rounded-3xl overflow-hidden relative">
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-100 pb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 font-black text-2xl tracking-tight text-zinc-900">
                  <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-md">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span>Khatify Inc.</span>
                </div>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed pt-2">
                  100 Pine Street, suite 1200<br />
                  San Francisco, CA 94111<br />
                  accounts@khatify.com
                </p>
              </div>
              <div className="text-left sm:text-right space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Invoice Number</div>
                <div className="text-3xl font-black tracking-tight text-zinc-900">{activeInvoice.invoiceNumber}</div>
                <div className="flex sm:justify-end pt-1">
                  <StatusBadge status={activeInvoice.status} />
                </div>
                <div className="text-xs font-medium text-zinc-500 pt-2">
                  Issued: {formatDate(activeInvoice.createdAt)}
                </div>
              </div>
            </div>

            {/* Billed To Row */}
            <div className="grid gap-8 sm:grid-cols-2 py-10 border-b border-zinc-100">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block pb-1">Billed To</span>
                <div className="font-bold text-lg text-zinc-900">{activeInvoice.customerName}</div>
                <div className="text-sm font-medium text-zinc-500">
                  Customer ID: <span className="text-zinc-700">{activeInvoice.customerId}</span>
                </div>
              </div>
              <div className="space-y-2 text-left sm:text-right flex flex-col sm:items-end">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block pb-1">Due By</span>
                <div className="font-bold text-lg text-zinc-900 bg-zinc-50 px-4 py-1.5 rounded-lg inline-block">{formatDate(activeInvoice.dueDate)}</div>
                {activeInvoice.status === 'overdue' && (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 text-sm font-bold pt-1">
                    <AlertTriangle className="h-4 w-4" /> Invoice Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-10">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-100 text-xs text-zinc-400 uppercase font-bold tracking-wider">
                    <th className="py-4 px-2">Description</th>
                    <th className="py-4 text-center">Quantity</th>
                    <th className="py-4 text-right">Price</th>
                    <th className="py-4 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/60">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-5 px-2 font-semibold text-zinc-900 transition-colors">{item.description}</td>
                      <td className="py-5 text-center font-medium text-zinc-600 transition-colors">{item.quantity}</td>
                      <td className="py-5 text-right font-medium text-zinc-600 transition-colors">{formatCurrency(item.price)}</td>
                      <td className="py-5 px-2 text-right font-bold text-zinc-900 transition-colors">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Total Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start pt-6 gap-8">
              <div className="max-w-sm text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                {activeInvoice.notes ? (
                  <p><strong className="text-zinc-700">Notes:</strong> {activeInvoice.notes}</p>
                ) : (
                  <p>Thank you for your business.</p>
                )}
              </div>
              <div className="w-full sm:w-72 space-y-4">
                <div className="flex justify-between text-[15px] font-medium text-zinc-600">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">{formatCurrency(activeInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-zinc-600 pb-4 border-b border-zinc-100">
                  <span>Sales Tax (0%)</span>
                  <span className="text-zinc-900">$0.00</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-zinc-900">Total Amount</span>
                  <span className="text-3xl font-black tracking-tight text-zinc-900">{formatCurrency(activeInvoice.amount)}</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-16 text-center rounded-3xl border-border/60 shadow-sm flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-muted/60 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">Invoice Not Found</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">The requested invoice could not be located.</p>
          </Card>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER STATE: Invoice List Grid
  // ----------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Invoices
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Manage billings, outstanding balances, and collections.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6"
            onClick={() => setViewParams({ create: 'true' })}
          >
            <Plus className="h-4 w-4" /> Issue Invoice
          </Button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Invoiced</span>
          </div>
          <div className="text-2xl font-black text-foreground">{formatCurrency(totalInvoiced)}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Collected</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(collected)}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Outstanding</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{formatCurrency(outstanding)}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Overdue</span>
          </div>
          <div className="text-2xl font-black text-orange-600">{formatCurrency(overdueAmount)}</div>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 bg-zinc-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white rounded-full border-border/60 shadow-sm h-10"
            />
          </div>

          <div className="flex bg-zinc-100/80 p-1 rounded-xl border border-border/40 self-start sm:self-auto overflow-x-auto max-w-full">
            {['all', 'unpaid', 'paid', 'overdue'].map((status) => (
              <button
                key={status}
                className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-white shadow-sm text-foreground ring-1 ring-border/50' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-0">
          {invoicesLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted/60 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right pr-6 no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="group transition-colors hover:bg-zinc-50/80">
                    <TableCell className="pl-6 py-4">
                      <div className="font-bold text-[15px] text-foreground">{inv.invoiceNumber}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-semibold text-foreground/80">{inv.customerName}</div>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="font-medium text-muted-foreground">{formatDate(inv.dueDate)}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="font-black text-base text-foreground tracking-tight">{formatCurrency(inv.amount)}</div>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right no-print">
                      <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground rounded-full font-semibold px-4 transition-all opacity-0 group-hover:opacity-100" onClick={() => setViewParams({ id: inv.id })}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground rounded-full transition-all group-hover:hidden md:hidden inline-flex" onClick={() => setViewParams({ id: inv.id })}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No invoices found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No invoices match the current filters. Adjust your search or create a new invoice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

