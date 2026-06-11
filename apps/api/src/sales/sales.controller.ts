import { Controller, Get, Post, Patch, Body, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CancelSaleDto } from './dto/cancel-sale.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva venta' })
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: { id: string }) {
    return this.salesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: ['CASH', 'CARD', 'TRANSFER'] })
  @ApiQuery({ name: 'status', required: false, enum: ['COMPLETED', 'CANCELLED', 'RETURNED'] })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por número de ticket' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.salesService.findAll({ from, to, paymentMethod, status, search, page: page ?? 1, limit: limit ?? 20, sortOrder });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de venta' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Anular venta' })
  cancel(@Param('id') id: string, @Body() dto: CancelSaleDto, @CurrentUser() user: { id: string }) {
    return this.salesService.cancel(id, user.id, dto.reason);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Registrar devolución parcial' })
  returnSale(@Param('id') id: string, @Body() dto: CreateReturnDto, @CurrentUser() user: { id: string }) {
    return this.salesService.return(id, user.id, dto);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Cambiar método de pago de una venta completada' })
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto, @CurrentUser() user: { id: string }) {
    return this.salesService.updatePayment(id, user.id, dto);
  }
}
