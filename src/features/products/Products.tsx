import { useState } from 'react';
import { Plus, Search, Package, Tag, TrendingUp, MoreVertical, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Basmati Rice (Premium)', sku: 'GRN-001', category: 'Grains', price: 120, stock: 250, unit: 'kg' },
  { id: 'p2', name: 'Toor Dal', sku: 'PLS-001', category: 'Pulses', price: 95, stock: 150, unit: 'kg' },
  { id: 'p3', name: 'Sunflower Oil (1L)', sku: 'OIL-001', category: 'Oil & Ghee', price: 140, stock: 80, unit: 'bottle' },
  { id: 'p4', name: 'Sugar (Refined)', sku: 'SGR-001', category: 'Sweeteners', price: 42, stock: 300, unit: 'kg' },
  { id: 'p5', name: 'Amul Butter (500g)', sku: 'DRY-001', category: 'Dairy', price: 275, stock: 40, unit: 'pack' },
  { id: 'p6', name: 'Wheat Flour (Atta)', sku: 'GRN-002', category: 'Grains', price: 45, stock: 500, unit: 'kg' },
];

const CATEGORIES = ['All', 'Grains', 'Pulses', 'Oil & Ghee', 'Sweeteners', 'Dairy'];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export function Products() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: 'Grains', price: '', stock: '', unit: 'kg' });

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 50).length;

  const handleAdd = () => {
    if (!form.name || !form.price) return;
    const newProduct: Product = {
      id: 'p_' + Date.now(),
      name: form.name,
      sku: form.sku || 'SKU-' + Date.now(),
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
    };
    setProducts(prev => [...prev, newProduct]);
    setForm({ name: '', sku: '', category: 'Grains', price: '', stock: '', unit: 'kg' });
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">Manage your product catalog, prices, and stock units.</p>
        </div>
        <Button className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold px-6" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3 max-w-3xl">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-100 text-blue-700', text: 'text-foreground' },
          { label: 'Stock Value', value: formatCurrency(totalStockValue), icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600' },
          { label: 'Low Stock', value: `${lowStock} items`, icon: Tag, color: 'bg-amber-100 text-amber-700', text: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="p-5 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
            </div>
            <div className={`text-2xl font-black ${s.text}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/40 bg-zinc-50/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white rounded-full border-border/60 shadow-sm h-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  categoryFilter === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {cat}
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
                <TableHead>Unit Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                  <TableCell className="pl-6 py-4 font-bold text-[15px] text-foreground">{p.name}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="font-semibold text-muted-foreground bg-zinc-50 border-border/60 text-xs">{p.sku}</Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-semibold text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="py-4 font-bold text-primary">{formatCurrency(p.price)}<span className="text-xs text-muted-foreground font-medium ml-1">/ {p.unit}</span></TableCell>
                  <TableCell className="py-4">
                    <span className={`font-bold text-sm ${p.stock < 50 ? 'text-amber-600' : 'text-foreground'}`}>{p.stock} {p.unit}</span>
                    {p.stock < 50 && <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Low</span>}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first product to get started.</p>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Product</DialogTitle>
            <DialogDescription>Add a product to your catalog with pricing and stock details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Product Name *</label>
              <Input className="h-11 rounded-lg" placeholder="e.g. Basmati Rice" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">SKU</label>
                <Input className="h-11 rounded-lg" placeholder="e.g. GRN-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Category</label>
                <select className="w-full h-11 rounded-lg border border-input bg-white px-3 text-sm font-medium" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Unit Price (₹) *</label>
                <Input type="number" className="h-11 rounded-lg" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Unit</label>
                <Input className="h-11 rounded-lg" placeholder="kg" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Opening Stock</label>
              <Input type="number" className="h-11 rounded-lg" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full px-6" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="rounded-full px-8" onClick={handleAdd}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
