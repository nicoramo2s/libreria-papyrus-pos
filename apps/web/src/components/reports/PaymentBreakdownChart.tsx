import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSalesByPayment } from '@/hooks/useReports';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  CASH: { label: 'Efectivo', color: '#b8922a' },
  CARD: { label: 'Tarjeta', color: '#2f6b3f' },
  TRANSFER: { label: 'Transferencia', color: '#4f7eb3' },
};

const DEFAULT_COLORS = ['#b8922a', '#2f6b3f', '#4f7eb3', '#c47b5a', '#8b6f8a'];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-border bg-surface/95 p-4 shadow-papyrus-sm backdrop-blur">
      <p className="text-sm font-semibold text-primary">
        {PAYMENT_LABELS[entry.name]?.label ?? entry.name}
      </p>
      <p className="mt-1 text-sm text-primary/70">
        {formatCurrency(entry.payload.total)} ({entry.payload.percentage}%)
      </p>
      <p className="text-sm text-primary/50">
        {entry.payload.count} transacciones
      </p>
    </div>
  );
}

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function PaymentBreakdownChart() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedFrom, setAppliedFrom] = useState(fromDate);
  const [appliedTo, setAppliedTo] = useState(toDate);

  const { data, isLoading, isError } = useSalesByPayment({
    from: appliedFrom,
    to: appliedTo,
  });

  const applyDateFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const chartData = (data ?? []).map((entry) => ({
    ...entry,
    name: entry.paymentMethod,
    displayLabel: PAYMENT_LABELS[entry.paymentMethod]?.label ?? entry.paymentMethod,
    fill: PAYMENT_LABELS[entry.paymentMethod]?.color ?? DEFAULT_COLORS[0],
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gold" />
          Desglose por método de pago
        </CardTitle>
        <CardDescription>
          Distribución de ingresos según el medio de cobro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Date range filter */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/50">
              Desde
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="focus-ring rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary/50">
              Hasta
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="focus-ring rounded-lg border border-border bg-bg px-3 py-2 text-sm text-primary"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={applyDateFilter}>
            Aplicar
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-primary/50">Cargando datos…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-danger/20 bg-danger/5">
            <p className="text-sm text-danger">Error al cargar los datos de pago.</p>
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-bg/60">
            <p className="text-sm text-primary/50">No hay ventas en este período.</p>
          </div>
        )}

        {chartData.length > 0 && (
          <>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="name"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => {
                      const entry = chartData.find((d) => d.name === value);
                      return entry?.displayLabel ?? value;
                    }}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary cards */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {chartData.map((entry) => (
                <div
                  key={entry.name}
                  className="rounded-xl border border-border bg-bg/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm font-semibold text-primary">
                      {entry.displayLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-lg font-extrabold text-primary">
                    {formatCurrency(entry.total)}
                  </p>
                  <p className="text-xs text-primary/50">
                    {entry.count} transacciones · {entry.percentage}%
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
