import { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Ban,
  CreditCard,
  Edit3,
  Landmark,
  Loader2,
  Percent,
  RotateCcw,
  ShoppingBag,
  Ticket,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import type { SaleDetail } from '@/services/sales';
import { CancelSaleModal } from './CancelSaleModal';
import { ReturnSaleModal } from './ReturnSaleModal';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'gold' }> = {
  COMPLETED: { label: 'Completada', variant: 'success' },
  CANCELLED: { label: 'Anulada', variant: 'danger' },
  RETURNED: { label: 'Devuelta', variant: 'gold' },
};

const paymentIcons: Record<string, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: Landmark,
};

const paymentLabels: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

interface SaleDetailModalProps {
  sale: SaleDetail | undefined;
  isLoading: boolean;
  onClose: () => void;
  onCancel: (reason: string) => void;
  onReturn: (reason: string, items: Array<{ productId: string; quantity: number }>) => void;
  onUpdatePayment: (paymentMethod: string, cashReceived?: number) => void;
  isCancelling: boolean;
  isReturning: boolean;
  isUpdatingPayment: boolean;
}

export function SaleDetailModal({
  sale,
  isLoading,
  onClose,
  onCancel,
  onReturn,
  onUpdatePayment,
  isCancelling,
  isReturning,
  isUpdatingPayment,
}: SaleDetailModalProps) {
  const [showCancel, setShowCancel] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('CASH');
  const [editCashReceived, setEditCashReceived] = useState('');

  if (isLoading || !sale) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse/50 p-4 backdrop-blur-sm">
        <Card className="flex h-64 w-full max-w-2xl items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </Card>
      </div>
    );
  }

  const statusInfo = statusLabel[sale.status] ?? {
    label: sale.status,
    variant: 'neutral' as const,
  };
  const PaymentIcon = paymentIcons[sale.paymentMethod] ?? Banknote;
  const canCancel = sale.status === 'COMPLETED';
  const canReturn = sale.status === 'COMPLETED' || sale.status === 'RETURNED';
  const isCompleted = sale.status === 'COMPLETED';

  // Items that have products (can be returned)
  const returnableItems = sale.items.filter(
    (item) => item.productId && item.itemType === 'PRODUCT',
  );

  const handleStartEditPayment = () => {
    setEditPaymentMethod(sale.paymentMethod);
    setEditCashReceived(sale.cashReceived ? String(sale.cashReceived) : '');
    setEditingPayment(true);
  };

  const handleSavePayment = () => {
    const cashValue = editCashReceived ? Number(editCashReceived) : undefined;
    onUpdatePayment(editPaymentMethod, cashValue);
    setEditingPayment(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-inverse/50 p-3 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="my-6 w-full max-w-3xl overflow-hidden rounded-xl border border-gold/20 bg-surface/90 shadow-papyrus">
          {/* Header */}
          <div className="relative border-b border-border bg-inverse px-5 py-4 text-white sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 h-8 w-8 px-0 text-white dark:hover:bg-white/5 hover:bg-white/10"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusInfo.variant} className="text-[10px] px-1.5 py-0.5">{statusInfo.label}</Badge>
              {sale.status === 'COMPLETED' ? (
                <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">Venta activa</Badge>
              ) : null}
              {sale.cancelledAt ? (
                <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">
                  Anulada{' '}
                  {new Date(sale.cancelledAt).toLocaleDateString('es-AR')}
                </Badge>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">
                  Ticket
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {sale.ticketNumber}
                </h2>
              </div>
              <p className="text-xl font-black text-white">
                {currency.format(sale.total)}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 p-5 sm:p-6">
            {/* Info row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-bg/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/45">
                  <UserRound className="h-3.5 w-3.5 text-gold" />
                  Cajero
                </div>
                <p className="mt-1.5 text-sm font-bold text-primary">
                  {sale.user.displayName}
                </p>
                <p className="mt-0.5 text-[11px] text-primary/50">
                  {new Date(sale.createdAt).toLocaleString('es-AR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-bg/60 p-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/45">
                    <PaymentIcon className="h-3.5 w-3.5 text-gold" />
                    Método
                  </div>
                  {isCompleted && !editingPayment ? (
                    <button
                      type="button"
                      onClick={handleStartEditPayment}
                      className="focus-ring flex h-5 w-5 items-center justify-center rounded text-primary/30 transition hover:bg-gold/10 hover:text-gold"
                      title="Cambiar método de pago"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
                {editingPayment ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {(['CASH', 'CARD', 'TRANSFER'] as const).map((method) => {
                        const Icon = paymentIcons[method];
                        const isActive = editPaymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setEditPaymentMethod(method)}
                            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                              isActive
                                ? 'border-gold bg-gold/15 text-gold'
                                : 'border-border/60 text-primary/50 hover:border-gold/50 hover:text-primary'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {paymentLabels[method]}
                          </button>
                        );
                      })}
                    </div>
                    {editPaymentMethod === 'CASH' ? (
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Efectivo recibido"
                          value={editCashReceived}
                          onChange={(e) => setEditCashReceived(e.target.value)}
                          className="focus-ring h-7 w-full rounded-lg border border-border bg-surface px-2 text-xs text-primary outline-none transition hover:border-gold/60"
                        />
                        {Number(editCashReceived || 0) >= sale.total ? (
                          <p className="mt-1 text-[10px] text-success">
                            Vuelto: {currency.format(Number(editCashReceived || 0) - sale.total)}
                          </p>
                        ) : Number(editCashReceived || 0) > 0 ? (
                          <p className="mt-1 text-[10px] text-danger">
                            Faltan {currency.format(sale.total - Number(editCashReceived || 0))}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingPayment(false)}
                        className="focus-ring flex-1 rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-primary/60 transition hover:bg-gold/10 hover:text-primary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePayment}
                        disabled={isUpdatingPayment}
                        className="focus-ring flex-1 rounded-lg bg-gold px-2 py-1 text-[10px] font-bold text-white shadow-sm transition hover:bg-gold/90 disabled:opacity-60"
                      >
                        {isUpdatingPayment ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1.5 text-sm font-bold text-primary">
                      {paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}
                    </p>
                    {sale.cashReceived ? (
                      <p className="mt-0.5 text-[11px] text-primary/50">
                        Rec.: {currency.format(sale.cashReceived)} · Vuelto:{' '}
                        {currency.format(sale.changeGiven ?? 0)}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="rounded-xl border border-border bg-bg/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/45">
                  <Ticket className="h-3.5 w-3.5 text-gold" />
                  Resumen
                </div>
                <p className="mt-1.5 text-sm font-bold text-primary">
                  {sale.items.length} ítems
                </p>
                <p className="mt-0.5 text-[11px] text-primary/50">
                  Subtotal: {currency.format(sale.subtotal)}
                  {sale.discountAmount > 0
                    ? ` · Desc: -${currency.format(sale.discountAmount)}`
                    : null}
                </p>
              </div>
            </div>

            {/* Cancel reason */}
            {sale.cancelReason ? (
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-danger">
                  Motivo de anulación
                </p>
                <p className="mt-1.5 text-xs leading-5 text-primary">
                  {sale.cancelReason}
                </p>
              </div>
            ) : null}

            {/* Items */}
            <div>
              <h3 className="mb-3 text-base font-bold text-primary">
                <ShoppingBag className="mr-1.5 inline h-4 w-4 text-gold" />
                Ítems de la venta
              </h3>
              <div className="space-y-2">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border dark:bg-surface/80 bg-white/80 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            item.itemType === 'PRODUCT' ? 'neutral' : 'gold'
                          }
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {item.itemType === 'PRODUCT' ? 'Producto' : 'Servicio'}
                        </Badge>
                        {item.specifications ? (
                          <Badge variant="gold" className="text-[10px] px-1.5 py-0.5">C/ espec.</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-primary">
                        {item.productName}
                      </p>
                      <p className="text-xs text-primary/55">
                        {currency.format(item.productPrice)} x {item.quantity}
                      </p>
                    </div>
                    <p className="ml-3 whitespace-nowrap text-base font-black text-primary">
                      {currency.format(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-border bg-bg/60 p-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary/55">
                    Subtotal
                  </span>
                  <span className="font-bold text-primary">
                    {currency.format(sale.subtotal)}
                  </span>
                </div>
                {sale.discountAmount > 0 ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-primary/55">
                      <Percent className="h-3 w-3 text-danger" />
                      Descuento
                    </span>
                    <span className="font-bold text-danger">
                      -{currency.format(sale.discountAmount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-border pt-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary/50">
                    Total
                  </span>
                  <span className="text-xl font-black text-primary">
                    {currency.format(sale.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Returns history */}
            {sale.returns && sale.returns.length > 0 ? (
              <div>
                <h3 className="mb-3 text-base font-bold text-primary">
                  <RotateCcw className="mr-1.5 inline h-4 w-4 text-gold" />
                  Devoluciones registradas
                </h3>
                <div className="space-y-2">
                  {sale.returns.map((ret) => (
                    <div
                      key={ret.id}
                      className="rounded-lg border border-gold/20 bg-gold/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                          Dev. del{' '}
                          {new Date(ret.createdAt).toLocaleDateString('es-AR')}
                        </p>
                        <span className="text-xs font-bold text-danger">
                          -{currency.format(ret.totalRefunded)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-primary/65">
                        {ret.reason}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {ret.returnItems.map((ri) => (
                          <Badge key={ri.id} variant="neutral" className="text-[10px] px-1.5 py-0.5">
                            {ri.quantity}u · {currency.format(ri.refundAmount)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cerrar
              </Button>

              {canCancel ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowCancel(true)}
                  disabled={isCancelling}
                >
                  <Ban className="h-3.5 w-3.5" />
                  Anular
                </Button>
              ) : null}

              {canReturn && returnableItems.length > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReturn(true)}
                  disabled={isReturning}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Devolución
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showCancel ? (
        <CancelSaleModal
          ticketNumber={sale.ticketNumber}
          isPending={isCancelling}
          onConfirm={(reason) => {
            onCancel(reason);
            setShowCancel(false);
          }}
          onCancel={() => setShowCancel(false)}
        />
      ) : null}

      {showReturn ? (
        <ReturnSaleModal
          ticketNumber={sale.ticketNumber}
          items={returnableItems}
          isPending={isReturning}
          onConfirm={(reason, items) => {
            onReturn(reason, items);
            setShowReturn(false);
          }}
          onCancel={() => setShowReturn(false)}
        />
      ) : null}
    </>
  );
}
