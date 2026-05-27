import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, Sparkles, Wrench, Loader2 } from 'lucide-react';
import type { Service } from '@papyrus/shared';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

interface ServiceTableProps {
  services: Service[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ServiceTable({
  services,
  onEdit,
  onDelete,
  isLoading = false,
}: ServiceTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface/60">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-primary/50">Cargando servicios…</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface/60">
        <Wrench className="h-10 w-10 text-primary/25" />
        <div className="text-center">
          <p className="text-sm font-semibold text-primary/55">
            No hay servicios para mostrar
          </p>
          <p className="mt-1 text-xs text-primary/40">
            Agregá servicios desde el botón "Nuevo servicio".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-papyrus">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/60">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Servicio
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Descripción
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Precio base
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Estado
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((service) => (
              <tr
                key={service.id}
                className="transition hover:bg-gold/[0.03]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-primary">
                      {service.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-primary/60">
                    {service.description || (
                      <span className="text-primary/35">—</span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-primary">
                    {formatCurrency(service.basePrice)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={service.isActive ? 'success' : 'neutral'}>
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(service.id)}
                      aria-label="Editar servicio"
                      className="hover:text-gold"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(service.id)}
                      aria-label="Eliminar servicio"
                      className="hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
