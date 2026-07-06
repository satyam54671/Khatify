import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BookOpen,
  X,
  BookText
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Ledger', path: '/ledger', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border/60">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-active text-sidebar-active-foreground shadow-sm">
              <BookText className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-base tracking-tight text-sidebar-foreground">
              Khatify
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-foreground font-semibold shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-sidebar-border/60 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent font-bold text-xs border border-sidebar-border text-sidebar-foreground">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">Admin Dashboard</span>
              <span className="text-[10px] text-sidebar-foreground/60 truncate">billing@khatify.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
