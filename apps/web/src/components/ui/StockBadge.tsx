import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StockBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  stock: number;
  stockAlert: number;
}

export function StockBadge({ stock, stockAlert, className, ...props }: StockBadgeProps) {
  const isLowStock = stock <= stockAlert;
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
        className,
      )}
      {...props}
    >
      {stock}/{stockAlert}
    </span>
  );
}