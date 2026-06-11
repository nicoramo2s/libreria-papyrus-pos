import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="space-y-2">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-semibold text-primary">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helpText ? descriptionId : undefined}
          className={cn(
            'focus-ring h-11 w-full rounded-xl border border-border dark:bg-surface/90 bg-white/90 px-3 text-sm text-primary placeholder:text-primary/35 shadow-sm outline-none',
            error ? 'border-danger focus-visible:ring-danger' : 'hover:border-gold/60',
            className,
          )}
          {...props}
        />
        {error || helpText ? (
          <p id={descriptionId} className={cn('text-xs', error ? 'text-danger' : 'text-primary/55')}>
            {error ?? helpText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
