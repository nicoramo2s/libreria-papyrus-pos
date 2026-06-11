import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-inverse text-white shadow-papyrus-sm hover:-translate-y-0.5 hover:bg-inverse/90',
  secondary: 'border border-border bg-surface text-primary hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10',
  ghost: 'text-primary hover:bg-inverse/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', isLoading = false, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
