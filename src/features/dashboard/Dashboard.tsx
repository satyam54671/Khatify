import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dbService } from '@/services/db';
import { StatCard } from '@/components/common/StatCard';
import { 
  Plus, 
  Calendar,
  IndianRupee,
  Users,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Monthly data for FY 2024-25
const MONTHLY_REVENUE = [
  { month: 'Apr', revenue: 320, expenses: 180, profit: 140 },
  { month: 'May', revenue: 380, expenses: 200, profit: 180 },
  { month: 'Jun', revenue: 350, expenses: 190, profit: 160 },
  { month: 'Jul', revenue: 420, expenses: 240, profit: 180 },
  { month: 'Aug', revenue: 390, expenses: 210, profit: 180 },
  { month: 'Sep', revenue: 450, expenses: 230, profit: 220 },
  { month: 'Oct', revenue: 410, expenses: 200, profit: 210 },
  { month: 'Nov', revenue: 480, expenses: 260, profit: 220 },
  { month: 'Dec', revenue: 520, expenses: 280, profit: 240 },
  { month: 'Jan', revenue: 460, expenses: 250, profit: 210 },
  { month: 'Feb', revenue: 500, expenses: 270, profit: 230 },
  { month: 'Mar', revenue: 560, expenses: 290, profit: 270 },
];

export function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dbService.getDashboardStats,
  });

  const [activePoint, setActivePoint] = useState<any>(null);

  const maxVal = 600; // max y-axis value in thousands
  const chartH = 240;
  const barW = 38;
  const gap = 20;

  // Dynamically generate points for the chart based on revenue
  const points = MONTHLY_REVENUE.map((m, i) => {
    return {
      x: (i / (MONTHLY_REVENUE.length - 1)) * 1000,
      y: 300 - (m.revenue / maxVal) * 260, // 260 to leave padding
      ...m
    };
  });

  // Generate smooth SVG curve using cubic bezier
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const areaD = `${pathD} L 1000 300 L 0 300 Z`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Good morning, Sharma Ji! <span className="text-2xl">🙏</span>
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Here's your business at a glance — March 2025
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white dark:bg-card rounded-full shadow-sm border-border/60 font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Mar 2025
          </Button>
          <Button 
            className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6"
            onClick={() => navigate('/invoices?create=true')}
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="₹48.2L"
          change={12.4}
          description="vs last month"
          icon={IndianRupee}
          iconColor="green"
          trend="up"
          loading={statsLoading}
        />
        <StatCard
          title="Active Customers"
          value="1,247"
          change={23}
          description="this month"
          icon={Users}
          iconColor="blue"
          trend="up"
          loading={statsLoading}
        />
        <StatCard
          title="Outstanding"
          value="₹8.74L"
          description="12 invoices pending"
          icon={AlertCircle}
          iconColor="red"
          trend="high"
          loading={statsLoading}
        />
        <StatCard
          title="Net Profit"
          value="₹22.4L"
          change={8.1}
          description="vs last month"
          icon={TrendingUp}
          iconColor="yellow"
          trend="up"
          loading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Overview Area Chart */}
        <Card className="md:col-span-2 rounded-2xl border-border/40 shadow-sm relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
              <div className="text-sm font-medium text-muted-foreground mt-0.5">FY 2024-25 · Monthly breakdown</div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#8A6B4E] rounded-full" /> Revenue Trend</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] mt-2 relative flex items-end">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] font-medium text-muted-foreground pb-8 pr-2 z-10">
                <span>₹600K</span>
                <span>₹450K</span>
                <span>₹300K</span>
                <span>₹150K</span>
                <span>₹0K</span>
              </div>

              {/* Chart area */}
              <div 
                className="flex-1 ml-12 relative h-full pb-8" 
                onMouseLeave={() => setActivePoint(null)}
              >
                <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map(frac => (
                    <line
                      key={frac}
                      x1="0" y1={300 * frac}
                      x2="1000" y2={300 * frac}
                      stroke="currentColor" className="text-border/60" strokeWidth="1" strokeDasharray="4 4"
                    />
                  ))}
                  
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A6B4E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8A6B4E" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Smooth curve for revenue/profit matching Figma visual */}
                  <motion.path 
                    d={areaD} 
                    fill="url(#areaGradient)" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                  <motion.path 
                    d={pathD} 
                    fill="none" 
                    stroke="#8A6B4E" 
                    strokeWidth="4" 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                  />
                  
                  {/* Data points and invisible hover zones */}
                  {points.map((pt, i) => (
                    <g key={i} onMouseEnter={() => setActivePoint(pt)}>
                      <motion.circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={activePoint?.month === pt.month ? "6" : "4"} 
                        fill="#8A6B4E" 
                        stroke="white" 
                        strokeWidth="2" 
                        className="transition-all duration-200"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1.2 + (i * 0.05), ease: "backOut" }}
                      />
                      {/* Invisible larger circle to make hovering easier */}
                      <circle cx={pt.x} cy={pt.y} r="25" fill="transparent" className="cursor-pointer" />
                    </g>
                  ))}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-[11px] font-medium text-muted-foreground px-1">
                  {MONTHLY_REVENUE.map(m => (
                    <span key={m.month} className="flex-1 text-center">{m.month}</span>
                  ))}
                </div>

                {/* HTML Tooltip Overlay */}
                {activePoint && (
                  <div 
                    className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
                    style={{ left: `${(activePoint.x / 1000) * 100}%`, top: `${(activePoint.y / 300) * 100}%` }}
                  >
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/95 dark:bg-zinc-800 backdrop-blur-md text-white text-[11px] font-medium p-3 rounded-xl shadow-xl border border-white/10 whitespace-nowrap min-w-[120px]"
                    >
                      <div className="font-bold text-[13px] border-b border-white/10 pb-1.5 mb-1.5">{activePoint.month} 2024</div>
                      <div className="flex justify-between gap-4 py-0.5">
                        <span className="text-white/70">Revenue</span>
                        <span className="text-emerald-400 font-bold">₹{activePoint.revenue}K</span>
                      </div>
                      <div className="flex justify-between gap-4 py-0.5">
                        <span className="text-white/70">Expenses</span>
                        <span className="text-rose-400 font-bold">₹{activePoint.expenses}K</span>
                      </div>
                      <div className="flex justify-between gap-4 py-0.5 border-t border-white/10 mt-1 pt-1">
                        <span className="text-white">Profit</span>
                        <span className="text-gold font-bold">₹{activePoint.profit}K</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category Donut Chart */}
        <Card className="rounded-2xl border-border/40 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
            <div className="text-sm font-medium text-muted-foreground mt-0.5">This month</div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2 pb-6">
            <div className="relative w-48 h-48 mb-8">
              {/* Donut Chart via SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const data = [
                    { value: 145, color: '#1F5C3A' }, // Grains
                    { value: 89, color: '#2E4A9E' },  // Pulses
                    { value: 67, color: '#C96B3C' },  // Oils
                    { value: 52, color: '#eab308' },  // Groceries
                    { value: 31, color: '#4b5563' },  // Others
                  ];
                  const total = data.reduce((sum, item) => sum + item.value, 0);
                  const circumference = 2 * Math.PI * 40;
                  let cumulativeOffset = 0;
                  
                  return data.map((item, idx) => {
                    const dashLength = (item.value / total) * circumference;
                    const offset = cumulativeOffset;
                    cumulativeOffset += dashLength;
                    
                    return (
                      <circle
                        key={idx}
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                        strokeDashoffset={-offset}
                      />
                    );
                  });
                })()}
              </svg>
            </div>
            
            <div className="w-full space-y-2.5 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1F5C3A]" /> <span className="font-medium">Grains</span></div>
                <span className="font-semibold text-foreground">₹145K</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#2E4A9E]" /> <span className="font-medium">Pulses</span></div>
                <span className="font-semibold text-foreground">₹89K</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#C96B3C]" /> <span className="font-medium">Oils</span></div>
                <span className="font-semibold text-foreground">₹67K</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> <span className="font-medium">Groceries</span></div>
                <span className="font-semibold text-foreground">₹52K</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-600" /> <span className="font-medium">Others</span></div>
                <span className="font-semibold text-foreground">₹31K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
