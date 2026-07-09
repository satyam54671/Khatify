import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/invoices')) return 'Invoices';
    if (path.startsWith('/payments')) return 'Payments';
    if (path.startsWith('/ledger')) return 'Ledger';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/60 bg-background/80 px-8 backdrop-blur-md">
      {/* Left side - Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav className="hidden lg:flex items-center text-sm font-medium text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Khatify</span>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          <span className="text-foreground font-semibold">
            {getPageTitle(location.pathname)}
          </span>
        </nav>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="flex h-10 w-full rounded-full border border-border/60 bg-white dark:bg-card px-10 py-2 text-sm text-foreground shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            placeholder="Search anything.."
          />
        </div>
      </div>

      {/* Right side - Actions & Profile */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-accent border-2 border-background" />
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border/60 cursor-pointer group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-primary font-semibold text-sm shadow-sm group-hover:shadow-md transition-all">
            R
          </div>
          <span className="text-sm font-semibold text-foreground hidden sm:block">Rajiv</span>
        </div>
      </div>
    </header>
  );
}
