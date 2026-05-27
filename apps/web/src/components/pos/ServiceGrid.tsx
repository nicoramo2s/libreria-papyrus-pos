import { Wrench } from 'lucide-react';
import type { Service } from '@papyrus/shared';
import { ServiceCard } from './ServiceCard';
import { Card, CardContent } from '../ui/Card';

interface ServiceGridProps {
  services: Service[];
  isLoading: boolean;
  onAdd: (service: Service) => void;
}

export function ServiceGrid({ services, isLoading, onAdd }: ServiceGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-40 animate-pulse bg-white/70" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <Wrench className="h-10 w-10 text-gold" aria-hidden="true" />
          <h3 className="mt-4 text-2xl font-bold text-primary">No hay servicios activos</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-primary/58">Cuando el backend publique servicios, aparecerán acá para sumarlos con cantidad uno.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onAdd={onAdd} />
      ))}
    </div>
  );
}
