import { api } from './api';

export interface DashboardData {
  todayRevenue: number;
  todayTransactions: number;
  averageTicket: number;
  topProduct: { productId: string; productName: string; totalSold: number } | null;
  lowStockCount: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number; stockAlert: number }>;
  recentSales: Array<{
    id: string;
    ticketNumber: string;
    total: number;
    createdAt: string;
    user: { displayName: string };
  }>;
  todayCost: number;
  todayProfit: number;
  todayMargin: number;
}

export interface ProfitabilityData {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  transactions: number;
  averageTicket: number;
  productRevenue: number;
  serviceRevenue: number;
}

export interface SalesByPeriodEntry {
  date: string;
  total: number;
  count: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface TopProductEntry {
  productId: string | null;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface PaymentBreakdownEntry {
  paymentMethod: string;
  total: number;
  count: number;
  percentage: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  stockAlert: number;
  salePrice: number;
  category: { id: string; name: string } | null;
  isActive: boolean;
}

export interface ReportsQueryParams {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month';
  limit?: number;
}

export const reportsService = {
  getDashboard: (): Promise<DashboardData> =>
    api.get('/reports/dashboard').then((r) => r.data),

  getSalesByPeriod: (params?: ReportsQueryParams): Promise<SalesByPeriodEntry[]> =>
    api.get('/reports/sales-by-period', { params }).then((r) => r.data),

  getTopProducts: (params?: ReportsQueryParams): Promise<TopProductEntry[]> =>
    api.get('/reports/top-products', { params }).then((r) => r.data),

  getSalesByPayment: (params?: Pick<ReportsQueryParams, 'from' | 'to'>): Promise<PaymentBreakdownEntry[]> =>
    api.get('/reports/sales-by-payment', { params }).then((r) => r.data),

  getLowStock: (): Promise<LowStockProduct[]> =>
    api.get('/reports/low-stock').then((r) => r.data),

  getProfitability: (params?: Pick<ReportsQueryParams, 'from' | 'to'>): Promise<ProfitabilityData> =>
    api.get('/reports/profitability', { params }).then((r) => r.data),
};
