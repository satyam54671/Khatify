import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dbService } from '@/services/db';
import { StatCard } from '@/components/common/StatCard';
import { formatCurrency, formatDate } from '@/utils';
import { 
  DollarSign, 
  Users, 
  FileText, 
  ArrowRight, 
  Plus, 
  CreditCard,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export function Dashboard() {
  const navigate = useNavigate();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dbService.getDashboardStats,
  });

  const { data: recentLedger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['recent-ledger'],
    queryFn: async () => {
      const entries = await dbService.getLedgerEntries();
      return entries.slice(0, 5);
    },
  });

  const unpaidRatio = stats 
    ? (stats.unpaidInvoicesCount / (stats.paidInvoicesCount + stats.unpaidInvoicesCount)) * 100 
    : 0;

  const totalInvoices = stats ? stats.paidInvoicesCount + stats.unpaidInvoicesCount : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Overview</h2>
          <p className="text-sm text-muted-foreground">
            A comprehensive summary of your customer ledger accounts, payments, and invoices.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border px-3 py-1.5 rounded-lg w-fit">
          <Calendar className="h-3.5 w-3.5" />
          <span>As of {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          change={stats?.revenueChangePercent}
          description="from last month"
          icon={DollarSign}
          loading={statsLoading}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(stats?.outstandingAmount ?? 0)}
          change={stats?.outstandingChangePercent}
          description="vs last week"
          icon={CreditCard}
          loading={statsLoading}
        />
        <StatCard
          title="Active Customers"
          value={stats?.activeCustomersCount.toString() ?? '0'}
          change={stats?.customerChangePercent}
          description="new signups"
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Paid Invoices"
          value={`${stats?.paidInvoicesCount ?? 0} / ${totalInvoices}`}
          description={`${stats?.unpaidInvoicesCount ?? 0} invoices outstanding`}
          icon={FileText}
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions & Invoice breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations and ledger updates.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button 
              className="w-full justify-between" 
              onClick={() => navigate('/invoices?create=true')}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Invoice
              </span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              onClick={() => navigate('/payments?record=true')}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Record Payment
              </span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-between" 
              onClick={() => navigate('/customers?add=true')}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add Customer
              </span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Aging Ratio */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoicing Summary</CardTitle>
            <CardDescription>Ratio of paid vs outstanding client accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statsLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-full bg-muted/60 animate-pulse rounded" />
                <div className="h-4 w-full bg-muted/60 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Paid vs Outstanding Ratio</span>
                    <span className="font-semibold text-foreground">
                      {stats ? (100 - unpaidRatio).toFixed(0) : 0}% Paid
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${stats ? 100 - unpaidRatio : 0}%` }}
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500" 
                      style={{ width: `${stats ? unpaidRatio : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="border border-border/40 p-4 rounded-lg bg-muted/10">
                    <span className="text-xs text-muted-foreground block mb-1">Paid Invoices</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {stats?.paidInvoicesCount ?? 0}
                    </span>
                  </div>
                  <div className="border border-border/40 p-4 rounded-lg bg-muted/10">
                    <span className="text-xs text-muted-foreground block mb-1">Unpaid / Overdue</span>
                    <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                      {stats?.unpaidInvoicesCount ?? 0}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest entries recorded in the general double-entry journal.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/ledger')} className="gap-1.5">
            View Ledger <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/60 animate-pulse rounded" />
              ))}
            </div>
          ) : recentLedger && recentLedger.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLedger.map((entry) => (
                  <TableRow key={entry.id} className="cursor-pointer" onClick={() => navigate(`/customers?id=${entry.customerId}`)}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {entry.customerName}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {entry.description}
                    </TableCell>
                    <TableCell>
                      {entry.type === 'debit' ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/20 bg-rose-500/5 gap-1 py-0.5">
                          <ArrowUpRight className="h-3 w-3" /> Debit
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 gap-1 py-0.5">
                          <ArrowDownLeft className="h-3 w-3" /> Credit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No transactions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
