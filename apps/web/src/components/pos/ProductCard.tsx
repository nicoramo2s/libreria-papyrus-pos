import { BookOpen, Plus } from 'lucide-react';
import type { Product } from '@papyrus/shared';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.stockAlert;

  return (
    <Card className={cn('group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-papyrus', isOutOfStock && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/15 via-bg to-white text-gold shadow-inner">
            <BookOpen className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-base font-extrabold leading-5 text-primary">{product.name}</h3>
                <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.16em] text-primary/42">
                  {product.category?.name ?? 'Sin categoría'}
                </p>
              </div>
              <Badge variant={isOutOfStock ? 'danger' : isLowStock ? 'gold' : 'success'}>
                {isOutOfStock ? 'Sin stock' : `${product.stock} u.`}
              </Badge>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-primary/45">Precio mostrador</p>
                <p className="text-xl font-black text-primary">{currency.format(product.salePrice)}</p>
              </div>
              <Button size="sm" disabled={isOutOfStock} onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
