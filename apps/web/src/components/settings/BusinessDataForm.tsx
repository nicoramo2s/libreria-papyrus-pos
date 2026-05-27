import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUpdateSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const businessDataSchema = z.object({
  business_name: z.string().min(1, 'El nombre es requerido'),
  business_address: z.string().optional(),
  business_phone: z.string().min(1, 'El teléfono es requerido'),
  ticket_message: z.string().optional(),
});

type BusinessDataValues = z.infer<typeof businessDataSchema>;

interface BusinessDataFormProps {
  defaultValues: Partial<BusinessDataValues>;
  isLoading?: boolean;
}

export function BusinessDataForm({ defaultValues, isLoading = false }: BusinessDataFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<BusinessDataValues>({
    resolver: zodResolver(businessDataSchema),
    values: {
      business_name: defaultValues.business_name ?? '',
      business_address: defaultValues.business_address ?? '',
      business_phone: defaultValues.business_phone ?? '',
      ticket_message: defaultValues.ticket_message ?? '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateSettings(data, {
      onSuccess: () => {
        toast.success('Datos del negocio actualizados');
      },
      onError: (error) => {
        toast.error('Error al actualizar datos del negocio');
      },
    });
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-border/50" />
        <div className="h-[100px] w-full animate-pulse rounded-xl bg-border/50" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del negocio *"
        placeholder="Nombre de la librería"
        error={form.formState.errors.business_name?.message}
        {...form.register('business_name')}
      />
      <Input
        label="Dirección"
        placeholder="Dirección del negocio"
        error={form.formState.errors.business_address?.message}
        {...form.register('business_address')}
      />
      <Input
        label="Teléfono *"
        placeholder="Teléfono de contacto"
        error={form.formState.errors.business_phone?.message}
        {...form.register('business_phone')}
      />
      <Textarea
        label="Mensaje en ticket"
        placeholder="Mensaje personalizado que aparece en los tickets"
        error={form.formState.errors.ticket_message?.message}
        {...form.register('ticket_message')}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isPending}>
          Guardar datos del negocio
        </Button>
      </div>
    </form>
  );
}
