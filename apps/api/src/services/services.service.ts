import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { variants: true },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        purchaseCost: dto.purchaseCost ?? 0,
      },
      include: { variants: true },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: {
        ...dto,
        purchaseCost: dto.purchaseCost,
      },
      include: { variants: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findVariants(serviceId: string) {
    await this.findOne(serviceId);
    return this.prisma.serviceVariant.findMany({
      where: { serviceId },
      orderBy: { name: 'asc' },
    });
  }

  async createVariant(serviceId: string, dto: CreateVariantDto) {
    await this.findOne(serviceId);
    return this.prisma.serviceVariant.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        purchaseCost: dto.purchaseCost ?? 0,
        serviceId,
      },
    });
  }
}
