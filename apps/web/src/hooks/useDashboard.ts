import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports';

export const dashboardQueryKey = ['dashboard'] as const;

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => reportsService.getDashboard(),
    refetchInterval: 60_000,
  });
}
