import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Service } from '@papyrus/shared';
import { servicesService, type CreateServiceData, type UpdateServiceData } from '../services/services';

export const servicesQueryKey = ['services'] as const;

export function useServices() {
  return useQuery({
    queryKey: servicesQueryKey,
    queryFn: () => servicesService.getAll(),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceData) => servicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceData }) =>
      servicesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}
