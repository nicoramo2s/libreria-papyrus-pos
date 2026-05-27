import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type CreateUserDto, type UpdateUserDto } from '../services/users';

export const usersQueryKey = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: () => usersService.getUsers(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
