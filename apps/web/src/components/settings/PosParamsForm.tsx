import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const posParamsSchema = z.object({
  max_discount_percent: z.coerce
    .number()
    .min(0, 'El descuento mínimo es 0%')
    .max(100, 'El descuento máximo es 100%'),
  ticket_prefix: z
    .string()
    .min(1, 'El prefijo debe tener entre 1 y 10 caracteres')
    .max(10, 'El prefijo debe tener entre 1 y 10 caracteres'),
});

type PosParamsValues = z.infer<typeof posParamsSchema>;

interface PosParamsFormProps {
  defaultValues: Partial<PosParamsValues>;
  isLoading?: boolean;
}

export function PosParamsForm({ defaultValues, isLoading = false }: PosParamsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<PosParamsValues>({
    resolver: zodResolver(posParamsSchema),
    values: {
      max_discount_percent: defaultValues.max_discount_percent ?? 0,
      ticket_prefix: defaultValues.ticket_prefix ?? '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateSettings(
      {
        max_discount_percent: String(data.max_discount_percent),
        ticket_prefix: data.ticket_prefix,
      },
      {
        onSuccess: () => {
          toast.success('Parámetros POS actualizados');
        },
        onError: () => {
          toast.error('Error al actualizar parámetros POS');
        },
      },
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Descuento máximo (%)"
        type="number"
        min="0"
        max="100"
        step="0.01"
        placeholder="0"
        error={form.formState.errors.max_discount_percent?.message}
        {...form.register('max_discount_percent')}
      />
      <Input
        label="Prefijo de ticket"
        placeholder="Ej: LV, FAC, TKT"
        maxLength={10}
        error={form.formState.errors.ticket_prefix?.message}
        {...form.register('ticket_prefix')}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isPending}>
          Guardar parámetros POS
        </Button>
      </div>
    </form>
  );
}
