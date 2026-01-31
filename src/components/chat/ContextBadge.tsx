import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextBadgeProps {
  pageName: string;
  className?: string;
}

export function ContextBadge({ pageName, className }: ContextBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
        'bg-primary/10 text-primary border border-primary/20',
        className
      )}
    >
      <MapPin className="w-3 h-3" />
      <span>{pageName}</span>
    </div>
  );
}
