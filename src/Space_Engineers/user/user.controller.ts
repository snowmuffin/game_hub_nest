import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':steamid/profile')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(@Param('steamid') steamId: string) {
    return this.userService.getUserProfile(steamId);
  }

  @Put(':steamid/profile')
  @UseGuards(AuthGuard('jwt'))
  async updateUserProfile(@Param('steamid') steamId: string, @Body() updateData: { nickname: string }) {
    return this.userService.updateUserProfile(steamId, updateData.nickname);
  }
}