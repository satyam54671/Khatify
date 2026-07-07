import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  change?: number; // e.g. 12.5 or -4.2
  loading?: boolean;
}

export function StatCard({ title, value, description, icon: Icon, change, loading }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-2/3 bg-muted/60 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted/60 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
            {(description || change !== undefined) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {change !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-semibold rounded-md px-1 py-0.5",
                      change >= 0
                        ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/5"
                        : "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/5"
                    )}
                  >
                    {change >= 0 ? (
                      <ArrowUpIcon className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDownIcon className="h-2.5 w-2.5" />
                    )}
                    {Math.abs(change)}%
                  </span>
                )}
                {description && <span>{description}</span>}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

