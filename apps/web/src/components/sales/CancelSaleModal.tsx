import { useState } from 'react';
import { Ban, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

interface CancelSaleModalProps {
  ticketNumber: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function CancelSaleModal({
  ticketNumber,
  isPending,
  onConfirm,
  onCancel,
}: CancelSaleModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError('El motivo debe tener al menos 3 caracteres');
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md overflow-hidden border-danger/30 shadow-papyrus">
        <div className="relative bg-danger p-6 text-center text-white">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 h-9 w-9 px-0 text-white hover:bg-white/10"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          <Ban className="mx-auto h-12 w-12 text-white" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            Anulación
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Anular {ticketNumber}
          </h2>
        </div>
        <CardContent className="space-y-5 p-6">
          <p className="text-sm leading-6 text-primary/65">
            Al anular esta venta se restaurará el stock de todos los productos
            incluidos. Esta acción no se puede deshacer.
          </p>

          <Textarea
            label="Motivo de la anulación *"
            placeholder="Ej: Venta incorrecta, error del operador..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            error={error ?? undefined}
            rows={3}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              isLoading={isPending}
              disabled={isPending}
            >
              {isPending ? 'Anulando...' : 'Sí, anular venta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
