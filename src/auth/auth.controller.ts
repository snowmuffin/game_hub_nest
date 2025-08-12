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

interface AuthenticatedRequest extends Request {
  user?: {
    steam_id: string;
    username: string;
    email?: string;
  };
}

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

interface FormattedUserData {
  id: number;
  username: string;
  email: string;
  steamId: string;
  createdAt: Date;
  updatedAt: Date;
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
  async steamLogin(): Promise<void> {
    // Redirect to Steam authentication (automatically handled by passport-steam)
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    console.log('Steam return endpoint hit'); // Debug log
    console.log('User:', req.user); // Debug log

    if (!req.user) {
      console.log('No user found in request'); // Debug log
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
      console.log('User found/created:', user); // Debug log

      const accessToken = this.authService.generateJwtToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);
      const userData = this.authService.formatUserData(
        user,
      ) as FormattedUserData;

      console.log('Tokens generated successfully'); // Debug log

      // Set secure: false for HTTP environment
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // false for HTTP environment
        sameSite: 'lax', // Changed from 'strict' to 'lax'
        domain: '.snowmuffingame.com', // Domain setting
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
            document.body.innerHTML = '<h2>로그인 성공!</h2><p>이 창을 닫아주세요.</p><p>Token: ${accessToken}</p>';
          }
        </script>
      `);
    } catch (error) {
      console.error('Error in steamLoginReturn:', error); // Debug log
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
        // Create test user if not found
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
  refreshAccessToken(@Req() req: Request, @Res() res: Response): Response {
    const refreshToken: unknown = req.cookies['refreshToken'];

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      }) as unknown as JwtPayload;

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
