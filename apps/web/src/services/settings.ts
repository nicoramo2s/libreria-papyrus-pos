import { api } from './api';

export interface SettingsDto {
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  ticket_message?: string;
  max_discount_percent?: string;
  ticket_prefix?: string;
}

export const settingsService = {
  getSettings: async (): Promise<Record<string, string>> => {
    const response = await api.get<Record<string, string>>('/settings');
    return response.data;
  },

  updateSettings: async (data: SettingsDto): Promise<Record<string, string>> => {
    const response = await api.put<Record<string, string>>('/settings', data);
    return response.data;
  },
};
