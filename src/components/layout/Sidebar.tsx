import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  CreditCard,
  BookOpen,
  BarChart3,
  PieChart,
  Settings,
  X,
  BookText,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const navGroups = [
    {
      title: '',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Inventory', path: '/inventory', icon: Boxes },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Invoices', path: '/invoices', icon: FileText },
        { label: 'Payments', path: '/payments', icon: CreditCard },
        { label: 'Khata / Ledger', path: '/ledger', icon: BookOpen },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Analytics', path: '/analytics', icon: PieChart },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shadow-xl lg:shadow-none",
          isCollapsed ? "w-[72px]" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className={cn("flex h-20 items-center px-6 shrink-0", isCollapsed ? "justify-center px-0" : "justify-between")}>
          <NavLink to="/" className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")} onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm shrink-0">
              <BookText className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">
                  Khatify
                </span>
                <span className="text-[10px] font-medium text-sidebar-foreground/70 tracking-wide uppercase">
                  Business Platform
                </span>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent lg:hidden transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {group.title && !isCollapsed && (
                <span className="px-4 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase mb-1">
                  {group.title}
                </span>
              )}
              {group.title && isCollapsed && (
                <div className="w-8 h-px bg-sidebar-foreground/20 mx-auto mb-1" />
              )}
              {group.items.map((item, i) => {
                const isActive = item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path);

                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIdx * 3 + i) * 0.03, duration: 0.2 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center rounded-xl text-[14px] font-medium transition-all duration-200",
                        isCollapsed
                          ? "justify-center w-11 h-11 mx-auto"
                          : "justify-between px-4 py-2.5",
                        isActive
                          ? "bg-sidebar-active text-white shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
                      )}
                    >
                      <div className={cn("flex items-center", isCollapsed ? "" : "gap-3")}>
                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/90"
                        )} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      
                      {isActive && !isCollapsed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle — desktop only */}
        <div className="hidden lg:flex px-3 py-2 shrink-0">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent/50 transition-all duration-200",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Profile Widget */}
        <div className={cn("p-3 mt-auto shrink-0", isCollapsed ? "px-2" : "p-4")}>
          <div className={cn(
            "flex items-center rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-3"
          )}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-bold text-sm text-sidebar shadow-sm shrink-0">
              R
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">Rajiv Sharma</span>
                <span className="text-[11px] text-sidebar-foreground/70 truncate">Admin · Mumbai</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
