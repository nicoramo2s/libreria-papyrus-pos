import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSaleDto, Sale } from '@papyrus/shared';
import { api } from '../services/api';

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSaleDto) => {
      const response = await api.post<Sale>('/sales', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
