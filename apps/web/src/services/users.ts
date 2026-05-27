import { api } from './api';
import type { User } from '@papyrus/shared';

export interface CreateUserDto {
  username: string;
  displayName: string;
  password: string;
}

export interface UpdateUserDto {
  displayName?: string;
  password?: string;
  isActive?: boolean;
}

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },
};
