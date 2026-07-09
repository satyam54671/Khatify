import { useState } from 'react';
import {
  BarChart3,
  FileText,
  Users,
  CreditCard,
  Calendar,
  Download,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: typeof BarChart3;
  iconBg: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'scheduled';
  category: string;
}

const REPORTS: ReportCard[] = [
  {
    id: 'r1',
    title: 'Full P&L Report',
    description: 'Monthly P&L in ₹ (Amdani/Kharcha/Munafa) + complete GST, CGST, and SGST breakdown across all transactions.',
    icon: TrendingUp,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    lastGenerated: '2025-03-15T10:30:00Z',
    status: 'ready',
    category: 'Financial',
  },
  {
    id: 'r2',
    title: 'Customer Statement',
    description: 'Individual customer account statements showing all debits, credits, and running balance for a selected time period.',
    icon: Users,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    lastGenerated: '2025-03-14T14:00:00Z',
    status: 'ready',
    category: 'Accounts',
  },
  {
    id: 'r3',
    title: 'Outstanding Receivables',
    description: 'Aging analysis of all outstanding invoices segmented by 30/60/90+ day buckets with customer-wise drill-down.',
    icon: AlertCircle,
    iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
    lastGenerated: '2025-03-13T09:15:00Z',
    status: 'ready',
    category: 'Financial',
  },
  {
    id: 'r4',
    title: 'Payment Summary',
    description: 'Consolidated payment log grouped by method (cash, bank transfer, card) with totals and daily/weekly trends.',
    icon: CreditCard,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400',
    lastGenerated: '2025-03-12T16:45:00Z',
    status: 'ready',
    category: 'Financial',
  },
  {
    id: 'r5',
    title: 'Invoice Register',
    description: 'Complete register of all invoices issued with status tracking, due dates, and customer mapping for audit trails.',
    icon: FileText,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    lastGenerated: '2025-03-11T11:00:00Z',
    status: 'ready',
    category: 'Compliance',
  },
  {
    id: 'r6',
    title: 'Inventory Valuation',
    description: 'Current inventory stock-in-hand valuation report with cost breakdowns per category and product.',
    icon: IndianRupee,
    iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
    lastGenerated: '2025-03-10T08:30:00Z',
    status: 'scheduled',
    category: 'Inventory',
  },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export function Reports() {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(REPORTS.map(r => r.category)))];

  const filtered = REPORTS.filter(r =>
    categoryFilter === 'All' || r.category === categoryFilter
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Reports</h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Generate, view, and download business reports for audit and compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-full border-border/60 shadow-sm font-semibold px-5">
            <Calendar className="h-4 w-4 text-muted-foreground" /> FY 2024–25
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
              categoryFilter === cat
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white dark:bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((report, idx) => (
          <Card
            key={report.id}
            className="group relative overflow-hidden bg-white/60 dark:bg-card backdrop-blur-sm border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl -z-10 translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${report.iconBg}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                    report.status === 'ready'
                      ? 'text-emerald-600 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/30'
                      : report.status === 'scheduled'
                        ? 'text-amber-600 border-amber-500/20 bg-amber-50 dark:bg-amber-900/30'
                        : 'text-blue-600 border-blue-500/20 bg-blue-50 dark:bg-blue-900/30'
                  }`}
                >
                  {report.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">{report.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between gap-5">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {report.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last generated: {formatDate(report.lastGenerated)} at {formatTime(report.lastGenerated)}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-full font-semibold text-xs h-9">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" className="flex-1 gap-1.5 rounded-full font-semibold text-xs h-9 shadow-sm">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Generate Section */}
      <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-border/40 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary shrink-0">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-1">Need a Custom Report?</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-lg">
              Generate custom reports by selecting specific date ranges, customers, or transaction types.
              Export as PDF or CSV for external auditing and compliance needs.
            </p>
          </div>
          <Button className="gap-2 rounded-full font-semibold px-8 shadow-sm shrink-0">
            Generate Custom <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
