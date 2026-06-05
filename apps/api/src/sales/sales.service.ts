import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, SaleStatus, StockMovementType, SaleItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Generate ticket number
      const ticketNumber = await this.generateTicketNumber(tx);

      // 2. Process each item
      const saleItems: Array<{
        productId?: string;
        serviceId?: string;
        itemType: SaleItemType;
        productName: string;
        productPrice: number;
        purchasePrice: number;
        quantity: number;
        subtotal: number;
        specifications?: any;
      }> = [];

      let subtotal = 0;

      for (const item of dto.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
          if (!product.isActive) throw new BadRequestException(`Producto "${product.name}" está inactivo`);
          if (product.stock < item.quantity) {
            throw new BadRequestException(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
          }

          const itemSubtotal = Number(product.salePrice) * item.quantity;
          subtotal += itemSubtotal;

          saleItems.push({
            productId: product.id,
            itemType: 'PRODUCT' as SaleItemType,
            productName: product.name,
            productPrice: Number(product.salePrice),
            purchasePrice: Number(product.purchasePrice),
            quantity: item.quantity,
            subtotal: itemSubtotal,
            specifications: item.specifications,
          });
        } else if (item.serviceId) {
          const service = await tx.service.findUnique({
            where: { id: item.serviceId },
            include: { variants: true },
          });
          if (!service) throw new NotFoundException(`Servicio ${item.serviceId} no encontrado`);
          if (!service.isActive) throw new BadRequestException(`Servicio "${service.name}" está inactivo`);

          const price = Number(service.basePrice);
          const itemSubtotal = price * item.quantity;
          subtotal += itemSubtotal;

          saleItems.push({
            serviceId: service.id,
            itemType: 'SERVICE' as SaleItemType,
            productName: service.name,
            productPrice: price,
            purchasePrice: 0,
            quantity: item.quantity,
            subtotal: itemSubtotal,
            specifications: item.specifications,
          });
        }
      }

      // 3. Calculate totals
      const discountAmount = dto.discountAmount ?? 0;

      // Validate max discount percent
      const maxDiscountSetting = await tx.setting.findUnique({ where: { key: 'max_discount_percent' } });
      const maxDiscountPercent = parseInt(maxDiscountSetting?.value ?? '50', 10);
      const discountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
      if (discountPercent > maxDiscountPercent) {
        throw new BadRequestException(
          `El descuento máximo permitido es del ${maxDiscountPercent}%. Descuento solicitado: ${discountPercent.toFixed(1)}%`
        );
      }

      const total = subtotal - discountAmount;
      if (total < 0) throw new BadRequestException('El descuento no puede ser mayor al subtotal');

      // 4. Validate CASH payment
      let cashReceived: number | null = null;
      let changeGiven: number | null = null;
      if (dto.paymentMethod === 'CASH') {
        cashReceived = dto.cashReceived ?? 0;
        if (cashReceived < total) {
          throw new BadRequestException(`Monto recibido insuficiente. Total: $${total}, Recibido: $${cashReceived}`);
        }
        changeGiven = cashReceived - total;
      }

      // 5. Create the sale
      const sale = await tx.sale.create({
        data: {
          ticketNumber,
          userId,
          subtotal,
          discountAmount,
          total,
          paymentMethod: dto.paymentMethod,
          cashReceived,
          changeGiven,
          notes: dto.notes,
          status: 'COMPLETED',
          items: { create: saleItems },
        },
        include: { items: true },
      });

      // 6. Decrement stock + create movements for products
      for (const item of saleItems) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
          const newStock = product!.stock - item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: 'OUT' as StockMovementType,
              quantity: item.quantity,
              reason: `Venta #${ticketNumber}`,
              previousStock: product!.stock,
              newStock,
            },
          });
        }
      }

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: { items: true, user: { select: { id: true, displayName: true } } },
      });
    });
  }

  async findAll(params: {
    from?: string;
    to?: string;
    paymentMethod?: string;
    status?: string;
    search?: string;
    page: number;
    limit: number;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { from, to, paymentMethod, status, search, page, limit, sortOrder } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.SaleWhereInput = {};

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (paymentMethod) where.paymentMethod = paymentMethod as any;
    if (status) where.status = status as any;
    if (search) where.ticketNumber = { contains: search };

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder ?? 'desc' },
        include: {
          user: { select: { id: true, displayName: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        user: { select: { id: true, displayName: true } },
        returns: { include: { returnItems: true } },
      },
    });
    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }

  async cancel(id: string, userId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: { where: { productId: { not: null } } } },
      });
      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.status !== 'COMPLETED') {
        throw new BadRequestException(`La venta está en estado "${sale.status}". Solo se pueden anular ventas completadas.`);
      }

      // Restore stock for each product item
      for (const item of sale.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
          const newStock = product!.stock + item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: 'IN' as StockMovementType,
              quantity: item.quantity,
              reason: `Anulación #${sale.ticketNumber}: ${reason}`,
              previousStock: product!.stock,
              newStock,
            },
          });
        }
      }

      return tx.sale.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledBy: userId,
          cancelReason: reason,
          cancelledAt: new Date(),
        },
        include: { items: true },
      });
    });
  }

  async return(id: string, userId: string, dto: CreateReturnDto) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          items: {
            where: { productId: { not: null } },
          },
        },
      });
      if (!sale) throw new NotFoundException('Venta no encontrada');
      if (sale.status !== 'COMPLETED' && sale.status !== 'RETURNED') {
        throw new BadRequestException(`No se pueden devolver ítems de una venta "${sale.status}"`);
      }

      // Get already-returned quantities per product for this sale
      const existingReturnItems = await tx.returnItem.findMany({
        where: { return: { saleId: id } },
        select: { productId: true, quantity: true },
      });
      const returnedByProduct: Record<string, number> = {};
      for (const ri of existingReturnItems) {
        returnedByProduct[ri.productId] = (returnedByProduct[ri.productId] ?? 0) + ri.quantity;
      }

      let totalRefunded = 0;
      const returnItems: Array<{ productId: string; quantity: number; refundAmount: number }> = [];

      for (const returnItem of dto.items) {
        const saleItem = sale.items.find(i => i.productId === returnItem.productId);
        if (!saleItem) {
          throw new NotFoundException(`Producto ${returnItem.productId} no encontrado en la venta`);
        }

        const alreadyReturned = returnedByProduct[returnItem.productId] ?? 0;
        const availableToReturn = saleItem.quantity - alreadyReturned;

        if (returnItem.quantity > availableToReturn) {
          throw new BadRequestException(
            `Solo se pueden devolver ${availableToReturn} unidades de "${saleItem.productName}"`
          );
        }

        const refundAmount = Number(saleItem.productPrice) * returnItem.quantity;
        totalRefunded += refundAmount;

        returnItems.push({
          productId: returnItem.productId,
          quantity: returnItem.quantity,
          refundAmount,
        });
      }

      // Create Return
      const returnRecord = await tx.return.create({
        data: {
          saleId: id,
          userId,
          reason: dto.reason,
          totalRefunded,
          returnItems: { create: returnItems },
        },
      });

      // Restore stock
      for (const item of returnItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
        const newStock = product!.stock + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'IN' as StockMovementType,
            quantity: item.quantity,
            reason: `Devolución #${sale.ticketNumber}`,
            previousStock: product!.stock,
            newStock,
          },
        });
      }

      // Check if all items are fully returned
      const totalOriginalQuantity = sale.items.reduce((sum, i) => sum + i.quantity, 0);
      const allReturnedItems = await tx.returnItem.findMany({
        where: { return: { saleId: id } },
        select: { quantity: true },
      });
      const totalReturnedQuantity = allReturnedItems.reduce((sum, ri) => sum + ri.quantity, 0);

      if (totalReturnedQuantity >= totalOriginalQuantity) {
        await tx.sale.update({ where: { id }, data: { status: 'RETURNED' as SaleStatus } });
      }

      return returnRecord;
    });
  }

  // Helper: generate ticket number atomically
  private async generateTicketNumber(tx: Prisma.TransactionClient): Promise<string> {
    const prefixSetting = await tx.setting.findUnique({ where: { key: 'ticket_prefix' } });
    const prefix = prefixSetting?.value ?? 'PAP';

    const counterSetting = await tx.setting.findUnique({ where: { key: 'next_ticket_number' } });
    const currentNum = parseInt(counterSetting?.value ?? '0', 10);
    const nextNum = currentNum + 1;

    await tx.setting.upsert({
      where: { key: 'next_ticket_number' },
      create: { key: 'next_ticket_number', value: String(nextNum) },
      update: { value: String(nextNum) },
    });

    const padded = String(currentNum).padStart(5, '0');
    return `${prefix}-${padded}`;
  }
}
