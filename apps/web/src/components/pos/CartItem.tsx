import { Minus, Plus, X } from 'lucide-react';
import { SaleItemType } from '@papyrus/shared';
import type { CartItem as CartItemModel } from '../../store/cartStore';
import { cn } from '../../lib/utils';

import { useState, useCallback } from 'react';

interface CartItemProps {
  item: CartItemModel;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export function CartItem({ item, onIncrement, onDecrement, onSetQuantity, onRemove }: CartItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(item.quantity));
  const reachedStockLimit = item.maxStock !== undefined && item.quantity >= item.maxStock;
  const isService = item.itemType === SaleItemType.SERVICE;

  const handleCommit = useCallback(() => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 1) {
      // Revert to actual quantity on invalid input
      setDraft(String(item.quantity));
    } else {
      onSetQuantity(item.id, parsed);
    }
    setEditing(false);
  }, [draft, item.id, item.quantity, onSetQuantity]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCommit();
      } else if (e.key === 'Escape') {
        setDraft(String(item.quantity));
        setEditing(false);
      }
    },
    [handleCommit, item.quantity],
  );

  return (
    <div className={cn(
      'group flex items-center gap-1.5 rounded-lg px-1 py-1.5 transition sm:gap-2 sm:px-1.5',
      isService ? 'bg-gold/[0.02]' : 'hover:bg-bg/50',
    )}>
      {/* Quantity controls */}
      <div className="flex shrink-0 items-center">
        <span className="flex items-center gap-px rounded-md border border-border/60 bg-white/70 px-1 py-0.5">
          <button
            type="button"
            onClick={() => onDecrement(item.id)}
            className="flex h-3.5 w-3.5 items-center justify-center rounded text-primary/40 transition hover:bg-danger/10 hover:text-danger"
            aria-label={`Restar ${item.name}`}
          >
            <Minus className="h-2.5 w-2.5" />
          </button>
          {editing ? (
            <input
              type="number"
              min="1"
              max={item.maxStock ?? undefined}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-5 w-8 rounded border border-gold/50 bg-white px-0.5 text-center text-[11px] font-bold tabular-nums text-primary outline-none ring-1 ring-gold/30"
            />
          ) : (
            <span
              className="min-w-[1rem] cursor-text text-center text-[11px] font-bold tabular-nums text-primary hover:bg-bg/50 rounded px-0.5"
              onClick={() => {
                setDraft(String(item.quantity));
                setEditing(true);
              }}
              title="Click para editar cantidad"
            >
              {item.quantity}
            </span>
          )}
          <button
            type="button"
            disabled={reachedStockLimit}
            onClick={() => onIncrement(item.id)}
            className={cn(
              'flex h-3.5 w-3.5 items-center justify-center rounded text-primary/40 transition hover:bg-success/10 hover:text-success',
              reachedStockLimit && 'cursor-not-allowed opacity-30',
            )}
            aria-label={`Sumar ${item.name}`}
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </span>
      </div>

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-primary leading-snug">
          {isService && <span className="text-gold">✦ </span>}
          {item.name}
        </p>
        <p className="text-[10px] tabular-nums text-primary/40">
          {currency.format(item.price)} c/u
        </p>
      </div>

      {/* Line total */}
      <div className="w-[4.5rem] shrink-0 text-right">
        <span className="text-xs font-bold tabular-nums text-primary">{currency.format(item.price * item.quantity)}</span>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-primary/15 opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
        aria-label={`Quitar ${item.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
