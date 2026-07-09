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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 no-print">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Digital Ledger (Khata)
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Audit journal of accounts receivable (debits) and incoming payments (credits).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="gap-2 rounded-full border-border/60 hover:bg-zinc-50 shadow-sm font-semibold px-5"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </div>

      {/* Printable Header Wrapper (hidden in screen, visible in print) */}
      <div className="hidden print:block border-b border-zinc-200 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Digital Khata - General Ledger Journal</h1>
        <p className="text-sm text-zinc-500 mt-1">Generated on {new Date().toLocaleDateString()} - Account Auditing & Statements</p>
      </div>

      {/* Trial Balance Sheets */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl no-print">
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Debits (Dr)</span>
          </div>
          <div className="text-2xl font-black text-rose-600 mb-1">{formatCurrency(totalDebits)}</div>
          <span className="text-xs font-medium text-muted-foreground">Total amount billed to clients</span>
        </Card>
        
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Credits (Cr)</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mb-1">{formatCurrency(totalCredits)}</div>
          <span className="text-xs font-medium text-muted-foreground">Total payments received/credited</span>
        </Card>
        
        <Card className="p-5 border-border/60 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${netReceivables > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Net Receivables</span>
          </div>
          <div className={`text-2xl font-black mb-1 ${netReceivables > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(netReceivables)}
          </div>
          <span className="text-xs font-medium text-muted-foreground">Net balance owed to company</span>
        </Card>
      </div>

      {/* Main Journal Table */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col print:border-none print:shadow-none">
        <div className="p-4 sm:p-5 border-b border-border/40 bg-zinc-50/50 no-print flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, customer, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white rounded-full border-border/60 shadow-sm h-10 w-full"
            />
          </div>

          <div className="flex bg-zinc-100/80 p-1 rounded-full border border-border/40 w-full md:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 md:flex-none h-8 px-4 rounded-full text-sm font-semibold transition-all ${
                typeFilter === 'all' 
                  ? 'bg-white shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 md:flex-none h-8 px-4 rounded-full text-sm font-semibold transition-all ${
                typeFilter === 'debit' 
                  ? 'bg-white shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTypeFilter('debit')}
            >
              Debits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 md:flex-none h-8 px-4 rounded-full text-sm font-semibold transition-all ${
                typeFilter === 'credit' 
                  ? 'bg-white shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTypeFilter('credit')}
            >
              Credits
            </Button>
          </div>
        </div>
        
        <div className="p-0">
          {ledgerLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-muted/60 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredLedger.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Transaction / Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((entry) => (
                  <TableRow key={entry.id} className="group transition-colors hover:bg-zinc-50/80">
                    <TableCell className="pl-6 py-4 font-medium whitespace-nowrap text-muted-foreground">{formatDate(entry.date)}</TableCell>
                    <TableCell className="py-4 font-bold text-[15px] text-foreground">
                      {entry.customerName || <span className="text-sm text-muted-foreground italic font-medium">General</span>}
                    </TableCell>
                    <TableCell className="py-4 text-foreground/80 font-medium max-w-[300px] truncate" title={entry.description}>
                      {entry.description}
                    </TableCell>
                    <TableCell className="py-4">
                      {entry.type === 'debit' ? (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/20 bg-rose-50 px-2.5 py-0.5 gap-1.5 font-bold shadow-sm">
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> Udhaar (Dr)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 gap-1.5 font-bold shadow-sm">
                          <ArrowDownLeft className="h-3.5 w-3.5 shrink-0" /> Jamaa (Cr)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right font-black text-[15px] text-foreground tracking-tight">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No ledger entries found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Transactions will appear here when invoices are generated or payments are received.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
