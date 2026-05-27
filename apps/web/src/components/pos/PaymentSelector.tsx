import { Banknote, CreditCard, Landmark } from 'lucide-react';
import { PaymentMethod } from '@papyrus/shared';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface PaymentSelectorProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashReceived: string;
  onCashReceivedChange: (value: string) => void;
  total: number;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const paymentOptions = [
  { method: PaymentMethod.CASH, label: 'Efectivo', icon: Banknote },
  { method: PaymentMethod.CARD, label: 'Tarjeta', icon: CreditCard },
  { method: PaymentMethod.TRANSFER, label: 'Transferencia', icon: Landmark },
];

export function PaymentSelector({ paymentMethod, onPaymentMethodChange, cashReceived, onCashReceivedChange, total }: PaymentSelectorProps) {
  const numericCash = Number(cashReceived || 0);
  const change = numericCash - total;
  const isCashShort = paymentMethod === PaymentMethod.CASH && numericCash > 0 && change < 0;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-1.5">
        {paymentOptions.map((option) => (
          <button
            key={option.method}
            type="button"
            className={cn(
              'focus-ring rounded-xl border py-2 text-center text-[10px] font-black uppercase tracking-[0.15em] transition',
              paymentMethod === option.method
                ? 'border-gold bg-gold/15 text-primary shadow-papyrus-sm'
                : 'border-border bg-white/68 text-primary/55 hover:border-gold/50',
            )}
            onClick={() => onPaymentMethodChange(option.method)}
          >
            <option.icon className="mx-auto mb-1 h-4 w-4 text-gold" aria-hidden="true" />
            {option.label}
          </button>
        ))}
      </div>

      {paymentMethod === PaymentMethod.CASH ? (
        <div className="rounded-xl border border-border bg-bg/70 p-3">
          <Input
            label="Efectivo recibido"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={cashReceived}
            onChange={(event) => onCashReceivedChange(event.target.value)}
            error={isCashShort ? 'El efectivo no alcanza para cerrar la venta.' : undefined}
          />
          <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs">
            <span className="font-semibold text-primary/58">Vuelto</span>
            <span className={cn('font-black', change < 0 ? 'text-danger' : 'text-success')}>{currency.format(Math.max(0, change))}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
