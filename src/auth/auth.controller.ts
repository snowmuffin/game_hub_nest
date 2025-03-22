import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    if (req.user) {
      const token = this.authService.generateJwtToken(req.user);
      const userData = this.authService.formatUserData(req.user);

      res.setHeader('Authorization', `Bearer ${token}`);
      res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage(
              { status: 200, user: ${JSON.stringify(userData)}, token: "${token}" },
              '*'
            );
            window.close();
          } else {
            alert('Cannot close the window after authentication.');
          }
        </script>
      `);
    } else {
      res.send(`
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
    }
  }
}
