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
  User
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Payments Received</h2>
          <p className="text-sm text-muted-foreground">Log client receipts, bank wire transfers, card settlements, and partial payments.</p>
        </div>
        <Button className="gap-1.5 self-start md:self-auto" onClick={() => setIsRecordOpen(true)}>
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Collections</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCollected)}</div>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Transactions Logged</span>
          <div className="text-lg font-bold text-foreground mt-1">{payments.length} Payments</div>
        </Card>
      </div>

      {/* Log list */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/60 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Memo / Notes</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium whitespace-nowrap">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{p.customerName}</TableCell>
                    <TableCell>
                      {p.invoiceNumber ? (
                        <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400 bg-muted/40 font-medium">
                          {p.invoiceNumber}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Ledger Advance</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize whitespace-nowrap text-xs text-foreground/80">{getMethodLabel(p.method)}</TableCell>
                    <TableCell className="max-w-[250px] truncate text-muted-foreground" title={p.notes || ''}>
                      {p.notes || <span className="text-[10px] italic opacity-60">None</span>}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      + {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No payments recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG: Record Payment Form */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Credit a customer's outstanding statement balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleRecordPayment)} className="space-y-4 py-2">

            {/* Customer select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Customer</label>
              <Select {...register('customerId')}>
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.balance)} balance)</option>
                ))}
              </Select>
              {errors.customerId && <p className="text-xs text-rose-500">{errors.customerId.message}</p>}
            </div>

            {/* Linked Invoice select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Link to Outstanding Invoice (Optional)</label>
              <Select {...register('invoiceId')} disabled={!watchCustomerId}>
                <option value="">-- General Payment (No Invoice) --</option>
                {customerUnpaidInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - Due: {formatDate(inv.dueDate)} ({formatCurrency(inv.amount)})</option>
                ))}
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-muted-foreground">$</span>
                <Input type="number" step="0.01" className="pl-6" placeholder="0.00" {...register('amount')} />
              </div>
              {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
            </div>

            {/* Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</label>
              <Select {...register('method')}>
                <option value="bank_transfer">Bank Transfer / Wire</option>
                <option value="card">Credit/Debit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Memo / Reference Info</label>
              <Input placeholder="e.g. Check number, wire confirmation ref..." {...register('notes')} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeRecordModal}>Cancel</Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

