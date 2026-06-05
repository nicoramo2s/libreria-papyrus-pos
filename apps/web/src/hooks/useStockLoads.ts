import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateStockLoadDto } from '@papyrus/shared';
import { stockLoadsService } from '../services/stockLoads';

interface UseStockLoadsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const stockLoadsQueryKey = (params?: UseStockLoadsParams) =>
  ['stock-loads', params ?? {}] as const;

export function useStockLoads({
  search = '',
  status,
  page = 1,
  limit = 20,
}: UseStockLoadsParams = {}) {
  return useQuery({
    queryKey: stockLoadsQueryKey({ search, status, page, limit }),
    queryFn: () =>
      stockLoadsService.getStockLoads({
        search,
        status,
        page,
        limit,
      }),
  });
}

export function useCreateStockLoad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockLoadDto) =>
      stockLoadsService.createStockLoad(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-loads'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCancelStockLoad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      stockLoadsService.cancelStockLoad(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-loads'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
