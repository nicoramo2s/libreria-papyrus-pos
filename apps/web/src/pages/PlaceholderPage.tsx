import { type LucideIcon } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

interface PlaceholderPageProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}

export default function PlaceholderPage({ icon: Icon, eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.72fr_1fr] lg:p-10">
        <div className="rounded-[1.75rem] border border-gold/25 bg-gold/10 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-inverse text-gold-light shadow-papyrus-sm">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
          <Badge variant="gold" className="mt-8">{eyebrow}</Badge>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-primary/62">{description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Estructura creada', 'Diseño consistente', 'API preparada'].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-bg/70 p-4 text-sm font-semibold text-primary/64">
                {item}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
