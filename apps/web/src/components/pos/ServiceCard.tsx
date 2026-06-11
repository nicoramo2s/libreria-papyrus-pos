import { Plus, Sparkles } from 'lucide-react';
import type { Service } from '@papyrus/shared';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface ServiceCardProps {
  service: Service;
  onAdd: (service: Service) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function ServiceCard({ service, onAdd }: ServiceCardProps) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-papyrus">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="rounded-xl bg-inverse p-2 text-gold shadow-papyrus-sm transition group-hover:scale-105 sm:rounded-2xl sm:p-3">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-primary sm:text-lg">{service.name}</h3>
            <p className="mt-1 min-h-0 text-xs leading-5 text-primary/58 sm:mt-2 sm:min-h-12 sm:text-sm sm:leading-6">{service.description ?? 'Servicio de mostrador listo para sumar al ticket.'}</p>
            <div className="mt-3 flex items-center justify-between gap-3 sm:mt-5">
              <p className="text-lg font-black text-primary sm:text-2xl">{currency.format(service.basePrice)}</p>
              <Button size="sm" onClick={() => onAdd(service)} className="h-7 text-[10px] sm:h-auto sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
