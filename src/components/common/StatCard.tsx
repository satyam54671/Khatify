import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, AlertCircle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  change?: number;
  loading?: boolean;
  trend?: 'up' | 'down' | 'high';
  iconColor?: 'green' | 'blue' | 'red' | 'yellow';
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  change, 
  loading,
  trend = 'up',
  iconColor = 'green'
}: StatCardProps) {
  
  const colorMap = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-12 w-12 rounded-full bg-muted/60 animate-pulse" />
              <div className="h-6 w-16 bg-muted/60 animate-pulse rounded" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-8 w-24 bg-muted/60 animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
              <div className="h-3 w-40 bg-muted/60 animate-pulse rounded" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="flex items-start justify-between">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", colorMap[iconColor])}>
                <Icon className="h-6 w-6" />
              </div>
              
              {trend === 'up' && (
                <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                  <ArrowUpRight className="h-4 w-4" /> UP
                </div>
              )}
              {trend === 'high' && (
                <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                  <AlertCircle className="h-4 w-4" /> HIGH
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[28px] leading-none font-bold tracking-tight text-foreground">{value}</div>
              <div className="text-[15px] font-semibold text-foreground/80 mt-1">{title}</div>
              
              {(description || change !== undefined) && (
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  {change !== undefined && (
                    <span className={change >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                      {change >= 0 ? '+' : ''}{change}%
                    </span>
                  )}
                  {change !== undefined && description ? ' ' : ''}
                  {description}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

