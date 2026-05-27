import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type SettingsDto } from '../services/settings';

export const settingsQueryKey = ['settings'] as const;

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: () => settingsService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettingsDto) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    },
  });
}
