import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
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
    if (path.startsWith('/invoices')) return 'Invoices';
    if (path.startsWith('/payments')) return 'Payments';
    if (path.startsWith('/ledger')) return 'Ledger';
    return 'Khatify';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-base font-semibold tracking-tight text-foreground select-none">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground h-8 w-8"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
