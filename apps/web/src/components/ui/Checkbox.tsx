import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'h-4 w-4 shrink-0 rounded border-primary bg-[var(--background)] transition-[background-color,_border-color] data-[state=checked]:bg-inverse data-[state=checked]:border-inverse',
        className,
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <CheckboxIndicator className={cn('flex items-center justify-center', 'data-[state=checked]:text-primary-foreground')} />
    </CheckboxPrimitive.Root>
  );
}

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export const CheckboxIndicator = CheckboxPrimitive.Indicator;