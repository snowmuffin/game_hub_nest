import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly secretKey = 'your-secret-key'; // 환경 변수로 관리하는 것이 좋습니다.

  // JWT 토큰 생성
  generateJwtToken(user: any): string {
    return jwt.sign(
      {
        steamId: user.id,
        displayName: user.displayName,
        profileUrl: user._json.profileurl,
        avatar: user._json.avatar,
      },
      this.secretKey,
      { expiresIn: '2h' },
    );
  }

  // 사용자 데이터를 포맷팅
  formatUserData(user: any): any {
    return {
      steamId: user.id,
      displayName: user.displayName,
      profileUrl: user._json.profileurl,
      avatar: user._json.avatar,
    };
  }
}