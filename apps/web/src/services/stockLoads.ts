import type { CreateStockLoadDto, StockLoad } from '@papyrus/shared';
import { api } from './api';

export interface StockLoadsResponse {
  data: StockLoad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const stockLoadsService = {
  getStockLoads: async (params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<StockLoadsResponse>('/stock/loads', {
      params: {
        search: params.search || undefined,
        status: params.status || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },

  createStockLoad: async (payload: CreateStockLoadDto) => {
    const { data } = await api.post<StockLoad>('/stock/loads', payload);
    return data;
  },

  cancelStockLoad: async (id: string, reason?: string) => {
    const { data } = await api.patch<StockLoad>(`/stock/loads/${id}/cancel`, {
      reason,
    });
    return data;
  },
};
