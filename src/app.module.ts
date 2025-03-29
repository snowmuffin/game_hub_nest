import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpaceEngineersModule } from './Space_Engineers/Space_Engineers.module';

@Module({
  imports: [AuthModule,SpaceEngineersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
