import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBulkSettingsDto {
  @ApiProperty({ type: Object, additionalProperties: { type: 'string' } })
  @IsObject()
  settings!: Record<string, string>;
}
