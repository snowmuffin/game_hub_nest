import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '@entities/user.entity';

@Controller('damage_logs')
export class DamageLogsController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  logGetRequest(@Req() req: Request): string {
    console.log('GET Request received at /api/damage_logs:', req.query);
    return 'GET request logged';
  }

  @Post()
  async logPostRequest(@Body() body: any): Promise<string> {
    for (const log of body) {
      const { steam_id, damage } = log;

      if (!steam_id || damage == null) {
        console.error(`Invalid log entry: ${JSON.stringify(log)}`);
        continue; // Skip invalid entries
      }


      const user = await this.userRepository.findOne({ where: { steam_id } });

      if (!user) {
        console.error(`User not found for steam_id=${steam_id}`);
        continue; // Skip if user is not found
      }

      try {
        await this.userRepository.increment({ steam_id }, 'score', damage);
        console.log(`Updated score for steam_id=${steam_id} by ${damage}`);
      } catch (error) {
        console.error(`Error updating score for steam_id=${steam_id}:`, error);
      }
    }
    return 'POST request logged';
  }
}