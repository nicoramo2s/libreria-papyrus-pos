import { api } from './api';
import type { Service } from '@papyrus/shared';

export type CreateServiceData = {
  name: string;
  description?: string;
  basePrice: number;
  purchaseCost?: number;
};

export type UpdateServiceData = {
  name?: string;
  description?: string;
  basePrice?: number;
  purchaseCost?: number;
  isActive?: boolean;
};

export const servicesService = {
  // Get all services
  getAll: async (params?: { isActive?: boolean }) => {
    const { data } = await api.get<Service[]>('/services', {
      params: {
        isActive: params?.isActive ?? undefined,
      },
    });
    return data;
  },

  // Get service by ID
  getById: async (id: string) => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  // Create service
  create: async (data: CreateServiceData) => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  // Update service
  update: async (id: string, data: UpdateServiceData) => {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  // Delete service (soft delete)
  delete: async (id: string) => {
    await api.delete(`/services/${id}`);
  },
};
