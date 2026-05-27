import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateBulkSettingsDto } from './dto/update-bulk-settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar múltiples configuraciones' })
  updateBulk(@Body() dto: UpdateBulkSettingsDto) {
    return this.settingsService.updateBulk(dto.settings);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obtener una configuración' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Actualizar una configuración' })
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto.value);
  }
}
