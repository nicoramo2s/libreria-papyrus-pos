import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'neutral' | 'success' | 'danger' | 'gold';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-inverse/[0.06] text-primary',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  gold: 'bg-gold/15 text-gold',
};

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em]',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
