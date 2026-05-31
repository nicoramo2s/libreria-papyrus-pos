import { Trash2, ReceiptText } from 'lucide-react';
import { PaymentMethod } from '@papyrus/shared';
import type { CartItem as CartItemModel } from '../../store/cartStore';
import { CartItem } from './CartItem';
import { PaymentSelector } from './PaymentSelector';
import { Button } from '../ui/Button';


interface CartProps {
  items: CartItemModel[];
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: string;
  isCheckoutDisabled: boolean;
  isCheckingOut: boolean;
  onDiscountChange: (amount: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCashReceivedChange: (value: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function Cart({
  items,
  subtotal,
  discountAmount,
  total,
  paymentMethod,
  cashReceived,
  isCheckoutDisabled,
  isCheckingOut,
  onDiscountChange,
  onPaymentMethodChange,
  onCashReceivedChange,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onCheckout,
}: CartProps) {
  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-papyrus">
      {/* Ticket header */}
      <div className="border-b border-border/60 bg-primary px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-gold" aria-hidden="true" />
            <p className="text-sm font-bold text-white">
              {items.length === 0 ? 'Sin ítems' : `${items.length} ítem${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={items.length === 0}
            onClick={onClear}
            aria-label="Limpiar ticket"
            className="h-7 border-white/15 bg-white/10 px-2 text-[10px] text-white hover:bg-white/20"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {/* Items list - receipt style */}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-bg/60 px-3 py-6 text-center">
            <ReceiptText className="mx-auto mb-1.5 h-6 w-6 text-primary/20" />
            <p className="text-xs font-semibold text-primary/45">Ticket vacío</p>
            <p className="mt-0.5 text-[11px] text-primary/35">Agregá productos o servicios desde el catálogo.</p>
          </div>
        ) : (
          <div className="max-h-[24rem] space-y-0.5 overflow-y-auto pr-0.5">
            {/* Receipt column headers */}
            <div className="flex items-center gap-2 border-b border-border/30 px-1 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-primary/30">
              <span className="w-[4.5rem] shrink-0 text-center">Cant</span>
              <span className="flex-1">Producto</span>
              <span className="w-[4.5rem] shrink-0 text-right">Importe</span>
              <span className="w-5 shrink-0" />
            </div>
            {items.map((item) => (
              <CartItem key={item.id} item={item} onIncrement={onIncrement} onDecrement={onDecrement} onRemove={onRemove} />
            ))}
          </div>
        )}

        {/* Totals - receipt style */}
        <div className="space-y-1.5 border-t border-border/50 pt-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-primary/45">Subtotal</span>
            <span className="text-xs font-bold tabular-nums text-primary">{currency.format(subtotal)}</span>
          </div>

          {/* Discount input inline */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-bg/60 px-2.5 py-1.5">
            <label className="text-[11px] font-semibold text-primary/45">Dto.</label>
            <div className="relative w-24">
              <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-primary/30">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount || ''}
                onChange={(e) => onDiscountChange(Number(e.target.value || 0))}
                className="h-7 w-full rounded-lg border border-border bg-white/80 px-1.5 pl-4 text-right text-xs font-bold tabular-nums text-primary outline-none transition hover:border-gold/60 focus-visible:ring-2 focus-visible:ring-gold/30"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t-2 border-double border-primary/15 px-1 pt-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-primary">Total</span>
            <span className="text-xl font-black tabular-nums text-primary">{currency.format(total)}</span>
          </div>
        </div>

        {/* Payment */}
        <PaymentSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
          cashReceived={cashReceived}
          onCashReceivedChange={onCashReceivedChange}
          total={total}
        />

        {/* Checkout button */}
        <Button
          className="w-full"
          size="md"
          disabled={isCheckoutDisabled}
          isLoading={isCheckingOut}
          onClick={onCheckout}
        >
          {isCheckingOut ? 'Emitiendo…' : 'Cobrar y emitir ticket'}
        </Button>
      </div>
    </div>
  );
}
