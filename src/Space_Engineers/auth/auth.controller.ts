import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('steam/callback')
  steamCallback(@Req() req: Request, @Res() res: Response) {
    return this.authService.steamCallback(req, res);
  }

  @Post('user/data')
  getUserData(@Body() body: { steamId: string }, @Res() res: Response) {
    return this.authService.getUserData(body.steamId, res);
  }
}