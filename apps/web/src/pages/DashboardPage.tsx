import { ArrowUpRight, CircleDollarSign, PackageSearch, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { StockBadge } from '@/components/ui/StockBadge';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardData } from '@/services/reports';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

const timeAgo = (dateStr: string) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

const FALLBACK_DATA: DashboardData = {
  todayRevenue: 128_450,
  todayTransactions: 43,
  averageTicket: 2_987,
  topProduct: null,
  lowStockCount: 18,
  lowStockProducts: [
    { id: '1', name: 'Cien años de soledad', stock: 2, stockAlert: 5 },
    { id: '2', name: 'Rayuela', stock: 1, stockAlert: 5 },
    { id: '3', name: 'El infinito en un junco', stock: 3, stockAlert: 5 },
    { id: '4', name: 'Ficciones', stock: 0, stockAlert: 3 },
  ],
  recentSales: [],
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-bg/60" />
              <div className="mt-3 h-9 w-32 animate-pulse rounded bg-bg/60" />
              <div className="mt-5 h-5 w-20 animate-pulse rounded-full bg-bg/60" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-bg/60" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded bg-bg/60" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-bg/60 p-4"
              >
                <div className="h-5 w-40 animate-pulse rounded bg-bg/60" />
                <div className="mt-1 h-4 w-56 animate-pulse rounded bg-bg/60" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-bg/60" />
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-bg/60" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-xl bg-bg px-4 py-3">
                <div className="h-5 w-36 animate-pulse rounded bg-bg/60" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const dashboard = data ?? FALLBACK_DATA;

  const kpis = [
    {
      label: 'Ventas de hoy',
      value: formatCurrency(dashboard.todayRevenue),
      detail: 'Actualizado en vivo',
      icon: CircleDollarSign,
      tone: 'success' as const,
    },
    {
      label: 'Tickets emitidos',
      value: String(dashboard.todayTransactions),
      detail: `Promedio ${formatCurrency(dashboard.averageTicket)}`,
      icon: ReceiptText,
      tone: 'gold' as const,
    },
    {
      label: 'Stock crítico',
      value: String(dashboard.lowStockCount),
      detail: 'Productos por debajo del mínimo',
      icon: PackageSearch,
      tone: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {isError && (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          No se pudieron cargar los datos del dashboard. Mostrando información
          estática.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="group overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary/55">
                    {kpi.label}
                  </p>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                    {kpi.value}
                  </p>
                </div>
                <div className="rounded-2xl bg-gold/[0.12] p-2.5 text-gold transition group-hover:scale-105 sm:p-3">
                  <kpi.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <Badge variant={kpi.tone} className="mt-3 sm:mt-5">
                {kpi.detail}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Movimientos recientes</CardTitle>
            <CardDescription>
              Últimas ventas registradas en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentSales.length > 0
              ? dashboard.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-bg/60 p-3 sm:p-4"
                  >
                    <div>
                      <p className="font-semibold text-primary">
                        {sale.ticketNumber}
                      </p>
                      <p className="mt-1 text-sm text-primary/52">
                        {sale.user.displayName} ·{' '}
                        {formatCurrency(sale.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary/52">
                        {timeAgo(sale.createdAt)}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-gold"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))
              : !isError && (
                  <p className="text-sm text-primary/55">
                    No hay ventas registradas hoy.
                  </p>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock bajo</CardTitle>
            <CardDescription>
              Títulos destacados para futura reposición automática.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.lowStockProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-bg px-3 py-3 sm:px-4"
              >
                <span className="font-medium text-primary">{item.name}</span>
                <StockBadge stock={item.stock} stockAlert={item.stockAlert} />
              </div>
            ))}
            <Link
              to="/products"
              className="focus-ring inline-flex rounded-xl text-sm font-bold text-gold hover:text-primary"
            >
              Ver catálogo preparado →
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
