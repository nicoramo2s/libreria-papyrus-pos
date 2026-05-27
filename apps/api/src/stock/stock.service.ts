import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

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
}
