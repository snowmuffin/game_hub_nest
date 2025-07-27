import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

interface SteamAuthRequest extends Request {
  user?: {
    steam_id: string;
    username: string;
    email?: string;
    [key: string]: any;
  };
}

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {
    // Redirect to Steam authentication (automatically handled by passport-steam)
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(@Req() req: SteamAuthRequest, @Res() res: Response) {
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

      // Set secure: false for HTTP environment
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // false for HTTP environment
        sameSite: 'lax', // changed from 'strict' to 'lax'
        domain: '.snowmuffingame.com', // domain setting
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
            
            // Close window after short delay
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
    } catch (error) {
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
  ) {
    try {
      // Create or find test user
      const testSteamId = steamId || 'test_user_999999';
      const testUsername = username || 'TestUser';

      // Find or create test user in database
      let testUser = await this.userService.findBySteamId(testSteamId);

      if (!testUser) {
        // Create test user if not exists
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
  refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.['refreshToken'] as string;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      const decoded: unknown = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });

      const user = {
        id: (decoded as JwtPayload).sub,
        username: (decoded as JwtPayload).username,
      };
      const newAccessToken = this.authService.generateJwtToken(user);

      return res.json({ token: newAccessToken });
    } catch {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }
  }

  @Post('minecraft/token')
  async generateMinecraftToken(
    @Body() body: { steamId: string; username: string; minecraftUuid?: string },
  ) {
    try {
      const { steamId, username, minecraftUuid } = body;

      if (!steamId || !username) {
        throw new Error('Steam ID and username are required');
      }

      // Find existing user or create new one
      let user = await this.userService.findBySteamId(steamId);

      if (!user) {
        // Create new user
        user = await this.userService.createUser({
          steam_id: steamId,
          username: username,
          minecraft_uuid: minecraftUuid,
        });
      } else if (minecraftUuid && user.minecraft_uuid !== minecraftUuid) {
        // Update Minecraft UUID
        await this.userService.updateMinecraftUuid(user.id, minecraftUuid);
        user.minecraft_uuid = minecraftUuid;
      }

      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }

      const tokenPayload = {
        id: user.id,
        steam_id: user.steam_id,
        username: user.username,
        minecraft_uuid: user.minecraft_uuid,
      };

      // Generate long-term token for Minecraft (24 hours)
      const minecraftToken =
        this.authService.generateMinecraftToken(tokenPayload);

      return {
        success: true,
        token: minecraftToken,
        user: {
          id: user.id,
          steam_id: user.steam_id,
          username: user.username,
          minecraft_uuid: user.minecraft_uuid,
        },
        expires_in: '24h',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error generating minecraft token:', error);
      return {
        success: false,
        error: errorMessage || 'Failed to generate minecraft token',
      };
    }
  }
}
