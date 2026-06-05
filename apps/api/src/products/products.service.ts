import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    categoryId?: string;
    lowStock?: string;
    isActive?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }) {
    const { search, categoryId, lowStock, isActive, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    // By default, only show active products
    if (isActive === undefined || isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { isbn: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Build orderBy — default to createdAt desc
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy as keyof Prisma.ProductOrderByWithRelationInput] = sortOrder ?? 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    if (lowStock === 'true') {
      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        include: { category: true },
      });

      const lowStockProducts = products.filter(
        (product) => product.stock <= product.stockAlert,
      );
      const total = lowStockProducts.length;
      const data = lowStockProducts.slice(skip, skip + limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    try {
      const data = {
        ...dto,
        purchasePrice: dto.purchasePrice ?? 0,
        stock: dto.stock ?? 0,
      };
      return await this.prisma.product.create({
        data: data as unknown as Prisma.ProductCreateInput,
        include: { category: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[]) ?? [];
        if (target.includes('isbn')) {
          throw new ConflictException('Ya existe un producto con ese ISBN');
        }
        throw new ConflictException('Ya existe un producto con esos datos');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    await this.findOne(id);

    // Create stock movement if stock changed
    if (dto.stock !== undefined) {
      const current = await this.prisma.product.findUnique({
        where: { id },
        select: { stock: true },
      });
      const diff = dto.stock - current!.stock;
      if (diff !== 0) {
        await this.prisma.stockMovement.create({
          data: {
            productId: id,
            userId,
            type: 'ADJUSTMENT',
            quantity: Math.abs(diff),
            reason: 'Ajuste manual',
            previousStock: current!.stock,
            newStock: dto.stock,
          },
        });
      }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto as unknown as Prisma.ProductUpdateInput,
        include: { category: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[]) ?? [];
        if (target.includes('isbn')) {
          throw new ConflictException('Ya existe otro producto con ese ISBN');
        }
        throw new ConflictException('Ya existe un producto con esos datos');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateImage(id: string, filename: string) {
    const product = await this.findOne(id);

    // Delete old image if exists
    if (product.imageUrl) {
      const oldPath = join(__dirname, '..', '..', 'uploads', product.imageUrl);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: { imageUrl: filename },
      include: { category: true },
    });
  }

  async removeImage(id: string) {
    const product = await this.findOne(id);

    if (product.imageUrl) {
      const filePath = join(__dirname, '..', '..', 'uploads', product.imageUrl);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: { imageUrl: null },
      include: { category: true },
    });
  }
}
