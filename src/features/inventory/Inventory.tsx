import { useState } from 'react';
import {
  Search,
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
  TrendingDown,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  lastRestocked: string;
  costPerUnit: number;
}

const INVENTORY_DATA: InventoryItem[] = [
  { id: 'inv1', productName: 'Basmati Rice (Premium)', sku: 'GRN-001', category: 'Grains', currentStock: 250, minThreshold: 50, unit: 'kg', lastRestocked: '2025-03-01', costPerUnit: 120 },
  { id: 'inv2', productName: 'Toor Dal', sku: 'PLS-001', category: 'Pulses', currentStock: 150, minThreshold: 30, unit: 'kg', lastRestocked: '2025-02-28', costPerUnit: 95 },
  { id: 'inv3', productName: 'Sunflower Oil (1L)', sku: 'OIL-001', category: 'Oil & Ghee', currentStock: 12, minThreshold: 20, unit: 'bottle', lastRestocked: '2025-02-15', costPerUnit: 140 },
  { id: 'inv4', productName: 'Sugar (Refined)', sku: 'SGR-001', category: 'Sweeteners', currentStock: 300, minThreshold: 80, unit: 'kg', lastRestocked: '2025-03-05', costPerUnit: 42 },
  { id: 'inv5', productName: 'Amul Butter (500g)', sku: 'DRY-001', category: 'Dairy', currentStock: 0, minThreshold: 15, unit: 'pack', lastRestocked: '2025-01-20', costPerUnit: 275 },
  { id: 'inv6', productName: 'Wheat Flour (Atta)', sku: 'GRN-002', category: 'Grains', currentStock: 500, minThreshold: 100, unit: 'kg', lastRestocked: '2025-03-10', costPerUnit: 45 },
  { id: 'inv7', productName: 'Chana Dal', sku: 'PLS-002', category: 'Pulses', currentStock: 35, minThreshold: 40, unit: 'kg', lastRestocked: '2025-02-20', costPerUnit: 78 },
  { id: 'inv8', productName: 'Mustard Oil (5L)', sku: 'OIL-002', category: 'Oil & Ghee', currentStock: 65, minThreshold: 20, unit: 'can', lastRestocked: '2025-03-02', costPerUnit: 620 },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type StockStatus = 'in-stock' | 'low' | 'out';

function getStockStatus(current: number, threshold: number): StockStatus {
  if (current === 0) return 'out';
  if (current < threshold) return 'low';
  return 'in-stock';
}

export function Inventory() {
  const [items] = useState<InventoryItem[]>(INVENTORY_DATA);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');

  const totalSKUs = items.length;
  const totalStockValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
  const lowStockCount = items.filter(i => i.currentStock > 0 && i.currentStock < i.minThreshold).length;
  const outOfStockCount = items.filter(i => i.currentStock === 0).length;

  const filtered = items.filter(i => {
    const matchSearch = i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(i.currentStock, i.minThreshold);
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Track stock levels, monitor thresholds, and manage restocking alerts.
          </p>
        </div>
        <Button className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6">
          <RefreshCw className="h-4 w-4" /> Restock Items
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-border/60 bg-white/50 dark:bg-card backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total SKUs</span>
          </div>
          <div className="text-2xl font-black text-foreground">{totalSKUs}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 dark:bg-card backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Stock Value</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalStockValue)}</div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 dark:bg-card backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Low Stock</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockCount} <span className="text-base font-semibold text-muted-foreground">items</span></div>
        </Card>
        <Card className="p-5 border-border/60 bg-white/50 dark:bg-card backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg">
              <XCircle className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Out of Stock</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{outOfStockCount} <span className="text-base font-semibold text-muted-foreground">items</span></div>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/40 bg-zinc-50/50 dark:bg-transparent flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-card rounded-full border-border/60 shadow-sm h-10"
            />
          </div>
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/60 p-1 rounded-xl border border-border/40 self-start sm:self-auto">
            {(['all', 'in-stock', 'low', 'out'] as const).map(status => (
              <button
                key={status}
                className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-foreground ring-1 ring-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'in-stock' ? 'In Stock' : status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">Current Stock <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" /></div>
                </TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Last Restocked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => {
                const status = getStockStatus(item.currentStock, item.minThreshold);
                return (
                  <TableRow key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="pl-6 py-4 font-bold text-[15px] text-foreground">{item.productName}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-semibold text-muted-foreground bg-zinc-50 dark:bg-zinc-800 border-border/60 text-xs">{item.sku}</Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-semibold text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="py-4">
                      <span className={`font-bold text-sm ${status === 'out' ? 'text-rose-600 dark:text-rose-400' : status === 'low' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground font-medium">{item.minThreshold} {item.unit}</TableCell>
                    <TableCell className="py-4">
                      {status === 'in-stock' && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 gap-1.5 font-bold shadow-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" /> In Stock
                        </Badge>
                      )}
                      {status === 'low' && (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 gap-1.5 font-bold shadow-sm">
                          <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                        </Badge>
                      )}
                      {status === 'out' && (
                        <Badge variant="outline" className="text-rose-600 border-rose-500/20 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-0.5 gap-1.5 font-bold shadow-sm">
                          <XCircle className="h-3.5 w-3.5" /> Out of Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right text-sm text-muted-foreground font-medium">{formatDate(item.lastRestocked)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Boxes className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No inventory items found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Adjust your filters or add products to start tracking inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
