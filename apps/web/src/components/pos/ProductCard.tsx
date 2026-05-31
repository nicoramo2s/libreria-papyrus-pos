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
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gradient-to-br from-gold/15 via-bg to-white text-gold shadow-inner sm:h-24 sm:w-20 sm:rounded-2xl">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-primary sm:text-base">{product.name}</h3>
                <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/42 sm:text-xs">
                  {product.category?.name ?? 'Sin categoría'}
                </p>
              </div>
              <Badge variant={isOutOfStock ? 'danger' : isLowStock ? 'gold' : 'success'}>
                {isOutOfStock ? 'Sin stock' : `${product.stock} u.`}
              </Badge>
            </div>

            <div className="mt-2 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3">
              <div>
                <p className="text-[10px] text-primary/45 sm:text-xs">Precio mostrador</p>
                <p className="text-base font-black text-primary sm:text-xl">{currency.format(product.salePrice)}</p>
              </div>
              <Button size="sm" disabled={isOutOfStock} onClick={() => onAdd(product)} aria-label={`Agregar ${product.name}`} className="h-7 text-[10px] sm:h-auto sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
