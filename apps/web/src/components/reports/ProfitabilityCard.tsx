import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Percent, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProfitability } from '@/hooks/useReports';

const fmt = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-5 transition-shadow hover:shadow-papyrus-sm ${
        highlight
          ? 'border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-800/40 dark:bg-emerald-950/20'
          : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary/50">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-primary">{value}</p>
      {sub && <p className="text-xs text-primary/50">{sub}</p>}
    </div>
  );
}

function MarginGauge({ margin }: { margin: number }) {
  const clamped = Math.min(100, Math.max(0, margin));
  const color =
    clamped >= 30 ? '#10b981' : clamped >= 15 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-primary/50">
        Margen neto
      </span>
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border,#e6dccb)" strokeWidth="3.2" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeDasharray={`${clamped} ${100 - clamped}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <span className="absolute text-xl font-bold" style={{ color }}>
          {margin}%
        </span>
      </div>
      <p className="text-xs text-primary/50">
        {clamped >= 30 ? '✅ Saludable' : clamped >= 15 ? '⚠️ Aceptable' : '🔴 Bajo'}
      </p>
    </div>
  );
}

export default function ProfitabilityCard() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [applied, setApplied] = useState({ from: fromDate, to: toDate });

  const { data, isLoading, isError } = useProfitability(applied);

  const applyFilter = () => setApplied({ from: fromDate, to: toDate });

  const setPreset = (days: number | 'month' | 'year') => {
    const to = new Date().toISOString().split('T')[0];
    let from: string;
    if (days === 'month') {
      const d = new Date();
      d.setDate(1);
      from = d.toISOString().split('T')[0];
    } else if (days === 'year') {
      const d = new Date();
      d.setMonth(0, 1);
      from = d.toISOString().split('T')[0];
    } else {
      const d = new Date();
      d.setDate(d.getDate() - days);
      from = d.toISOString().split('T')[0];
    }
    setFromDate(from);
    setToDate(to);
    setApplied({ from, to });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gold" />
            Rentabilidad
          </CardTitle>
          <CardDescription>Ingresos, costos y ganancia neta del período seleccionado.</CardDescription>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {([
            { label: '7d', value: 7 },
            { label: '30d', value: 30 },
            { label: 'Este mes', value: 'month' as const },
            { label: 'Este año', value: 'year' as const },
          ] as const).map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setPreset(value)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary/70 transition hover:border-gold/60 hover:bg-gold/5 hover:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date range filter */}
        <div className="flex flex-wrap items-end gap-3">
          {(['from', 'to'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-primary/50">
                {field === 'from' ? 'Desde' : 'Hasta'}
              </label>
              <input
                type="date"
                value={field === 'from' ? fromDate : toDate}
                onChange={(e) => (field === 'from' ? setFromDate : setToDate)(e.target.value)}
                className="focus-ring rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
              />
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={applyFilter}>
            Aplicar
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-danger/20 bg-danger/5">
            <p className="text-sm text-danger">Error al cargar los datos de rentabilidad.</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="space-y-6">
            {/* Main KPI row */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Gauge */}
              <MarginGauge margin={data.margin} />

              {/* Cards grid */}
              <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-2">
                <KpiCard
                  label="Ingresos"
                  value={fmt(data.revenue)}
                  sub={`${data.transactions} ventas`}
                  icon={DollarSign}
                  color="bg-gold/10 text-gold"
                />
                <KpiCard
                  label="Costo de mercadería"
                  value={fmt(data.cost)}
                  sub={`Ticket prom. ${fmt(data.averageTicket)}`}
                  icon={ShoppingCart}
                  color="bg-danger/10 text-danger"
                />
                <KpiCard
                  label="Ganancia neta"
                  value={fmt(data.profit)}
                  sub={data.profit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                  icon={data.profit >= 0 ? TrendingUp : TrendingDown}
                  color={data.profit >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-danger/10 text-danger'}
                  highlight={data.profit > 0}
                />
                <KpiCard
                  label="Margen bruto"
                  value={`${data.margin}%`}
                  sub={data.margin >= 30 ? 'Excelente' : data.margin >= 15 ? 'Aceptable' : 'Revisar costos'}
                  icon={Percent}
                  color="bg-primary/10 text-primary"
                />
              </div>
            </div>

            {/* Revenue breakdown */}
            {(data.productRevenue > 0 || data.serviceRevenue > 0) && (
              <div className="rounded-xl border border-border bg-bg/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary/50">
                  Desglose de ingresos
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Productos', value: data.productRevenue, color: '#b8922a' },
                    { label: 'Servicios', value: data.serviceRevenue, color: '#2f6b3f' },
                  ].map(({ label, value, color }) => {
                    const pct = data.revenue > 0 ? (value / data.revenue) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-primary/70">{label}</span>
                          <span className="font-semibold" style={{ color }}>
                            {fmt(value)} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
