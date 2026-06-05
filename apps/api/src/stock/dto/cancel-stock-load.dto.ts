import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelStockLoadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
