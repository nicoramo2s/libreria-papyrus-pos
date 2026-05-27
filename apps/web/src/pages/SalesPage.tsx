import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { useSales, useSaleDetail, useCancelSale, useReturnSale } from '@/hooks/useSales';
import { SalesTable } from '@/components/sales/SalesTable';
import { SaleDetailModal } from '@/components/sales/SaleDetailModal';

export default function SalesPage() {
  // Filters state
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Debounce search 250ms
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput), 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  // Detail modal
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useSales({
    search: search || undefined,
    paymentMethod: paymentMethod || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sortOrder,
    page,
    limit,
  });

  const { data: saleDetail, isLoading: isLoadingDetail } = useSaleDetail(
    selectedSaleId,
  );

  // Mutations
  const { mutate: cancelSale, isPending: isCancelling } = useCancelSale();
  const { mutate: returnSale, isPending: isReturning } = useReturnSale();

  // Handlers
  const handleFiltersChange = useCallback(
    (filters: {
      search: string;
      paymentMethod: string;
      status: string;
      from: string;
      to: string;
      sortOrder: 'asc' | 'desc';
    }) => {
      setSearchInput(filters.search);
      setPaymentMethod(filters.paymentMethod);
      setStatus(filters.status);
      setFrom(filters.from);
      setTo(filters.to);
      setSortOrder(filters.sortOrder);
      setPage(1);
    },
    [],
  );

  const handleViewDetail = useCallback((id: string) => {
    setSelectedSaleId(id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedSaleId(null);
  }, []);

  const handleCancel = useCallback(
    (reason: string) => {
      if (!selectedSaleId) return;
      cancelSale(
        { id: selectedSaleId, reason },
        {
          onSuccess: () => {
            toast.success('Venta anulada correctamente');
            setSelectedSaleId(null);
          },
          onError: () => {
            toast.error('Error al anular la venta');
          },
        },
      );
    },
    [selectedSaleId, cancelSale],
  );

  const handleReturn = useCallback(
    (
      reason: string,
      items: Array<{ productId: string; quantity: number }>,
    ) => {
      if (!selectedSaleId) return;
      returnSale(
        { id: selectedSaleId, reason, items },
        {
          onSuccess: () => {
            toast.success('Devolución registrada correctamente');
            setSelectedSaleId(null);
          },
          onError: () => {
            toast.error('Error al registrar la devolución');
          },
        },
      );
    },
    [selectedSaleId, returnSale],
  );

  const sales = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Sales table with filters */}
      <SalesTable
        sales={sales}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        filters={{
          search: searchInput,
          paymentMethod,
          status,
          from,
          to,
          sortOrder,
        }}
        onFiltersChange={handleFiltersChange}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onViewDetail={handleViewDetail}
      />

      {/* Detail modal */}
      {selectedSaleId ? (
        <SaleDetailModal
          sale={saleDetail}
          isLoading={isLoadingDetail}
          onClose={handleCloseDetail}
          onCancel={handleCancel}
          onReturn={handleReturn}
          isCancelling={isCancelling}
          isReturning={isReturning}
        />
      ) : null}
    </div>
  );
}
