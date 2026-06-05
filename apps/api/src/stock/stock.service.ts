import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelStockLoadDto } from './dto/cancel-stock-load.dto';
import { CreateStockLoadDto } from './dto/create-stock-load.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    productId?: string;
    from?: string;
    to?: string;
    type?: string;
    page: number;
    limit: number;
  }) {
    const { productId, from, to, type, page, limit } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.StockMovementWhereInput = {};

    if (productId) where.productId = productId;
    if (type) where.type = type as any;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adjust(dto: AdjustStockDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Read product INSIDE transaction to prevent TOCTOU race condition
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        select: { id: true, stock: true, isActive: true },
      });
      if (!product) throw new NotFoundException('Producto no encontrado');
      if (!product.isActive) throw new BadRequestException('No se puede ajustar stock de un producto inactivo');

      let newStock: number;
      if (dto.type === 'IN') {
        newStock = product.stock + dto.quantity;
      } else if (dto.type === 'OUT') {
        newStock = product.stock - dto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Stock insuficiente para realizar esta operación');
        }
      } else {
        // ADJUSTMENT — set to exact quantity
        newStock = dto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('El stock no puede ser negativo');
        }
      }

      await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          userId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason ?? 'Ajuste manual',
          previousStock: product.stock,
          newStock,
        },
      });

      return tx.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
        include: { category: true },
      });
    });
  }

  async createLoad(dto: CreateStockLoadDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const productIds = dto.items.map((item) => item.productId);
      const uniqueProductIds = new Set(productIds);

      if (uniqueProductIds.size !== productIds.length) {
        throw new BadRequestException(
          'No se puede repetir el mismo producto dentro de una carga de stock',
        );
      }

      const productSubtotal = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );
      const expenseTotal = (dto.expenses ?? []).reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );
      const totalCost = productSubtotal + expenseTotal;

      const stockLoad = await tx.stockLoad.create({
        data: {
          userId,
          supplierName: dto.supplierName,
          supplierContact: dto.supplierContact,
          invoiceNumber: dto.invoiceNumber,
          notes: dto.notes,
          productSubtotal,
          expenseTotal,
          totalCost,
          expenses: dto.expenses?.length
            ? {
                create: dto.expenses.map((expense) => ({
                  type: expense.type,
                  description: expense.description,
                  amount: expense.amount,
                })),
              }
            : undefined,
        },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true, isActive: true },
        });

        if (!product) throw new NotFoundException('Producto no encontrado');
        if (!product.isActive) {
          throw new BadRequestException(
            `No se puede cargar stock del producto inactivo "${product.name}"`,
          );
        }

        const newStock = product.stock + item.quantity;
        const subtotal = item.quantity * item.unitCost;

        await tx.stockLoadItem.create({
          data: {
            stockLoadId: stockLoad.id,
            productId: product.id,
            quantity: item.quantity,
            unitCost: item.unitCost,
            subtotal,
            previousStock: product.stock,
            newStock,
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            purchasePrice: item.unitCost,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            userId,
            stockLoadId: stockLoad.id,
            type: 'IN',
            quantity: item.quantity,
            reason: `Carga de stock${dto.invoiceNumber ? ` #${dto.invoiceNumber}` : ''}`,
            previousStock: product.stock,
            newStock,
          },
        });
      }

      return tx.stockLoad.findUnique({
        where: { id: stockLoad.id },
        include: this.stockLoadInclude(),
      });
    });
  }

  async findLoads(params: {
    from?: string;
    to?: string;
    status?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { from, to, status, search, page, limit } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.StockLoadWhereInput = {};

    if (status) where.status = status as any;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { supplierName: { contains: search } },
        { invoiceNumber: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.stockLoad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.stockLoadInclude(),
      }),
      this.prisma.stockLoad.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findLoadById(id: string) {
    const stockLoad = await this.prisma.stockLoad.findUnique({
      where: { id },
      include: this.stockLoadInclude(),
    });

    if (!stockLoad) throw new NotFoundException('Carga de stock no encontrada');

    return stockLoad;
  }

  async cancelLoad(id: string, userId: string, dto: CancelStockLoadDto) {
    return this.prisma.$transaction(async (tx) => {
      const stockLoad = await tx.stockLoad.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!stockLoad) throw new NotFoundException('Carga de stock no encontrada');
      if (stockLoad.status !== 'ACTIVE') {
        throw new BadRequestException('La carga de stock ya fue anulada');
      }

      for (const item of stockLoad.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, stock: true },
        });

        if (!product) throw new NotFoundException('Producto no encontrado');

        const newStock = product.stock - item.quantity;
        if (newStock < 0) {
          throw new BadRequestException(
            'No se puede anular la carga porque uno o más productos ya no tienen stock suficiente para revertirla',
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            userId,
            stockLoadId: stockLoad.id,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Anulación de carga de stock: ${dto.reason ?? 'sin motivo especificado'}`,
            previousStock: product.stock,
            newStock,
          },
        });
      }

      return tx.stockLoad.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledBy: userId,
          cancelReason: dto.reason,
          cancelledAt: new Date(),
        },
        include: this.stockLoadInclude(),
      });
    });
  }

  private stockLoadInclude() {
    return {
      user: { select: { id: true, displayName: true } },
      cancelledByUser: { select: { id: true, displayName: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, isbn: true } },
        },
      },
      expenses: true,
    } satisfies Prisma.StockLoadInclude;
  }
}
