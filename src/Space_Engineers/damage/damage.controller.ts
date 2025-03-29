import { Controller, Post, Body } from '@nestjs/common';
import { DamageService } from './damage.service';
import { DamageLogDto } from './dto/damage-log.dto';

@Controller('api/damage_logs')
export class DamageController {
  constructor(private readonly damageService: DamageService) {}

  @Post()
  async postDamageLogs(@Body() damageLogs: DamageLogDto[]) {
    return this.damageService.processDamageLogs(damageLogs);
  }
}