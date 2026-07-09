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
  History,
  X,
  User,
  ArrowUpRight,
  ArrowDownLeft
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

  // Synchronise state with query parameters
  useEffect(() => {
    if (isAddOpenParam) {
      setIsAddOpen(true);
    }
  }, [isAddOpenParam]);

  const closeAddModal = () => {
    setIsAddOpen(false);
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

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Customers
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Manage your clients and accounts receivable ledger.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white rounded-full border-border/60 shadow-sm"
            />
          </div>
          <Button 
            className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="md:hidden relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white rounded-full border-border/60 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Customer List */}
        <div className={`xl:col-span-7 ${activeCustomerId ? 'hidden xl:block' : 'block'}`}>
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            {customersLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 w-full bg-muted/60 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Customer Details</TableHead>
                    <TableHead className="text-right pr-6">Ledger Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => {
                    const isActive = c.id === activeCustomerId;
                    return (
                      <TableRow
                        key={c.id}
                        className={`cursor-pointer transition-all ${isActive ? 'bg-primary/[0.04] hover:bg-primary/[0.06] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                        onClick={() => selectCustomer(c.id)}
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg shadow-sm">
                              {c.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[15px] text-foreground">{c.name}</div>
                              <div className="text-sm font-medium text-muted-foreground mt-0.5">{c.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className={`font-bold text-base ${c.balance > 0 ? 'text-rose-600' : c.balance < 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {formatCurrency(Math.abs(c.balance))}
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                            {c.balance > 0 ? 'To Receive' : c.balance < 0 ? 'Advance' : 'Settled'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold">No customers found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Get started by adding a new customer to keep track of their khata.
                </p>
                <Button className="mt-6 rounded-full px-6" onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add your first customer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Customer details drawer / visual summary */}
        <div className={`xl:col-span-5 ${activeCustomerId ? 'block' : 'hidden xl:block'}`}>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectCustomer(null)}
                  className="xl:hidden gap-1.5 -ml-2 rounded-full font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List
                </Button>

                {/* Profile Card */}
                <Card className="relative overflow-hidden bg-white/50 backdrop-blur-sm border-border/60">
                  <div className="absolute top-0 right-0 p-4 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted" onClick={() => openEditModal(activeCustomer)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 xl:hidden rounded-full text-muted-foreground hover:bg-muted" onClick={() => selectCustomer(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-800 font-bold text-3xl shadow-sm ring-4 ring-white">
                        {activeCustomer.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{activeCustomer.name}</CardTitle>
                        <CardDescription className="mt-1">Client since {formatDate(activeCustomer.createdAt)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Balance Banner */}
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-border/40 shadow-sm">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Ledger Balance</span>
                        <div className={`text-2xl font-black tracking-tight mt-0.5 ${activeCustomer.balance > 0 ? 'text-rose-600' : activeCustomer.balance < 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                          {formatCurrency(Math.abs(activeCustomer.balance))}
                        </div>
                      </div>
                      <Badge variant={activeCustomer.balance > 0 ? 'destructive' : activeCustomer.balance < 0 ? 'success' : 'secondary'} className="px-3 py-1.5 text-xs">
                        {activeCustomer.balance > 0 ? 'To Receive' : activeCustomer.balance < 0 ? 'Overpaid' : 'Settled'}
                      </Badge>
                    </div>

                    {/* Info List */}
                    <div className="bg-white rounded-2xl border border-border/40 p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-semibold">{activeCustomer.phone}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-semibold">{activeCustomer.email}</div>
                      </div>
                      {activeCustomer.address && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-semibold mt-1.5">{activeCustomer.address}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Statement */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Recent Statement</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {ledgerLoading ? (
                      <div className="p-6 space-y-3">
                        <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
                        <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
                      </div>
                    ) : customerLedger.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-muted/30 border-y border-border/60 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            <tr>
                              <th className="py-3 px-6">Date</th>
                              <th className="py-3 px-6">Entry</th>
                              <th className="py-3 px-6 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {customerLedger.slice(0, 5).map((entry: LedgerEntry) => (
                              <tr key={entry.id} className="hover:bg-black/[0.02]">
                                <td className="py-3 px-6 whitespace-nowrap text-muted-foreground font-medium">{formatDate(entry.date)}</td>
                                <td className="py-3 px-6">
                                  <div className="font-semibold text-foreground truncate max-w-[150px]" title={entry.description}>{entry.description}</div>
                                  <div className={`text-[11px] font-bold mt-0.5 ${entry.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {entry.type === 'debit' ? 'DEBIT' : 'CREDIT'}
                                  </div>
                                </td>
                                <td className="py-3 px-6 text-right font-bold text-foreground">{formatCurrency(entry.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-sm text-muted-foreground font-medium">
                        No transactions recorded.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-[400px] flex items-center justify-center text-center p-6 border-dashed border-2">
                <div className="text-muted-foreground text-sm font-medium">Customer details not found.</div>
              </Card>
            )
          ) : (
            <div className="h-[600px] rounded-3xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-center p-10 bg-white/30 backdrop-blur-[2px]">
              <div className="h-20 w-20 bg-muted/60 rounded-full flex items-center justify-center mb-6">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Customer</h3>
              <p className="text-muted-foreground font-medium max-w-[260px] leading-relaxed">
                Choose a customer from the list to view their ledger balance, statements, and contact details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain structurally similar, but could use some class tweaks for styling if needed */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Customer</DialogTitle>
            <DialogDescription>Create a new client profile.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateCustomer)} className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Customer Name *</label>
              <Input className="h-11 rounded-lg" placeholder="Sharma Ji" {...register('name')} />
              {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Phone Number *</label>
              <Input className="h-11 rounded-lg" placeholder="+91 98765 43210" {...register('phone')} />
              {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Address</label>
              <Input className="h-11 rounded-lg" type="email" placeholder="sharma@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Billing Address</label>
              <Input className="h-11 rounded-lg" placeholder="Shop 104, Main Market" {...register('address')} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={closeAddModal}>Cancel</Button>
              <Button type="submit" className="rounded-full px-8" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? 'Saving...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Customer</DialogTitle>
            <DialogDescription>Update client details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdateCustomer)} className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Customer Name *</label>
              <Input className="h-11 rounded-lg" placeholder="Sharma Ji" {...editForm.register('name')} />
              {editForm.formState.errors.name && <p className="text-xs text-rose-500 font-medium">{editForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Phone Number *</label>
              <Input className="h-11 rounded-lg" placeholder="+91 98765 43210" {...editForm.register('phone')} />
              {editForm.formState.errors.phone && <p className="text-xs text-rose-500 font-medium">{editForm.formState.errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Address</label>
              <Input className="h-11 rounded-lg" type="email" placeholder="sharma@example.com" {...editForm.register('email')} />
              {editForm.formState.errors.email && <p className="text-xs text-rose-500 font-medium">{editForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Billing Address</label>
              <Input className="h-11 rounded-lg" placeholder="Shop 104, Main Market" {...editForm.register('address')} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-full px-8" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
