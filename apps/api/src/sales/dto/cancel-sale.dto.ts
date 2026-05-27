import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSaleDto {
  @ApiProperty({ description: 'Motivo de la anulación' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
