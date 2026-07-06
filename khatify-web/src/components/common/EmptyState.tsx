import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-card/30 backdrop-blur-sm min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 border border-primary/10 text-primary mb-4 animate-pulse">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-base mb-1 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
