import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserData } from './user-data.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserData])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}