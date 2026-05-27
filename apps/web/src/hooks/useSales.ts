import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService, type SalesQueryParams } from '../services/sales';

export const salesQueryKey = (params: SalesQueryParams) => ['sales', params] as const;
export const saleDetailQueryKey = (id: string) => ['sale', id] as const;

export function useSales(params: SalesQueryParams = {}) {
  return useQuery({
    queryKey: salesQueryKey(params),
    queryFn: () => salesService.getSales(params),
  });
}

export function useSaleDetail(id: string | null) {
  return useQuery({
    queryKey: saleDetailQueryKey(id ?? ''),
    queryFn: () => salesService.getSaleById(id!),
    enabled: id !== null,
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      salesService.cancelSale(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useReturnSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      items,
    }: {
      id: string;
      reason: string;
      items: Array<{ productId: string; quantity: number }>;
    }) => salesService.returnSale(id, { reason, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
