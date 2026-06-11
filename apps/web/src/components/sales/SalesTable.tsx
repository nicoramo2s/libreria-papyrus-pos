import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ReceiptText,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { SaleListEntry } from '@/services/sales';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'gold' }> = {
  COMPLETED: { label: 'Completada', variant: 'success' },
  CANCELLED: { label: 'Anulada', variant: 'danger' },
  RETURNED: { label: 'Devuelta', variant: 'gold' },
};

const paymentMethodLabel: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

const timeAgo = (dateStr: string) => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

interface SalesTableFilters {
  search: string;
  paymentMethod: string;
  status: string;
  from: string;
  to: string;
  sortOrder: 'asc' | 'desc';
}

interface SalesTableProps {
  sales: SaleListEntry[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  filters: SalesTableFilters;
  onFiltersChange: (filters: SalesTableFilters) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetail: (id: string) => void;
}

export function SalesTable({
  sales,
  total,
  page,
  limit,
  isLoading,
  filters,
  onFiltersChange,
  onPageChange,
  onLimitChange,
  onViewDetail,
}: SalesTableProps) {
  const totalPages = Math.ceil(total / limit);

  const updateFilter = (key: keyof SalesTableFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      paymentMethod: '',
      status: '',
      from: '',
      to: '',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.paymentMethod ||
    filters.status ||
    filters.from ||
    filters.to;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/35" />
          <input
            placeholder="PAP-00001..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="h-8 w-full min-w-[120px] rounded-lg border border-border dark:bg-surface bg-white pl-8 pr-3 text-xs font-medium text-primary outline-none transition placeholder:text-primary/30 focus:border-gold focus:ring-1 focus:ring-gold/20 sm:w-36"
          />
        </div>

        <Select
          value={filters.paymentMethod || 'all'}
          onValueChange={(val) =>
            updateFilter('paymentMethod', val === 'all' ? '' : val)
          }
        >
          <SelectTrigger className="h-8 w-28 text-xs sm:w-32">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="CASH">Efectivo</SelectItem>
            <SelectItem value="CARD">Tarjeta</SelectItem>
            <SelectItem value="TRANSFER">Transferencia</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(val) =>
            updateFilter('status', val === 'all' ? '' : val)
          }
        >
          <SelectTrigger className="h-8 w-24 text-xs sm:w-32">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="COMPLETED">Completadas</SelectItem>
            <SelectItem value="CANCELLED">Anuladas</SelectItem>
            <SelectItem value="RETURNED">Devueltas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(val) =>
            updateFilter('sortOrder', val as 'asc' | 'desc')
          }
        >
          <SelectTrigger className="h-8 w-28 text-xs sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Más recientes</SelectItem>
            <SelectItem value="asc">Más antiguas</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
            className="h-8 w-28 rounded-lg border border-border dark:bg-surface bg-white px-2 text-xs font-medium text-primary outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/20 sm:w-32"
          />
          <span className="text-[10px] text-primary/40">a</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
            className="h-8 w-28 rounded-lg border border-border dark:bg-surface bg-white px-2 text-xs font-medium text-primary outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/20 sm:w-32"
          />
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-gold transition hover:bg-gold/10"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/90 shadow-papyrus">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-bg/70"
              />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ReceiptText className="h-8 w-8 text-gold" />
            <h3 className="mt-3 text-lg font-bold text-primary">
              No hay ventas
            </h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-primary/58">
              {hasActiveFilters
                ? 'No encontramos ventas con esos filtros. Probá ajustando la búsqueda.'
                : 'Todavía no se registraron ventas. Andá al POS para emitir el primer ticket.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50">
                    Ticket
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50">
                    Cajero
                  </th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50 sm:table-cell">
                    Ítems
                  </th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50 md:table-cell">
                    Método
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50">
                    Total
                  </th>
                  <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-primary/50" />
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const statusInfo = statusLabel[sale.status] ?? {
                    label: sale.status,
                    variant: 'neutral' as const,
                  };

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-border/60 transition last:border-b-0 hover:bg-bg/40"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <span className="font-mono text-xs font-bold text-primary">
                          {sale.ticketNumber}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-primary/65">
                        <div className="text-xs font-medium text-primary">
                          {new Date(sale.createdAt).toLocaleDateString(
                            'es-AR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            },
                          )}
                        </div>
                        <div className="text-[10px] text-primary/45">
                          {timeAgo(sale.createdAt)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-primary">
                        {sale.user.displayName}
                      </td>
                      <td className="hidden px-3 py-2.5 text-xs text-primary/65 sm:table-cell">
                        {sale._count.items} ítems
                      </td>
                      <td className="hidden px-3 py-2.5 text-xs text-primary/65 md:table-cell">
                        {paymentMethodLabel[sale.paymentMethod] ??
                          sale.paymentMethod}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-black text-primary">
                        {currency.format(sale.total)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant={statusInfo.variant} className="text-[10px] px-1.5 py-0.5">
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 gap-1 px-2 text-[10px]"
                          onClick={() => onViewDetail(sale.id)}
                        >
                          <Eye className="h-3 w-3" />
                          Detalle
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-primary/55">
            <span>Mostrar</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-16 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              de {total} ventas
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold transition focus:outline-none focus:ring-1 focus:ring-gold/30',
                      page === pageNum
                        ? 'bg-inverse text-white'
                        : 'text-primary/55 hover:bg-gold/10 hover:text-primary',
                    )}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
