import { CheckCircle2, Printer, ReceiptText, X } from 'lucide-react';
import type { Sale } from '@papyrus/shared';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { printTicket } from '../../lib/printTicket';

interface SaleSuccessModalProps {
  sale: Sale | null;
  onClose: () => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function SaleSuccessModal({ sale, onClose }: SaleSuccessModalProps) {
  if (!sale) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Card className="w-full max-w-md overflow-hidden border-gold/30 shadow-papyrus">
        <div className="relative bg-primary p-6 text-center text-white">
          <Button variant="ghost" size="sm" className="absolute right-3 top-3 h-9 w-9 px-0 text-white hover:bg-white/10" onClick={onClose} aria-label="Cerrar comprobante">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
          <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-gold-light">Venta registrada</p>
          <h2 className="mt-2 text-4xl font-bold text-white">Ticket {sale.ticketNumber}</h2>
        </div>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-2xl bg-bg p-5 text-center">
            <ReceiptText className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-primary/55">Total cobrado</p>
            <p className="text-4xl font-black text-primary">{currency.format(sale.total)}</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
            <span className="font-semibold text-primary/58">Vuelto</span>
            <span className="text-xl font-black text-success">{currency.format(sale.changeGiven ?? 0)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" size="lg" onClick={() => printTicket({ sale })}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button className="flex-1" size="lg" onClick={onClose}>Nueva venta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
