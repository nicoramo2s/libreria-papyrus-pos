import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFilter = { createdAt: { gte: today, lt: tomorrow } };

    const [todayAgg, todayCount, recentSales, allProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { ...dateFilter, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      this.prisma.sale.count({
        where: { ...dateFilter, status: 'COMPLETED' },
      }),
      this.prisma.sale.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          total: true,
          createdAt: true,
          user: { select: { displayName: true } },
        },
      }),
      this.prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, stock: true, stockAlert: true },
      }),
    ]);

    const todayRevenue = Number(todayAgg._sum.total ?? 0);
    const lowStockProducts = allProducts.filter(p => p.stock <= p.stockAlert);
    const averageTicket = todayCount > 0 ? todayRevenue / todayCount : 0;

    // Top product today via raw SQL
    const topProduct = await this.getTopProductToday(today, tomorrow);

    // Today cost and profit: sum purchasePrice * quantity from today's completed sale items
    const todaySaleItems = await this.prisma.saleItem.findMany({
      where: { sale: { ...dateFilter, status: 'COMPLETED' } },
      select: { purchasePrice: true, quantity: true },
    });
    const todayCost = todaySaleItems.reduce((sum, i) => sum + Number(i.purchasePrice) * i.quantity, 0);
    const todayProfit = todayRevenue - todayCost;
    const todayMargin = todayRevenue > 0 ? Math.round((todayProfit / todayRevenue) * 100 * 10) / 10 : 0;

    return {
      todayRevenue,
      todayTransactions: todayCount,
      averageTicket,
      topProduct: topProduct ?? null,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentSales,
      todayCost,
      todayProfit,
      todayMargin,
    };
  }

  async getSalesByPeriod(from?: string, to?: string, groupBy: 'day' | 'week' | 'month' = 'day') {
    const where: Prisma.SaleWhereInput = {
      status: 'COMPLETED',
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt.lt = endDate;
      }
    }

    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        total: true,
        items: { select: { purchasePrice: true, quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date in JavaScript to avoid MySQL ONLY_FULL_GROUP_BY issues with raw SQL
    const grouped = new Map<string, { total: number; count: number; cost: number }>();

    for (const sale of sales) {
      const date = new Date(sale.createdAt);
      let key: string;

      switch (groupBy) {
        case 'week': {
          // Get Monday of the ISO week
          const dayOfWeek = date.getDay();
          const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          const monday = new Date(date);
          monday.setDate(diff);
          key = monday.toISOString().slice(0, 10);
          break;
        }
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      const saleCost = sale.items.reduce((sum, i) => sum + Number(i.purchasePrice) * i.quantity, 0);
      const existing = grouped.get(key) ?? { total: 0, count: 0, cost: 0 };
      existing.total += Number(sale.total);
      existing.count += 1;
      existing.cost += saleCost;
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries()).map(([date, { total, count, cost }]) => ({
      date,
      total,
      count,
      cost,
      profit: total - cost,
      margin: total > 0 ? Math.round(((total - cost) / total) * 100 * 10) / 10 : 0,
    }));
  }

  async getTopProducts(from?: string, to?: string, limit = 10) {
    const saleWhere: Prisma.SaleWhereInput = { status: 'COMPLETED' };
    if (from || to) {
      saleWhere.createdAt = {};
      if (from) saleWhere.createdAt.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        saleWhere.createdAt.lt = endDate;
      }
    }

    // Get matching sale IDs
    const sales = await this.prisma.sale.findMany({
      where: saleWhere,
      select: { id: true },
    });
    const saleIds = sales.map(s => s.id);

    if (saleIds.length === 0) return [];

    const result = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: { saleId: { in: saleIds }, productId: { not: null } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    // Hydrate with product names
    const productIds = result.map(r => r.productId).filter(Boolean) as string[];
    const products = productIds.length > 0
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const productMap = new Map(products.map(p => [p.id, p.name]));

    return result.map(r => ({
      productId: r.productId,
      productName: productMap.get(r.productId ?? '') ?? 'Producto eliminado',
      totalSold: r._sum.quantity ?? 0,
      totalRevenue: Number(r._sum.subtotal ?? 0),
    }));
  }

  async getSalesByPayment(from?: string, to?: string) {
    const where: Prisma.SaleWhereInput = { status: 'COMPLETED' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt.lt = endDate;
      }
    }

    const result = await this.prisma.sale.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { total: true },
      _count: true,
    });

    const totalRevenue = result.reduce((sum, r) => sum + Number(r._sum.total ?? 0), 0);
    const totalCount = result.reduce((sum, r) => sum + r._count, 0);

    return result.map(r => ({
      paymentMethod: r.paymentMethod,
      total: Number(r._sum.total ?? 0),
      count: r._count,
      percentage: totalRevenue > 0 ? Math.round((Number(r._sum.total ?? 0) / totalRevenue) * 100) : 0,
    }));
  }

  async getLowStock() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
    return products.filter(p => p.stock <= p.stockAlert);
  }

  async getProfitability(from?: string, to?: string) {
    const where: Prisma.SaleWhereInput = { status: 'COMPLETED' };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt.lt = endDate;
      }
    }

    const [saleAgg, saleItems] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.saleItem.findMany({
        where: { sale: where },
        select: { purchasePrice: true, quantity: true, subtotal: true, itemType: true },
      }),
    ]);

    const revenue = Number(saleAgg._sum.total ?? 0);
    const transactions = saleAgg._count;

    const cost = saleItems.reduce((sum, i) => sum + Number(i.purchasePrice) * i.quantity, 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100 * 10) / 10 : 0;
    const averageTicket = transactions > 0 ? revenue / transactions : 0;

    // Break down by product vs service revenue
    const productRevenue = saleItems
      .filter(i => i.itemType === 'PRODUCT')
      .reduce((sum, i) => sum + Number(i.subtotal), 0);
    const serviceRevenue = saleItems
      .filter(i => i.itemType === 'SERVICE')
      .reduce((sum, i) => sum + Number(i.subtotal), 0);

    return {
      revenue,
      cost,
      profit,
      margin,
      transactions,
      averageTicket,
      productRevenue,
      serviceRevenue,
    };
  }

  private async getTopProductToday(today: Date, tomorrow: Date) {
    const result = await this.prisma.$queryRaw<Array<{
      productId: string;
      productName: string;
      totalSold: bigint;
    }>>`
      SELECT 
        si.product_id as productId,
        p.name as productName,
        CAST(SUM(si.quantity) AS SIGNED) as totalSold
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at >= ${today}
        AND s.created_at < ${tomorrow}
        AND s.status = 'COMPLETED'
        AND si.product_id IS NOT NULL
      GROUP BY si.product_id, p.name
      ORDER BY totalSold DESC
      LIMIT 1
    `;
    return result.length > 0
      ? { productId: result[0].productId, productName: result[0].productName, totalSold: Number(result[0].totalSold) }
      : null;
  }
}
