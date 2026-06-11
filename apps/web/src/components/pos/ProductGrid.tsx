import { PackageSearch } from 'lucide-react';
import type { Product } from '@papyrus/shared';
import { ProductCard } from './ProductCard';
import { Card, CardContent } from '../ui/Card';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAdd: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, onAdd }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-36 animate-pulse dark:bg-surface/80 bg-white/70" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <PackageSearch className="h-10 w-10 text-gold" aria-hidden="true" />
          <h3 className="mt-4 text-2xl font-bold text-primary">No encontramos títulos</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-primary/58">Probá con otra búsqueda o categoría para seguir armando el ticket.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
