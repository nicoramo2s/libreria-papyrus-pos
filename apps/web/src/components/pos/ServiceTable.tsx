import { Sparkles, Plus, Wrench } from 'lucide-react';
import type { Service } from '@papyrus/shared';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
  onAdd: (service: Service) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function ServiceTable({ services, isLoading, onAdd }: ServiceTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-papyrus">
        <div className="space-y-0 divide-y divide-border/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-3 py-2.5">
              <div className="h-3.5 w-7 rounded-lg bg-inverse/10" />
              <div className="h-3.5 flex-1 rounded bg-inverse/10" />
              <div className="h-3.5 w-28 rounded bg-inverse/10" />
              <div className="h-3.5 w-16 rounded bg-inverse/10" />
              <div className="h-7 w-14 rounded-xl bg-inverse/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
        <Wrench className="h-10 w-10 text-primary/20" />
        <div>
          <p className="text-sm font-semibold text-primary/55">No hay servicios activos</p>
          <p className="mt-1 text-xs text-primary/40">Cuando se agreguen servicios, aparecerán acá listos para sumar al ticket.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-papyrus">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-bg/40">
              <th className="px-3 py-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/35">Servicio</span>
              </th>
              <th className="hidden px-3 py-2 text-left md:table-cell">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/35">Descripción</span>
              </th>
              <th className="px-3 py-2 text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/35">Precio</span>
              </th>
              <th className="w-20 px-3 py-2 text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/35">Acción</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {services.map((service) => (
              <tr
                key={service.id}
                className="transition hover:bg-gold/[0.03]"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-primary">{service.name}</span>
                  </div>
                </td>
                <td className="hidden px-3 py-2.5 md:table-cell">
                  <p className="line-clamp-1 text-xs text-primary/55">
                    {service.description ?? <span className="text-primary/30">—</span>}
                  </p>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="text-sm font-bold tabular-nums text-primary">{currency.format(service.basePrice)}</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button
                    size="sm"
                    onClick={() => onAdd(service)}
                    className="h-7 px-2 text-[10px]"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="hidden md:inline">Agregar</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border/30 px-3 py-1.5">
        <p className="text-[11px] text-primary/40">
          <span className="font-semibold text-primary/60">{services.length}</span> servicio{services.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
