import {
  TrendingUp,
  Users,
  CreditCard,
  IndianRupee,
  ArrowUpRight,
  Calendar,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Mock data for analytics
const MONTHLY_DATA = [
  { month: 'Apr', revenue: 320000, expenses: 180000, profit: 140000 },
  { month: 'May', revenue: 380000, expenses: 200000, profit: 180000 },
  { month: 'Jun', revenue: 350000, expenses: 190000, profit: 160000 },
  { month: 'Jul', revenue: 420000, expenses: 220000, profit: 200000 },
  { month: 'Aug', revenue: 390000, expenses: 210000, profit: 180000 },
  { month: 'Sep', revenue: 450000, expenses: 230000, profit: 220000 },
  { month: 'Oct', revenue: 410000, expenses: 200000, profit: 210000 },
  { month: 'Nov', revenue: 480000, expenses: 250000, profit: 230000 },
  { month: 'Dec', revenue: 520000, expenses: 270000, profit: 250000 },
  { month: 'Jan', revenue: 460000, expenses: 240000, profit: 220000 },
  { month: 'Feb', revenue: 490000, expenses: 260000, profit: 230000 },
  { month: 'Mar', revenue: 550000, expenses: 280000, profit: 270000 },
];

const PAYMENT_METHODS = [
  { method: 'Bank Transfer', percentage: 45, amount: 2160000, color: '#1F5C3A' },
  { method: 'Card Payments', percentage: 28, amount: 1344000, color: '#2E4A9E' },
  { method: 'Cash', percentage: 20, amount: 960000, color: '#C96B3C' },
  { method: 'Other', percentage: 7, amount: 336000, color: '#9ca3af' },
];

const TOP_CUSTOMERS = [
  { name: 'Wayne Enterprises', revenue: 850000, invoices: 12, trend: 15.2 },
  { name: 'Acme Corporation', revenue: 620000, invoices: 8, trend: 8.7 },
  { name: 'Stark Industries', revenue: 540000, invoices: 6, trend: 22.1 },
  { name: 'Globex Corporation', revenue: 380000, invoices: 5, trend: -3.4 },
  { name: 'Umbrella Corp', revenue: 290000, invoices: 4, trend: 11.5 },
];

export function Analytics() {
  const totalRevenue = MONTHLY_DATA.reduce((s, m) => s + m.revenue, 0);
  const totalProfit = MONTHLY_DATA.reduce((s, m) => s + m.profit, 0);
  const avgMonthly = Math.round(totalRevenue / 12);

  // Generate SVG path for line chart
  const maxRevenue = Math.max(...MONTHLY_DATA.map(m => m.revenue));
  const chartWidth = 800;
  const chartHeight = 220;
  const padding = 10;

  const getY = (val: number) => chartHeight - padding - ((val / maxRevenue) * (chartHeight - padding * 2));
  const getX = (idx: number) => padding + (idx / (MONTHLY_DATA.length - 1)) * (chartWidth - padding * 2);

  const revenuePath = MONTHLY_DATA.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.revenue)}`).join(' ');
  const profitPath = MONTHLY_DATA.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.profit)}`).join(' ');
  const expensePath = MONTHLY_DATA.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.expenses)}`).join(' ');
  const revenueAreaPath = `${revenuePath} L ${getX(MONTHLY_DATA.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`;

  // Donut chart calculations
  const donutRadius = 40;
  const circumference = 2 * Math.PI * donutRadius;
  let cumulativeOffset = 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Visual business intelligence and performance metrics for your enterprise.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-white dark:bg-card rounded-full shadow-sm border-border/60 font-medium">
          <Calendar className="h-4 w-4 text-muted-foreground" /> FY 2024–25
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Annual Revenue', value: formatCurrency(totalRevenue), icon: IndianRupee, color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400', valueColor: 'text-emerald-600 dark:text-emerald-400', change: 18.4 },
          { title: 'Net Profit', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400', valueColor: 'text-blue-600 dark:text-blue-400', change: 12.7 },
          { title: 'Avg Monthly', value: formatCurrency(avgMonthly), icon: CreditCard, color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400', valueColor: 'text-foreground', change: 9.2 },
          { title: 'Total Clients', value: '1,247', icon: Users, color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', valueColor: 'text-foreground', change: 23 },
        ].map(kpi => (
          <Card key={kpi.title} className="p-5 border-border/60 bg-white/50 dark:bg-card backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +{kpi.change}%
              </div>
            </div>
            <div className={`text-2xl font-black ${kpi.valueColor}`}>{kpi.value}</div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{kpi.title}</div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Trend Chart */}
        <Card className="md:col-span-2 rounded-2xl border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <div className="text-sm font-medium text-muted-foreground mt-0.5">FY 2024-25 · Monthly breakdown</div>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-600 rounded-full" /> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#C96B3C] rounded-full" /> Expenses</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600 rounded-full" /> Profit</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[280px] mt-4 relative">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map(frac => (
                  <line
                    key={frac}
                    x1={padding} y1={getY(maxRevenue * frac)}
                    x2={chartWidth - padding} y2={getY(maxRevenue * frac)}
                    stroke="currentColor" className="text-border" strokeWidth="1" strokeDasharray="4 4"
                  />
                ))}

                {/* Revenue fill area */}
                <path d={revenueAreaPath} fill="url(#analyticsGreenGradient)" opacity="0.12" />

                {/* Expense line */}
                <path d={expensePath} fill="none" stroke="#C96B3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Profit line */}
                <path d={profitPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Revenue line */}
                <path d={revenuePath} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points on revenue */}
                {MONTHLY_DATA.map((m, i) => (
                  <circle key={i} cx={getX(i)} cy={getY(m.revenue)} r="4" fill="#16a34a" stroke="white" strokeWidth="2" />
                ))}

                <defs>
                  <linearGradient id="analyticsGreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* X-axis labels */}
              <div className="absolute bottom-0 w-full flex justify-between text-[11px] font-medium text-muted-foreground px-4">
                {MONTHLY_DATA.map(m => <span key={m.month}>{m.month}</span>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Donut */}
        <Card className="rounded-2xl border-border/40 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <div className="text-sm font-medium text-muted-foreground mt-0.5">Distribution this year</div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2 pb-6">
            <div className="relative w-48 h-48 mb-8">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {PAYMENT_METHODS.map(pm => {
                  const dashLength = (pm.percentage / 100) * circumference;
                  const offset = cumulativeOffset;
                  cumulativeOffset += dashLength;
                  return (
                    <circle
                      key={pm.method}
                      cx="50" cy="50" r={donutRadius}
                      fill="transparent"
                      stroke={pm.color}
                      strokeWidth="14"
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-foreground">₹48L</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</div>
              </div>
            </div>

            <div className="w-full space-y-3 px-2">
              {PAYMENT_METHODS.map(pm => (
                <div key={pm.method} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                    <span className="font-medium">{pm.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">{pm.percentage}%</span>
                    <span className="font-semibold text-foreground">{formatCurrency(pm.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Customers by Revenue</CardTitle>
              <div className="text-sm font-medium text-muted-foreground mt-0.5">Highest revenue-generating accounts</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full font-semibold text-xs px-4 gap-1.5">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Rank</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="text-right pr-6">Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOP_CUSTOMERS.map((cust, idx) => (
              <TableRow key={cust.name} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                <TableCell className="pl-6 py-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shadow-sm ${
                    idx === 0 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                    idx === 1 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300' :
                    idx === 2 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' :
                    'bg-muted/50 text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold text-sm">
                      {cust.name.charAt(0)}
                    </div>
                    <span className="font-bold text-[15px] text-foreground">{cust.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 font-black text-foreground">{formatCurrency(cust.revenue)}</TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="font-semibold text-muted-foreground bg-zinc-50 dark:bg-zinc-800 border-border/60 text-xs">
                    {cust.invoices} invoices
                  </Badge>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <span className={`text-sm font-bold ${cust.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {cust.trend >= 0 ? '+' : ''}{cust.trend}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
