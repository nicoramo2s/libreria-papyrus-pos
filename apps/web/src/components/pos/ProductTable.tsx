import { useState } from 'react';
import { Plus, Search, PackageSearch, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '@papyrus/shared';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onAdd: (product: Product) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

type SortField = 'name' | 'salePrice' | 'stock' | 'category';
type SortDir = 'asc' | 'desc';

export function ProductTable({ products, isLoading, onAdd, search, onSearchChange }: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...products].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name': return a.name.localeCompare(b.name) * dir;
      case 'salePrice': return (a.salePrice - b.salePrice) * dir;
      case 'stock': return (a.stock - b.stock) * dir;
      case 'category': return ((a.category?.name ?? '') > (b.category?.name ?? '') ? 1 : -1) * dir;
      default: return 0;
    }
  });

  const SortIcon = sortDir === 'asc' ? ChevronUp : ChevronDown;

  const SortHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className={cn(
        'group inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] transition',
        sortField === field ? 'text-gold' : 'text-primary/50 hover:text-primary/70',
        className,
      )}
    >
      {children}
      <SortIcon className={cn('h-3 w-3 transition', sortField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-40')} />
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-papyrus">
      {/* Search bar — always rendered so it never loses focus */}
      <div className="border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/60" />
          <Input
            placeholder="Filtrar por nombre o ISBN…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 border border-primary/20 bg-bg/90 pl-8 text-xs text-primary placeholder:text-primary/60 focus-visible:ring-1 focus-visible:ring-gold/60"
          />
        </div>
      </div>

      {isLoading ? (
        /* Skeleton loader — keeps search bar mounted above */
        <div className="space-y-0 divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-3 py-2.5">
              <div className="h-5 w-6 rounded bg-inverse/10" />
              <div className="h-3.5 flex-1 rounded bg-inverse/10" />
              <div className="h-3.5 w-20 rounded bg-inverse/10" />
              <div className="h-3.5 w-16 rounded bg-inverse/10" />
              <div className="h-5 w-10 rounded-md bg-inverse/10" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <PackageSearch className="h-8 w-8 text-primary/20" />
          <div>
            <p className="text-xs font-semibold text-primary/55">No se encontraron productos</p>
            <p className="mt-0.5 text-[11px] text-primary/40">Probá con otra búsqueda o seleccioná una categoría diferente.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-bg/40">
                <th className="w-8 px-2 py-2 text-center md:w-10 md:px-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/35">+</span>
                </th>
                <th className="px-2 py-2 text-left md:px-3">
                  <SortHeader field="name">Producto</SortHeader>
                </th>
                <th className="hidden px-3 py-2 text-left xl:table-cell">
                  <SortHeader field="category">Categoría</SortHeader>
                </th>
                <th className="px-2 py-2 text-right md:px-3">
                  <SortHeader field="salePrice">Precio</SortHeader>
                </th>
                <th className="px-2 py-2 text-center md:px-3">
                  <SortHeader field="stock">Stock</SortHeader>
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sorted.map((product, idx) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = !isOutOfStock && product.stock <= product.stockAlert;

                return (
                  <tr
                    key={product.id}
                    onClick={isOutOfStock ? undefined : () => onAdd(product)}
                    className={cn(
                      'cursor-pointer transition hover:bg-gold/[0.04]',
                      isOutOfStock && 'cursor-default opacity-50',
                    )}
                  >
                    <td className="px-2 py-2.5 text-center md:px-3">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gold/15 text-gold transition hover:bg-gold/25 disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-2 py-2.5 md:px-3">
                      <div className="min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-[240px]">
                        <p className="truncate text-sm font-semibold text-primary">{product.name}</p>
                        <div className="flex flex-wrap gap-x-2">
                          {product.isbn && (
                            <span className="font-mono text-[10px] text-primary/40">ISBN {product.isbn}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 xl:table-cell">
                      <span className="text-xs text-primary/55">
                        {product.category?.name ?? <span className="text-primary/30">—</span>}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right md:px-3">
                      <span className="text-sm font-bold tabular-nums text-primary">{currency.format(product.salePrice)}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center md:px-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                          isOutOfStock ? 'bg-danger/10 text-danger' : isLowStock ? 'bg-gold/10 text-gold' : 'bg-success/10 text-success',
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with count — hidden while loading */}
      {!isLoading && (
        <div className="border-t border-border/30 px-3 py-1.5">
          <p className="text-[11px] text-primary/40">
            <span className="font-semibold text-primary/60">{sorted.length}</span> producto{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
