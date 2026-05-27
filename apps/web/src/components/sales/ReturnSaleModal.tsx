import { useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

interface ReturnableItem {
  id: string;
  productId?: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  itemType: string;
}

interface ReturnSaleModalProps {
  ticketNumber: string;
  items: ReturnableItem[];
  isPending: boolean;
  onConfirm: (
    reason: string,
    returnItems: Array<{ productId: string; quantity: number }>,
  ) => void;
  onCancel: () => void;
}

export function ReturnSaleModal({
  ticketNumber,
  items,
  isPending,
  onConfirm,
  onCancel,
}: ReturnSaleModalProps) {
  const [reason, setReason] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const item of items) {
      if (item.productId) {
        initial[item.productId] = 1;
      }
    }
    return initial;
  });
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const item of items) {
        if (item.productId) {
          initial[item.productId] = true;
        }
      }
      return initial;
    },
  );
  const [reasonError, setReasonError] = useState<string | null>(null);

  const toggleItem = (productId: string) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] ?? 1;
      const next = current + delta;
      const item = items.find((i) => i.productId === productId);
      const maxQty = item?.quantity ?? 1;
      if (next < 1 || next > maxQty) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const handleSubmit = () => {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setReasonError('El motivo debe tener al menos 3 caracteres');
      return;
    }

    const returnItems = Object.entries(selectedItems)
      .filter(([, selected]) => selected)
      .map(([productId]) => ({
        productId,
        quantity: quantities[productId] ?? 1,
      }));

    if (returnItems.length === 0) {
      setReasonError('Seleccioná al menos un producto para devolver');
      return;
    }

    setReasonError(null);
    onConfirm(trimmedReason, returnItems);
  };

  const totalRefund = items.reduce((sum, item) => {
    if (item.productId && selectedItems[item.productId]) {
      const qty = quantities[item.productId] ?? 1;
      return sum + item.productPrice * qty;
    }
    return sum;
  }, 0);

  const hasSelection = Object.values(selectedItems).some(Boolean);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-lg overflow-hidden border-gold/30 shadow-papyrus">
        <div className="relative bg-primary p-6 text-white">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 h-9 w-9 px-0 text-white hover:bg-white/10"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          <RotateCcw className="h-10 w-10 text-gold" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-gold-light">
            Devolución
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Devolver {ticketNumber}
          </h2>
        </div>
        <CardContent className="space-y-5 p-6">
          <p className="text-sm leading-6 text-primary/65">
            Seleccioná los productos a devolver y las cantidades. El stock se
            restaurará automáticamente.
          </p>

          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => {
              if (!item.productId) return null;
              const isSelected = selectedItems[item.productId] ?? false;
              const qty = quantities[item.productId] ?? 1;
              const maxQty = item.quantity;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-2xl border p-4 transition',
                    isSelected
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-border bg-white opacity-60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.productId!)}
                      className="focus-ring mt-1 h-5 w-5 rounded-lg border-2 border-border text-gold accent-gold"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-primary">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 text-sm text-primary/55">
                        {currency.format(item.productPrice)} c/u ·{' '}
                        {item.quantity} disponibles
                      </p>

                      {isSelected ? (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex items-center rounded-xl border border-border bg-bg p-1">
                            <button
                              type="button"
                              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-primary transition hover:bg-white"
                              onClick={() =>
                                updateQuantity(item.productId!, -1)
                              }
                              disabled={qty <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2.5rem] text-center text-sm font-black text-primary">
                              {qty}
                            </span>
                            <button
                              type="button"
                              className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-primary transition hover:bg-white"
                              onClick={() =>
                                updateQuantity(item.productId!, 1)
                              }
                              disabled={qty >= maxQty}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {currency.format(item.productPrice * qty)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reason */}
          <Textarea
            label="Motivo de la devolución *"
            placeholder="Ej: Cliente devolvió producto defectuoso..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(null);
            }}
            error={reasonError ?? undefined}
            rows={3}
          />

          {/* Total */}
          {hasSelection ? (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-bg/70 p-4">
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-primary/50">
                Total a reembolsar
              </span>
              <span className="text-2xl font-black text-danger">
                -{currency.format(totalRefund)}
              </span>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isPending}
              disabled={isPending || !hasSelection}
            >
              {isPending ? 'Procesando...' : 'Registrar devolución'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
