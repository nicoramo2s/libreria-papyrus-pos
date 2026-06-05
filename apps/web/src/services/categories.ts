import { api } from './api';
import type { Category } from '@papyrus/shared';

export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

export const categoriesService = {
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
