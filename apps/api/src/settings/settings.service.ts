import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const KNOWN_KEYS = [
  'business_name', 'business_address', 'business_phone',
  'ticket_message', 'ticket_prefix', 'max_discount_percent',
  'next_ticket_number',
];

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async findOne(key: string) {
    this.validateKey(key);
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Configuración "${key}" no encontrada`);
    return { [key]: setting.value };
  }

  async update(key: string, value: string) {
    this.validateKey(key);
    const setting = await this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return { [key]: setting.value };
  }

  async updateBulk(settings: Record<string, string>) {
    const unknownKeys = Object.keys(settings).filter(k => !KNOWN_KEYS.includes(k));
    if (unknownKeys.length > 0) {
      throw new BadRequestException(`Configuraciones desconocidas: ${unknownKeys.join(', ')}`);
    }

    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    return this.findAll();
  }

  private validateKey(key: string) {
    if (!KNOWN_KEYS.includes(key)) {
      throw new BadRequestException(`Configuración desconocida: "${key}"`);
    }
  }
}
