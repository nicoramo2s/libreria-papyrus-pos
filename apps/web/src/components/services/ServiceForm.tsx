import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { servicesService } from '@/services/services';
import { Loader2, Sparkles, Coins } from 'lucide-react';
import type { CreateServiceData, UpdateServiceData } from '@/services/services';

const serviceFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive('El precio debe ser mayor a 0'),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  serviceId: string | null;
  onSubmit: (data: CreateServiceData | UpdateServiceData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-bg/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-gold/10 p-2 text-gold">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-primary/60">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function ServiceForm({
  serviceId,
  onSubmit,
  onCancel,
  isSaving = false,
}: ServiceFormProps) {
  const isEdit = serviceId !== null;

  const { data: service, isLoading: isLoadingService, isError: isErrorService } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesService.getById(serviceId!),
    enabled: isEdit,
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name || '',
        description: service.description || '',
        basePrice: service.basePrice || 0,
      });
    }
  }, [service, form.reset]);

  const handleSubmit = form.handleSubmit((values) => {
    const data = isEdit
      ? { ...values } as UpdateServiceData
      : { ...values } as CreateServiceData;
    onSubmit(data);
  });

  if (isEdit && isLoadingService) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (isEdit && isErrorService) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-xl border border-danger/20 bg-danger/5 px-5 py-4">
          <p className="text-sm font-semibold text-danger">Error al cargar el servicio</p>
          <p className="mt-1 text-xs text-danger/60">Verificá la conexión e intentá de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Información básica */}
      <SectionCard icon={Sparkles} title="Información del servicio">
        <div className="space-y-4">
          <Input
            label="Nombre *"
            placeholder="Nombre del servicio"
            error={form.formState.errors.name?.message}
            {...form.register('name')}
          />
          <Textarea
            label="Descripción"
            placeholder="Descripción del servicio (opcional)"
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
        </div>
      </SectionCard>

      {/* Precio */}
      <SectionCard icon={Coins} title="Precio">
        <Input
          label="Precio base *"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={form.formState.errors.basePrice?.message}
          {...form.register('basePrice')}
        />
      </SectionCard>

      {/* Acciones */}
      <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || isSaving}
          isLoading={form.formState.isSubmitting || isSaving}
        >
          {isEdit ? 'Actualizar servicio' : 'Crear servicio'}
        </Button>
      </div>
    </form>
  );
}
