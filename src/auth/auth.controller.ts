import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // Guard triggers redirect.
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(
    @Req() req: Request & { user?: any },
    @Res() res: Response,
  ) {
    console.log('Steam return endpoint hit'); // 디버깅용
    console.log('User:', req.user); // 디버깅용

    if (!req.user) {
      console.log('No user found in request'); // 디버깅용
      res.status(401).send(`
        <script>
          console.log('Authentication failed - no user');
          if (window.opener) {
            window.opener.postMessage(
              { status: 401, error: 'Steam authentication failed' },
              'https://se.snowmuffingame.com'
            );
            window.close();
          } else {
            alert('Cannot close the window after authentication. No opener found.');
          }
        </script>
      `);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = await this.authService.findOrCreateUser((req as any).user);
      console.log('User found/created:', user); // 디버깅용

      const accessToken = this.authService.generateJwtToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);
      const userData = this.authService.formatUserData(user);

      console.log('Tokens generated successfully'); // 디버깅용

      // Dynamic cookie flags (improved)
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        domain: '.snowmuffingame.com',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.send(`
        <script>
          console.log('Steam authentication successful');
          console.log('User data:', ${JSON.stringify(userData)});
          console.log('Token:', "${accessToken}");
          
          if (window.opener) {
            console.log('Sending message to opener');
            window.opener.postMessage(
              { 
                status: 200, 
                user: ${JSON.stringify(userData)}, 
                token: "${accessToken}",
                success: true
              },
              'https://se.snowmuffingame.com'
            );
            
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            console.log('No opener found');
            alert('Authentication successful but cannot close window. Please close manually.');
            document.body.innerHTML = '<h2>로그인 성공!</h2><p>이 창을 닫아주세요.</p><p>Token: ${accessToken}</p>';
          }
        </script>
      `);
    } catch (error) {
      console.error('Error in steamLoginReturn:', error); // 디버깅용
      res.status(500).send(`
        <script>
          console.error('Server error during authentication');
          if (window.opener) {
            window.opener.postMessage(
              { status: 500, error: 'Server error during authentication' },
              'https://se.snowmuffingame.com'
            );
            window.close();
          } else {
            alert('Server error during authentication.');
          }
        </script>
      `);
    }
  }

  @Get('generate-test-token')
  async generateTestToken(
    @Query('steam_id') steamId: string,
    @Query('username') username: string,
  ) {
    try {
      const testSteamId = steamId || 'test_user_999999';
      const testUsername = username || 'TestUser';

      let testUser = await this.userService.findBySteamId(testSteamId);

      if (!testUser) {
        testUser = await this.userService.createTestUser(
          testSteamId,
          testUsername,
        );
      }

      const user = {
        id: testUser.id,
        steam_id: testUser.steam_id,
        username: testUser.username,
      };

      return {
        accessToken: this.authService.generateJwtToken(user),
        user: {
          id: testUser.id,
          steam_id: testUser.steam_id,
          username: testUser.username,
        },
      };
    } catch (error) {
      console.error('Error generating test token:', error);
      throw new Error('Failed to generate test token');
    }
  }

  @Post('refresh')
  refreshAccessToken(
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res() res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'];

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      const decoded = this.jwtService.verify(refreshToken ?? '', {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });
      const user = { id: decoded.sub, username: decoded.username };
      const newAccessToken = this.authService.generateJwtToken(user);

      return res.json({ token: newAccessToken });
    } catch {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }
  }
}
