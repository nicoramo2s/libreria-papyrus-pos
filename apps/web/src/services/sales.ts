import { api } from './api';
import type { Sale } from '@papyrus/shared';

export interface SalesListResponse {
  data: SaleListEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleListEntry {
  id: string;
  ticketNumber: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  paymentMethod: string;
  status: string;
  cashReceived?: number;
  changeGiven?: number;
  createdAt: string;
  user: { id: string; displayName: string };
  _count: { items: number };
}

export interface SaleDetail extends Sale {
  user: { id: string; displayName: string };
  returns: Array<{
    id: string;
    reason: string;
    totalRefunded: number;
    createdAt: string;
    returnItems: Array<{
      id: string;
      productId: string;
      quantity: number;
      refundAmount: number;
    }>;
  }>;
}

export interface CancelSalePayload {
  reason: string;
}

export interface ReturnItemPayload {
  productId: string;
  quantity: number;
}

export interface ReturnSalePayload {
  reason: string;
  items: ReturnItemPayload[];
}

export interface SalesQueryParams {
  from?: string;
  to?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export const salesService = {
  getSales: async (params: SalesQueryParams = {}): Promise<SalesListResponse> => {
    const { data } = await api.get<SalesListResponse>('/sales', {
      params: {
        from: params.from || undefined,
        to: params.to || undefined,
        paymentMethod: params.paymentMethod || undefined,
        status: params.status || undefined,
        search: params.search || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        sortOrder: params.sortOrder || 'desc',
      },
    });
    return data;
  },

  getSaleById: async (id: string): Promise<SaleDetail> => {
    const { data } = await api.get<SaleDetail>(`/sales/${id}`);
    return data;
  },

  cancelSale: async (id: string, payload: CancelSalePayload): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/sales/${id}/cancel`, payload);
    return data;
  },

  returnSale: async (id: string, payload: ReturnSalePayload): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/sales/${id}/return`, payload);
    return data;
  },
};
