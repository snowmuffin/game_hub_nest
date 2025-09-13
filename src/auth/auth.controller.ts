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

type SteamProfileMinimal = { steam_id: string; username: string };
type DecodedToken = { sub: number; username: string };
type RequestWithUser = Request & { user?: SteamProfileMinimal };
type RequestWithCookies = Request & { cookies?: Record<string, unknown> };

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
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    console.log('Steam return endpoint hit'); // For debugging
    console.log('User:', req.user); // For debugging

    if (!req.user) {
      console.log('No user found in request'); // For debugging
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
      const user = await this.authService.findOrCreateUser(req.user);
      console.log('User found/created:', user); // For debugging

      const accessToken = this.authService.generateJwtToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);
      const userData = this.authService.formatUserData(user);

      console.log('Tokens generated successfully'); // For debugging

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
            document.body.innerHTML = '<h2>Login successful!</h2><p>Please close this window.</p><p>Token: ${accessToken}</p>';
          }
        </script>
      `);
    } catch (error: unknown) {
      console.error('Error in steamLoginReturn:', error); // For debugging
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
  ): Promise<{
    accessToken: string;
    user: { id: number; steam_id: string; username: string };
  }> {
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
    } catch (error: unknown) {
      console.error('Error generating test token:', error);
      throw new Error('Failed to generate test token');
    }
  }

  @Post('refresh')
  refreshAccessToken(@Req() req: RequestWithCookies, @Res() res: Response) {
    const cookiesUnknown = req.cookies as unknown;
    let refreshToken: string | undefined;
    if (typeof cookiesUnknown === 'object' && cookiesUnknown !== null) {
      const candidate = (cookiesUnknown as Record<string, unknown>)[
        'refreshToken'
      ];
      refreshToken = typeof candidate === 'string' ? candidate : undefined;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      const decoded = this.jwtService.verify<DecodedToken>(refreshToken, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });
      const user: { id: number; username: string } = {
        id: decoded.sub,
        username: decoded.username,
      };
      const newAccessToken = this.authService.generateJwtToken(user);

      return res.json({ token: newAccessToken });
    } catch {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }
  }
}
