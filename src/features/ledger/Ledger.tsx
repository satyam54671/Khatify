import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dbService } from '@/services/db';
import type { LedgerEntry } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import {
  Search,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export function Ledger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');

  // Queries
  const { data: ledger = [], isLoading: ledgerLoading } = useQuery({
    queryKey: ['ledger-entries'],
    queryFn: dbService.getLedgerEntries,
  });

  // Calculate global double-entry statistics
  const totalDebits = ledger
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredits = ledger
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const netReceivables = totalDebits - totalCredits;

  // Filtered ledger entries
  const filteredLedger = ledger.filter(entry => {
    const matchesSearch =
      (entry.customerName && entry.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.referenceId && entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between no-print">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">General Ledger</h2>
          <p className="text-sm text-muted-foreground">Audit journal of accounts receivable (debits) and incoming payments (credits).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </div>

      {/* Printable Header Wrapper (hidden in screen, visible in print) */}
      <div className="hidden print:block border-b pb-6 mb-6">
        <h1 className="text-2xl font-bold">Khatify - General Ledger Journal</h1>
        <p className="text-sm text-zinc-500 mt-1">Generated on {new Date().toLocaleDateString()} - Account Auditing & Statements</p>
      </div>

      {/* Trial Balance Sheets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Debits (Dr)</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(totalDebits)}</div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Total amount billed to clients</span>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Credits (Cr)</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCredits)}</div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Total payments received/credited</span>
        </Card>
        <Card className="p-4 bg-card/60">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Net Receivables</span>
          <div className={`text-lg font-bold mt-1 ${netReceivables > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(netReceivables)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Net balance owed to company</span>
        </Card>
      </div>

      {/* Main Journal Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4 no-print">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, customer, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 self-start md:self-auto">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-3 text-xs ${typeFilter === 'all' ? 'bg-background shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}
              onClick={() => setTypeFilter('all')}
            >
              All Transactions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-3 text-xs ${typeFilter === 'debit' ? 'bg-background shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}
              onClick={() => setTypeFilter('debit')}
            >
              Debits (Dr)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-3 text-xs ${typeFilter === 'credit' ? 'bg-background shadow-sm text-foreground font-semibold' : 'text-muted-foreground'}`}
              onClick={() => setTypeFilter('credit')}
            >
              Credits (Cr)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ledgerLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/60 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredLedger.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Transaction / Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {entry.customerName || <span className="text-xs text-muted-foreground italic">General</span>}
                    </TableCell>
                    <TableCell className="text-foreground/80 max-w-[300px] truncate" title={entry.description}>
                      {entry.description}
                    </TableCell>
                    <TableCell>
                      {entry.type === 'debit' ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/20 bg-rose-500/5 gap-1 py-0.5 font-semibold">
                          <ArrowUpRight className="h-3 w-3 shrink-0" /> Debit (Dr)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 gap-1 py-0.5 font-semibold">
                          <ArrowDownLeft className="h-3 w-3 shrink-0" /> Credit (Cr)
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
            <div className="text-center py-12 text-sm text-muted-foreground">
              No transactions ledger entries found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

