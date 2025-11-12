import { Badge } from '@/components/ui/badge';
import { Lock, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EncryptionBadgeProps {
  status: 'encrypted' | 'public' | 'processing';
  className?: string;
}

export function EncryptionBadge({ status, className }: EncryptionBadgeProps) {
  const config = {
    encrypted: {
      icon: Lock,
      label: 'Encrypted',
      variant: 'default' as const,
      className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    },
    public: {
      icon: Eye,
      label: 'Public',
      variant: 'secondary' as const,
      className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    },
    processing: {
      icon: Loader2,
      label: 'Processing FHE',
      variant: 'default' as const,
      className: 'bg-primary/10 text-primary border-primary/20',
    },
  };

  const { icon: Icon, label, className: badgeClassName } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 px-3 py-1 text-xs font-medium', badgeClassName, className)}
      data-testid={`badge-${status}`}
    >
      <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      {label}
    </Badge>
  );
}
