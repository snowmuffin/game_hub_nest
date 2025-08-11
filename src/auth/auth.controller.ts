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
    // Steam 인증으로 리다이렉트 (passport-steam이 자동 처리)
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginReturn(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
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
      const user = await this.authService.findOrCreateUser(req.user);
      console.log('User found/created:', user); // 디버깅용

      const accessToken = this.authService.generateJwtToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);
      const userData = this.authService.formatUserData(
        user,
      ) as FormattedUserData;

      console.log('Tokens generated successfully'); // 디버깅용

      // HTTP 환경에서는 secure: false로 설정
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // HTTP 환경에서는 false
        sameSite: 'lax', // 'strict'에서 'lax'로 변경
        domain: '.snowmuffingame.com', // 도메인 설정
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
            
            // 짧은 지연 후 창 닫기
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
      // 테스트 사용자를 생성하거나 기존 사용자 조회
      const testSteamId = steamId || 'test_user_999999';
      const testUsername = username || 'TestUser';

      // 데이터베이스에서 테스트 사용자 조회 또는 생성
      let testUser = await this.userService.findBySteamId(testSteamId);

      if (!testUser) {
        // 테스트 사용자가 없으면 생성
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
