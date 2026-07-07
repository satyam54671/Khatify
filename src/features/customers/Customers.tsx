import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dbService } from '@/services/db';
import type { Customer, LedgerEntry } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import {
  Search,
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit2,
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  History,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
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
const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function Customers() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCustomerId = searchParams.get('id') || null;
  const isAddOpenParam = searchParams.get('add') === 'true';

  // Component states
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | null>(null);

  // Synchronise state with query parameters (enables link triggers from Dashboard)
  useEffect(() => {
    if (isAddOpenParam) {
      setIsAddOpen(true);
    }
  }, [isAddOpenParam]);

  const closeAddModal = () => {
    setIsAddOpen(false);
    // clean up query param
    const params = new URLSearchParams(searchParams);
    params.delete('add');
    setSearchParams(params);
  };

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  // Queries
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: dbService.getCustomers,
  });

  const { data: activeCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', activeCustomerId],
    queryFn: () => dbService.getCustomer(activeCustomerId!),
    enabled: !!activeCustomerId,
  });

  const { data: customerLedger = [], isLoading: ledgerLoading } = useQuery({
    queryKey: ['customer-ledger', activeCustomerId],
    queryFn: () => dbService.getCustomerLedgerEntries(activeCustomerId!),
    enabled: !!activeCustomerId,
  });

  // Mutations
  const createCustomerMutation = useMutation({
    mutationFn: dbService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeAddModal();
      reset();
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      dbService.updateCustomer(id, data),
    onSuccess: (updatedCust) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCust.id] });
      setIsEditOpen(false);
      setSelectedCustomerForEdit(null);
    },
  });

  // Event Handlers
  const handleCreateCustomer = (data: CustomerFormValues) => {
    createCustomerMutation.mutate(data);
  };

  const handleUpdateCustomer = (data: CustomerFormValues) => {
    if (selectedCustomerForEdit) {
      updateCustomerMutation.mutate({
        id: selectedCustomerForEdit.id,
        data,
      });
    }
  };

  const openEditModal = (cust: Customer) => {
    setSelectedCustomerForEdit(cust);
    editForm.reset({
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      address: cust.address || '',
    });
    setIsEditOpen(true);
  };

  const selectCustomer = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('id', id);
    } else {
      params.delete('id');
    }
    setSearchParams(params);
  };

  // Filtered customer list
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="h-full">
      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Customer List */}
        <div className={`space-y-6 lg:col-span-6 ${activeCustomerId ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Customers</h2>
              <p className="text-sm text-muted-foreground">Manage accounts receivable ledger and details.</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {customersLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-full bg-muted/60 animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredCustomers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => {
                      const isActive = c.id === activeCustomerId;
                      return (
                        <TableRow
                          key={c.id}
                          className={`cursor-pointer ${isActive ? 'bg-secondary/50 dark:bg-zinc-800/60 font-medium' : ''}`}
                          onClick={() => selectCustomer(c.id)}
                        >
                          <TableCell className="py-3">
                            <div className="font-semibold text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.email}</div>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className={`font-bold ${c.balance > 0 ? 'text-rose-600 dark:text-rose-400' : c.balance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                              {formatCurrency(c.balance)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {c.balance > 0 ? 'Owes Us' : c.balance < 0 ? 'Overpaid' : 'Settled'}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No customers found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Customer details drawer / visual summary */}
        <div className={`lg:col-span-6 ${activeCustomerId ? 'block' : 'hidden lg:block'}`}>
          {activeCustomerId ? (
            customerLoading ? (
              <Card>
                <CardHeader>
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-20 w-full bg-muted animate-pulse rounded" />
                  <div className="h-40 w-full bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ) : activeCustomer ? (
              <div className="space-y-6">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectCustomer(null)}
                  className="lg:hidden gap-1.5 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Customers
                </Button>

                {/* Profile Card */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditModal(activeCustomer)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden text-muted-foreground hover:text-foreground" onClick={() => selectCustomer(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-sm">
                        {activeCustomer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle>{activeCustomer.name}</CardTitle>
                        <CardDescription>Created on {formatDate(activeCustomer.createdAt)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Running balance banner */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ledger Balance</span>
                        <div className={`text-xl font-bold mt-0.5 ${activeCustomer.balance > 0 ? 'text-rose-600 dark:text-rose-400' : activeCustomer.balance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {formatCurrency(activeCustomer.balance)}
                        </div>
                      </div>
                      <Badge variant={activeCustomer.balance > 0 ? 'destructive' : activeCustomer.balance < 0 ? 'success' : 'secondary'}>
                        {activeCustomer.balance > 0 ? 'Outstanding Debt' : activeCustomer.balance < 0 ? 'Credit Balance' : 'Fully Settled'}
                      </Badge>
                    </div>

                    {/* Metadata items */}
                    <div className="grid gap-3 text-sm text-foreground/80 pt-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{activeCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{activeCustomer.phone}</span>
                      </div>
                      {activeCustomer.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="leading-tight">{activeCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Ledger entries */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <History className="h-4 w-4 text-muted-foreground" /> Account Statement (Ledger)
                    </CardTitle>
                    <CardDescription>Double-entry transaction history specifically for this account.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {ledgerLoading ? (
                      <div className="p-6 space-y-3">
                        <div className="h-8 w-full bg-muted/60 animate-pulse rounded" />
                        <div className="h-8 w-full bg-muted/60 animate-pulse rounded" />
                      </div>
                    ) : customerLedger.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-muted/40 border-b text-[10px] text-muted-foreground uppercase font-semibold">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3">Description</th>
                              <th className="p-3">Type</th>
                              <th className="p-3 text-right">Amount</th>
                              <th className="p-3 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {customerLedger.map((entry: LedgerEntry) => (
                              <tr key={entry.id} className="hover:bg-muted/20">
                                <td className="p-3 whitespace-nowrap text-muted-foreground">{formatDate(entry.date)}</td>
                                <td className="p-3 font-medium text-foreground max-w-[200px] truncate" title={entry.description}>
                                  {entry.description}
                                </td>
                                <td className="p-3">
                                  {entry.type === 'debit' ? (
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold">DEBIT (Dr)</span>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">CREDIT (Cr)</span>
                                  )}
                                </td>
                                <td className="p-3 text-right font-bold text-foreground">{formatCurrency(entry.amount)}</td>
                                <td className="p-3 text-right font-semibold text-foreground/80">{formatCurrency(entry.runningBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-sm text-muted-foreground">
                        No transactions recorded for this customer.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-[400px] flex items-center justify-center text-center p-6 border-dashed border-2">
                <div className="text-muted-foreground text-sm">Customer details could not be loaded.</div>
              </Card>
            )
          ) : (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-border/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4 border border-border/40">
                <User className="h-6 w-6" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground mb-1">Select a Customer</CardTitle>
              <CardDescription className="max-w-xs leading-relaxed">
                Click on any customer in the list to view their ledger entries, invoicing status, profile info, and statements.
              </CardDescription>
            </Card>
          )}
        </div>
      </div>

      {/* DIALOG 1: Add Customer Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new client profile in your ledger database.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateCustomer)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Name</label>
              <Input placeholder="Acme Corp" {...register('name')} />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Email</label>
              <Input type="email" placeholder="billing@acme.com" {...register('email')} />
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
              <Input placeholder="+1 (555) 000-0000" {...register('phone')} />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Address</label>
              <Input placeholder="123 Financial Row, suite 4" {...register('address')} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeAddModal}>Cancel</Button>
              <Button type="submit" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? 'Saving...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Edit Customer Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update client profile details. Existing transaction balances are preserved.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdateCustomer)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Customer Name</label>
              <Input placeholder="Acme Corp" {...editForm.register('name')} />
              {editForm.formState.errors.name && <p className="text-xs text-rose-500">{editForm.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Email</label>
              <Input type="email" placeholder="billing@acme.com" {...editForm.register('email')} />
              {editForm.formState.errors.email && <p className="text-xs text-rose-500">{editForm.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
              <Input placeholder="+1 (555) 000-0000" {...editForm.register('phone')} />
              {editForm.formState.errors.phone && <p className="text-xs text-rose-500">{editForm.formState.errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Billing Address</label>
              <Input placeholder="123 Financial Row, suite 4" {...editForm.register('address')} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
