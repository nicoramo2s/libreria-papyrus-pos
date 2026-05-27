import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/StockBadge';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Edit, Image, Loader2, PackageSearch } from 'lucide-react';
import type { Product } from '@papyrus/shared';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onImageUpload: (productId: string, file: File) => void;
  isLoading?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onImageUpload,
  isLoading = false,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface/60">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-primary/50">Cargando productos…</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface/60">
        <PackageSearch className="h-10 w-10 text-primary/25" />
        <div className="text-center">
          <p className="text-sm font-semibold text-primary/55">
            No hay productos para mostrar
          </p>
          <p className="mt-1 text-xs text-primary/40">
            Agregá productos al catálogo o ajustá los filtros de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-papyrus">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/60">
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Producto
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Categoría
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Precio venta
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Stock
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition hover:bg-gold/[0.03]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-bg/50">
                        <Image className="h-5 w-5 text-primary/25" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-primary">
                        {product.name}
                      </p>
                      {product.isbn && (
                        <p className="mt-0.5 truncate text-xs text-primary/45">
                          ISBN: {product.isbn}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-primary/60">
                    {product.category?.name || (
                      <span className="text-primary/35">Sin categoría</span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-primary">
                    {formatCurrency(product.salePrice)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StockBadge stock={product.stock} stockAlert={product.stockAlert} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product.id)}
                      aria-label="Editar producto"
                      className="hover:text-gold"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/jpeg,image/png,image/webp';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) onImageUpload(product.id, file);
                        };
                        input.click();
                      }}
                      aria-label="Cambiar imagen"
                      className="hover:text-gold"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      aria-label="Eliminar producto"
                      className="hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {product.stock <= product.stockAlert && (
                      <Badge variant="danger" className="ml-1">
                        Stock bajo
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
