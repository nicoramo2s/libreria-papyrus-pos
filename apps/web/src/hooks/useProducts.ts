import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, CreateProductDto, UpdateProductDto } from '@papyrus/shared';
import { api } from '../services/api';
import { productsService } from '../services/products';

export interface ProductsResponse {
  data: Product[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface UseProductsParams {
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productsQueryKey = (params: UseProductsParams) => ['products', params] as const;

export function useProducts({ 
  search = '', 
  categoryId, 
  lowStock = false, 
  page = 1, 
  limit = 50, 
  sortBy = 'createdAt', 
  sortOrder = 'desc' 
}: UseProductsParams) {
  return useQuery({
    queryKey: productsQueryKey({ search, categoryId, lowStock, page, limit, sortBy, sortOrder }),
    queryFn: async (): Promise<ProductsResponse> => {
      const { data } = await api.get<ProductsResponse>('/products', {
        params: {
          isActive: true,
          search: search || undefined,
          categoryId: categoryId || undefined,
          lowStock: lowStock ? 'true' : undefined,
          page,
          limit,
          sortBy,
          sortOrder,
        },
      });
      return data;
    },
  });
}

// Mutation hooks
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) => 
      productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => 
      productsService.uploadImage(productId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
