import { api } from './api';
import type { Product, CreateProductDto, UpdateProductDto } from '@papyrus/shared';

export const productsService = {
  // Get products with filters
  getProducts: async (params: {
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const { data } = await api.get<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }>('/products', {
      params: {
        isActive: true,
        search: params.search || undefined,
        categoryId: params.categoryId || undefined,
        lowStock: params.lowStock ? 'true' : undefined,
        page: params.page || 1,
        limit: params.limit || 50,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
      },
    });
    return data;
  },

  // Get product by ID
  getProductById: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (data: CreateProductDto) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductDto) => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (soft delete)
  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  // Upload product image
  uploadImage: async (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ imageUrl: string }>(`/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};