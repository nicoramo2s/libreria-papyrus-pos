import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSalesByPeriod } from '@/hooks/useReports';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

type ChartMode = 'line' | 'bar';
type GroupBy = 'day' | 'week' | 'month';

const groupByLabels: Record<GroupBy, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
};

function formatDateLabel(dateStr: string, groupBy: GroupBy) {
  if (groupBy === 'month') {
    const [year, month] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }
  if (groupBy === 'week') {
    return `Sem ${dateStr.split('-W')[1] || dateStr}`;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface/95 p-4 shadow-papyrus-sm backdrop-blur">
      <p className="text-sm font-semibold text-primary">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="mt-1 text-sm" style={{ color: entry.color }}>
          {entry.name === 'total' ? 'Ingresos' : 'Transacciones'}: {entry.name === 'total' ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function SalesByPeriodChart() {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appliedFrom, setAppliedFrom] = useState(fromDate);
  const [appliedTo, setAppliedTo] = useState(toDate);

  const { data, isLoading, isError } = useSalesByPeriod({
    from: appliedFrom,
    to: appliedTo,
    groupBy,
  });

  const applyDateFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const chartData = data?.map(d => ({ ...d, label: formatDateLabel(d.date, groupBy) }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Ventas por período
          </CardTitle>
          <CardDescription>
            Evolución de ingresos y transacciones en el tiempo.
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Chart mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => setChartMode('line')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                chartMode === 'line'
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-primary/60 hover:bg-primary/5'
              }`}
            >
              Línea
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                chartMode === 'bar'
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-primary/60 hover:bg-primary/5'
              }`}
            >
              Barras
            </button>
          </div>
          {/* GroupBy toggle */}
          <div className="flex overflow-hidden rounded-lg border border-border">
            {(Object.entries(groupByLabels) as [GroupBy, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setGroupBy(key)}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  groupBy === key
                    ? 'bg-gold text-white'
                    : 'bg-transparent text-primary/60 hover:bg-gold/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Date range filter */}
        <div className="mb-6 flex flex-wrap items-end gap-3">
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
          <div className="flex h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-primary/50">Cargando datos…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-danger/20 bg-danger/5">
            <p className="text-sm text-danger">Error al cargar los datos de ventas.</p>
          </div>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <div className="flex h-72 items-center justify-center rounded-2xl bg-bg/60">
            <p className="text-sm text-primary/50">No hay ventas en este período.</p>
          </div>
        )}

        {chartData && chartData.length > 0 && (
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e6dccb)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e6dccb' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (value === 'total' ? 'Ingresos' : 'Transacciones')}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Line
                    yAxisId="left"
                    dataKey="total"
                    name="total"
                    type="monotone"
                    stroke="#b8922a"
                    fill="#b8922a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#b8922a', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#b8922a', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Line
                    yAxisId="right"
                    dataKey="count"
                    name="count"
                    type="monotone"
                    stroke="#2f6b3f"
                    fill="#2f6b3f"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2f6b3f', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#2f6b3f', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e6dccb)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e6dccb' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#6b6258' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (value === 'total' ? 'Ingresos' : 'Transacciones')}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="total"
                    name="total"
                    fill="#b8922a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="count"
                    name="count"
                    fill="#2f6b3f"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
