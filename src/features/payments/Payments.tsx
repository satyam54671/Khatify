import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dbService } from '@/services/db';
import type { Customer, Payment, PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import {
  Search,
  Plus,
  CreditCard,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  FileText,
  User,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/Dialog';

// Form validation schema
const paymentFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  invoiceId: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Payment amount must be greater than $0.00'),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function Payments() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRecordOpenParam = searchParams.get('record') === 'true';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // Synchronise parameter trigger
  useEffect(() => {
    if (isRecordOpenParam) {
      setIsRecordOpen(true);
    }
  }, [isRecordOpenParam]);

  const closeRecordModal = () => {
    setIsRecordOpen(false);
    const params = new URLSearchParams(searchParams);
    params.delete('record');
    setSearchParams(params);
  };

  // Queries
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: dbService.getPayments,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: dbService.getCustomers,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: dbService.getInvoices,
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      method: 'bank_transfer',
      notes: '',
    }
  });

  // Watch fields for reactive forms linking
  const watchCustomerId = watch('customerId');
  const watchInvoiceId = watch('invoiceId');

  // Filter unpaid invoices for the chosen customer
  const customerUnpaidInvoices = invoices.filter(
    i => i.customerId === watchCustomerId && i.status !== 'paid'
  );

  // Auto-fill amount when invoice is selected
  useEffect(() => {
    if (watchInvoiceId) {
      const selectedInvoice = invoices.find(i => i.id === watchInvoiceId);
      if (selectedInvoice) {
        setValue('amount', selectedInvoice.amount);
      }
    }
  }, [watchInvoiceId, invoices, setValue]);

  // Reset invoiceId when customer changes
  useEffect(() => {
    setValue('invoiceId', '');
    setValue('amount', 0);
  }, [watchCustomerId, setValue]);

  // Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: dbService.recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeRecordModal();
      reset();
    },
  });

  const handleRecordPayment = (values: PaymentFormValues) => {
    const customerObj = customers.find(c => c.id === values.customerId);
    if (!customerObj) return;

    let invoiceNumber: string | undefined;
    if (values.invoiceId) {
      const invoiceObj = invoices.find(i => i.id === values.invoiceId);
      invoiceNumber = invoiceObj?.invoiceNumber;
    }

    recordPaymentMutation.mutate({
      customerId: values.customerId,
      customerName: customerObj.name,
      invoiceId: values.invoiceId || undefined,
      invoiceNumber,
      amount: values.amount,
      method: values.method,
      notes: values.notes || undefined,
    });
  };

  // Filter payments
  const filteredPayments = payments.filter(p =>
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Total collected summary
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'card': return 'Credit Card';
      case 'cash': return 'Cash';
      case 'other':
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Payments
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Log client receipts, bank wire transfers, and partial payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6"
            onClick={() => setIsRecordOpen(true)}
          >
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Collections</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(totalCollected)}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Transactions Logged</span>
          </div>
          <div className="text-2xl font-black text-foreground">{payments.length} <span className="text-base font-semibold text-muted-foreground ml-1">Payments</span></div>
        </Card>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-border/40 bg-zinc-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white rounded-full border-border/60 shadow-sm h-10"
            />
          </div>
        </div>

        <div className="p-0">
          {paymentsLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted/60 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Memo / Notes</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => (
                  <TableRow key={p.id} className="group transition-colors hover:bg-zinc-50/80">
                    <TableCell className="pl-6 py-4 font-medium whitespace-nowrap text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="py-4 font-bold text-[15px] text-foreground">{p.customerName}</TableCell>
                    <TableCell className="py-4">
                      {p.invoiceNumber ? (
                        <Badge variant="outline" className="text-zinc-600 bg-white shadow-sm font-semibold border-border/60 px-2 py-0.5">
                          {p.invoiceNumber}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium">Ledger Advance</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 capitalize whitespace-nowrap text-sm font-semibold text-foreground/80">{getMethodLabel(p.method)}</TableCell>
                    <TableCell className="py-4 max-w-[250px] truncate text-muted-foreground font-medium" title={p.notes || ''}>
                      {p.notes || <span className="text-xs italic opacity-60">None</span>}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right font-black text-[15px] text-emerald-600 tracking-tight">
                      + {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No payments recorded</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Get started by recording a payment from a client.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG: Record Payment Form */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Record Payment</DialogTitle>
            <DialogDescription>Credit a customer's outstanding statement balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleRecordPayment)} className="space-y-5 py-4">

            {/* Customer select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Customer *</label>
              <Select className="h-11 rounded-lg" {...register('customerId')}>
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({formatCurrency(Math.abs(c.balance))} {c.balance > 0 ? 'Due' : 'Credit'})</option>
                ))}
              </Select>
              {errors.customerId && <p className="text-xs text-rose-500 font-medium">{errors.customerId.message}</p>}
            </div>

            {/* Linked Invoice select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Link to Outstanding Invoice</label>
              <Select className="h-11 rounded-lg" {...register('invoiceId')} disabled={!watchCustomerId}>
                <option value="">-- General Payment (No Invoice) --</option>
                {customerUnpaidInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - Due: {formatDate(inv.dueDate)} ({formatCurrency(inv.amount)})</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Payment Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input type="number" step="0.01" className="h-11 pl-7 rounded-lg" placeholder="0.00" {...register('amount')} />
                </div>
                {errors.amount && <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>}
              </div>

              {/* Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Method *</label>
                <Select className="h-11 rounded-lg" {...register('method')}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Memo / Reference Info</label>
              <Input className="h-11 rounded-lg" placeholder="e.g. Check number, wire ref..." {...register('notes')} />
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={closeRecordModal}>Cancel</Button>
              <Button type="submit" className="rounded-full px-8" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
