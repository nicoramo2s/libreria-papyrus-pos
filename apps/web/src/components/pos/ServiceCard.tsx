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
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary p-3 text-gold shadow-papyrus-sm transition group-hover:scale-105">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold text-primary">{service.name}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-primary/58">{service.description ?? 'Servicio de mostrador listo para sumar al ticket.'}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-2xl font-black text-primary">{currency.format(service.basePrice)}</p>
              <Button size="sm" onClick={() => onAdd(service)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
