import { useQuery } from '@tanstack/react-query';
import { reportsService, type ReportsQueryParams, type ProfitabilityData } from '@/services/reports';

export const reportsQueryKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportsQueryKeys.all, 'dashboard'] as const,
  salesByPeriod: (params?: ReportsQueryParams) =>
    [...reportsQueryKeys.all, 'sales-by-period', params] as const,
  topProducts: (params?: ReportsQueryParams) =>
    [...reportsQueryKeys.all, 'top-products', params] as const,
  salesByPayment: (params?: Pick<ReportsQueryParams, 'from' | 'to'>) =>
    [...reportsQueryKeys.all, 'sales-by-payment', params] as const,
  lowStock: () => [...reportsQueryKeys.all, 'low-stock'] as const,
  profitability: (params?: Pick<ReportsQueryParams, 'from' | 'to'>) =>
    [...reportsQueryKeys.all, 'profitability', params] as const,
};

export function useSalesByPeriod(params?: ReportsQueryParams) {
  return useQuery({
    queryKey: reportsQueryKeys.salesByPeriod(params),
    queryFn: () => reportsService.getSalesByPeriod(params),
  });
}

export function useTopProducts(params?: ReportsQueryParams) {
  return useQuery({
    queryKey: reportsQueryKeys.topProducts(params),
    queryFn: () => reportsService.getTopProducts(params),
  });
}

export function useSalesByPayment(params?: Pick<ReportsQueryParams, 'from' | 'to'>) {
  return useQuery({
    queryKey: reportsQueryKeys.salesByPayment(params),
    queryFn: () => reportsService.getSalesByPayment(params),
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: reportsQueryKeys.lowStock(),
    queryFn: () => reportsService.getLowStock(),
  });
}

export function useProfitability(params?: Pick<ReportsQueryParams, 'from' | 'to'>) {
  return useQuery({
    queryKey: reportsQueryKeys.profitability(params),
    queryFn: (): Promise<ProfitabilityData> => reportsService.getProfitability(params),
  });
}
