import { Controller, Logger } from '@nestjs/common';

@Controller('space-engineers/reward')
export class RewardController {
    private readonly logger = new Logger(RewardController.name);
}
