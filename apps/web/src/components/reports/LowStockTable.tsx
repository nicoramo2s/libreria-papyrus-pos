import { PackageSearch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StockBadge } from '@/components/ui/StockBadge';
import { useLowStock } from '@/hooks/useReports';

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value));

export default function LowStockTable() {
  const { data, isLoading, isError } = useLowStock();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-danger" />
          Stock crítico
        </CardTitle>
        <CardDescription>
          Productos por debajo del nivel mínimo de inventario.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex h-48 items-center justify-center px-5 pb-5">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-primary/50">Cargando datos…</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="mx-5 mb-5 flex items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 p-6">
            <p className="text-sm text-danger">Error al cargar el stock bajo.</p>
          </div>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="flex h-48 items-center justify-center px-5 pb-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <PackageSearch className="h-8 w-8 text-success/50" />
              <p className="text-sm font-medium text-primary/60">
                No hay productos con stock crítico
              </p>
              <p className="text-xs text-primary/40">
                Todos los productos están dentro de sus niveles mínimos.
              </p>
            </div>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary/50">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary/50">
                    Categoría
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-primary/50">
                    Precio
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-primary/50">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-danger/[0.03]"
                  >
                    <td className="px-5 py-3.5 font-medium text-primary">
                      {product.name}
                    </td>
                    <td className="px-5 py-3.5 text-primary/60">
                      {product.category?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-primary">
                      {formatCurrency(product.salePrice)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <StockBadge
                        stock={product.stock}
                        stockAlert={product.stockAlert}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="border-t border-border px-5 py-3">
            <p className="text-xs text-primary/40">
              Mostrando {data.length} producto{data.length !== 1 ? 's' : ''} con
              stock por debajo del mínimo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
