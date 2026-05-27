import { Controller, Get, Post, Body, Query, Param, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
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
}
