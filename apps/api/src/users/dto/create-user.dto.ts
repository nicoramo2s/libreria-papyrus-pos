import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username!: string;

  @ApiProperty()
  @IsString()
  displayName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}
