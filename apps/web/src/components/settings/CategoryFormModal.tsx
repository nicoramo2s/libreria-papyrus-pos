import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Trash2 } from 'lucide-react';
import type { Category } from '@papyrus/shared';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormModalProps {
  category: Category | null;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CategoryFormModal({ category, onSubmit, onCancel, isPending }: CategoryFormModalProps) {
  const isEdit = category !== null;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '#B8922A',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || '',
        icon: category.icon || '',
        color: category.color || '#B8922A',
      });
    } else {
      form.reset({
        name: '',
        icon: '',
        color: '#B8922A',
      });
    }
  }, [category]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6 mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-primary">
            {isEdit ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            placeholder="Nombre de la categoría"
            error={form.formState.errors.name?.message}
            {...form.register('name')}
          />
          <Input
            label="Icono"
            placeholder="Nombre del icono (ej: BookOpen)"
            error={form.formState.errors.icon?.message}
            {...form.register('icon')}
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                {...form.register('color')}
              />
              <Input
                placeholder="#B8922A"
                className="flex-1 font-mono"
                error={form.formState.errors.color?.message}
                {...form.register('color')}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:justify-end md:gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending}
            >
              {isEdit ? 'Actualizar categoría' : 'Crear categoría'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
