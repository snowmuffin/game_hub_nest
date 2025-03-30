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

  // 스팀 로그인 시작: 스팀 인증 페이지로 리다이렉트
  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {
    // Passport가 인증 과정을 처리하므로 별도의 로직은 필요하지 않습니다.
  }

  // 스팀 인증 후 돌아오는 엔드포인트
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

    // 유저 데이터 생성 또는 조회
    const user = await this.authService.findOrCreateUser(req.user);

    // JWT 토큰 생성
    const accessToken = this.authService.generateJwtToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);
    const userData = this.authService.formatUserData(user);

    // 리프레시 토큰을 쿠키에 저장
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // HTTPS 환경에서만 전송
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
    const user = { id: 1, steam_id: steamId, username }; // 테스트용 사용자 데이터
    return {
      accessToken: this.authService.generateJwtToken(user),
    };
  }

  // 리프레시 토큰을 사용하여 새 액세스 토큰 발급
  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken']; // 쿠키에서 리프레시 토큰 가져오기

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is missing' });
    }

    try {
      // 리프레시 토큰 검증
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'defaultSecret',
      });

      // 새 액세스 토큰 생성
      const user = { id: decoded.sub, username: decoded.username };
      const newAccessToken = this.authService.generateJwtToken(user);

      return res.json({ token: newAccessToken }); // 새 액세스 토큰 반환
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }
}
