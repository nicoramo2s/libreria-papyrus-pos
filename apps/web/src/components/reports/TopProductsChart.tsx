import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTopProducts } from '@/hooks/useReports';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface/95 p-4 shadow-papyrus-sm backdrop-blur">
      <p className="text-sm font-semibold text-primary">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="mt-1 text-sm" style={{ color: entry.color }}>
          {entry.name === 'totalSold' ? 'Unidades vendidas' : 'Ingresos'}: {entry.name === 'totalSold' ? entry.value : formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function TopProductsChart() {
  const { data, isLoading, isError } = useTopProducts();

  // Recharts needs the chart to render top-to-bottom, so we reverse
  const chartData = data ? [...data].reverse() : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          Top 10 productos
        </CardTitle>
        <CardDescription>
          Los títulos más vendidos del historial completo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-primary/50">Cargando datos…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex h-80 items-center justify-center rounded-2xl border border-danger/20 bg-danger/5">
            <p className="text-sm text-danger">Error al cargar los productos.</p>
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="flex h-80 items-center justify-center rounded-2xl bg-bg/60">
            <p className="text-sm text-primary/50">No hay datos de productos vendidos.</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border, #e6dccb)"
                  strokeOpacity={0.5}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6b6258' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e6dccb' }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 12, fill: '#1a1a1a', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  width={180}
                  tickFormatter={(value: string) =>
                    value.length > 30 ? value.slice(0, 28) + '…' : value
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalRevenue"
                  name="Ingresos"
                  fill="#b8922a"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="totalSold"
                  name="Unidades"
                  fill="#2f6b3f"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
