import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const descriptionId = `${textareaId}-description`;

    return (
      <div className="space-y-2">
        {label ? (
          <label htmlFor={textareaId} className="text-sm font-semibold text-primary">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helpText ? descriptionId : undefined}
          className={cn(
            'focus-ring min-h-[100px] w-full rounded-xl border border-border dark:bg-surface/90 bg-white/90 px-3 py-2.5 text-sm text-primary placeholder:text-primary/35 shadow-sm outline-none resize-y',
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

Textarea.displayName = 'Textarea';
