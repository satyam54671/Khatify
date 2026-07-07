import { Badge } from '@/components/ui/Badge';
import type { InvoiceStatus } from '@/types';

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariantAndLabel = (s: InvoiceStatus) => {
    switch (s) {
      case 'paid':
        return { variant: 'success' as const, label: 'Paid' };
      case 'unpaid':
        return { variant: 'warning' as const, label: 'Unpaid' };
      case 'overdue':
        return { variant: 'destructive' as const, label: 'Overdue' };
      case 'draft':
      default:
        return { variant: 'secondary' as const, label: 'Draft' };
    }
  };

  const { variant, label } = getVariantAndLabel(status);

  return <Badge variant={variant} className="capitalize">{label}</Badge>;
}

