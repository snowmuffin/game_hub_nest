import { Controller, Get, Post, Req, Res, UseGuards, Query, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))


  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(@Req() req, @Res() res: Response) {
    if (!req.user) {
      res.status(401).send(`
        <script>
          if (window.opener) {
            window.opener.postMessage(
              { status: 401, error: 'Steam authentication failed' },
              '*'
            );
            window.close();
          } else {
            alert('Cannot close the window after authentication.');
          }
        </script>
      `);
      return;
    }

    const user = await this.authService.findOrCreateUser(req.user);

    const accessToken = this.authService.generateJwtToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);
    const userData = this.authService.formatUserData(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage(
            { status: 200, user: ${JSON.stringify(userData)}, token: "${accessToken}" },
            '*'
          );
          window.close();
        } else {
          alert('Cannot close the window after authentication.');
        }
      </script>
    `);
  }

  @Get('generate-test-token')
  generateTestToken(@Query('steam_id') steamId: string, @Query('username') username: string) {
    const user = { id: 1, steam_id: steamId, username }; 
    return {
      accessToken: this.authService.generateJwtToken(user),
    };
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });

      const user = { id: decoded.sub, username: decoded.username };
      const newAccessToken = this.authService.generateJwtToken(user);

      return res.json({ token: newAccessToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }
}
