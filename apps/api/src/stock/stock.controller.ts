import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelStockLoadDto } from './dto/cancel-stock-load.dto';
import { CreateStockLoadDto } from './dto/create-stock-load.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Historial de movimientos de stock' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['IN', 'OUT', 'ADJUSTMENT'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('productId') productId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.stockService.findAll({ productId, from, to, type, page: page ?? 1, limit: limit ?? 20 });
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajuste manual de stock' })
  adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: { id: string }) {
    return this.stockService.adjust(dto, user.id);
  }

  @Post('loads')
  @ApiOperation({ summary: 'Crear una carga profesional de stock' })
  createLoad(
    @Body() dto: CreateStockLoadDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.stockService.createLoad(dto, user.id);
  }

  @Get('loads')
  @ApiOperation({ summary: 'Historial de cargas de stock' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'CANCELLED'] })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar proveedor, factura o notas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findLoads(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.stockService.findLoads({
      from,
      to,
      status,
      search,
      page: page ?? 1,
      limit: limit ?? 20,
    });
  }

  @Get('loads/:id')
  @ApiOperation({ summary: 'Detalle de una carga de stock' })
  findLoadById(@Param('id') id: string) {
    return this.stockService.findLoadById(id);
  }

  @Patch('loads/:id/cancel')
  @ApiOperation({ summary: 'Anular una carga de stock y revertir inventario' })
  cancelLoad(
    @Param('id') id: string,
    @Body() dto: CancelStockLoadDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.stockService.cancelLoad(id, user.id, dto);
  }
}
