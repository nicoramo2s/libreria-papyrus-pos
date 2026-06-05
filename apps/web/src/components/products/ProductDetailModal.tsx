import { X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockBadge } from '@/components/ui/StockBadge';
import type { Product } from '@papyrus/shared';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function ProductDetailModal({ product, onClose, onEdit }: ProductDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10 pb-10 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 fade-in rounded-xl border border-border/80 bg-surface shadow-papyrus-lg duration-200 overflow-hidden">
        {/* Header with image */}
        <div className="relative h-48 bg-gradient-to-br from-gold/10 to-primary/5">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-primary/15" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product info */}
        <div className="p-6 space-y-6">
          {/* Title & badges */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">{product.name}</h2>
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge variant="gold">{product.category.name}</Badge>
                )}
                <StockBadge stock={product.stock} stockAlert={product.stockAlert} />
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">ISBN</p>
              <p className="text-sm text-primary">{product.isbn || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Categoría</p>
              <p className="text-sm text-primary">{product.category?.name || 'Sin categoría'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Precio de venta</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(product.salePrice)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Precio de compra</p>
              <p className="text-sm text-primary">{product.purchasePrice ? formatCurrency(product.purchasePrice) : '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Stock actual</p>
              <p className="text-lg font-bold text-primary">{product.stock} unidades</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Alerta de stock</p>
              <p className="text-sm text-primary">{product.stockAlert} unidades</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Creado</p>
              <p className="text-sm text-primary">
                {formatDate(product.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Actualizado</p>
              <p className="text-sm text-primary">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary/40">Descripción</p>
              <p className="text-sm leading-relaxed text-primary/75">{product.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button variant="secondary" size="sm" onClick={onClose}>Cerrar</Button>
            <Button size="sm" onClick={() => { onEdit(product.id); onClose(); }}>Editar producto</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
