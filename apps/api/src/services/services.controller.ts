import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un servicio' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar servicio (desactivación lógica)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Listar variantes de un servicio' })
  findVariants(@Param('id') id: string) {
    return this.servicesService.findVariants(id);
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Crear variante para un servicio' })
  createVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.servicesService.createVariant(id, dto);
  }
}
