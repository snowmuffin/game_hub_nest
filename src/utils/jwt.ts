import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

/**
 * JWT 토큰을 생성하는 함수
 * @param payload - 토큰에 포함할 페이로드 데이터
 * @param expiresIn - 토큰 만료 시간 (예: '2h', '1d')
 * @returns 생성된 JWT 토큰
 */
export const generateToken = (payload: object, expiresIn: string = '2h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

/**
 * JWT 토큰을 검증하는 함수
 * @param token - 검증할 JWT 토큰
 * @returns 토큰의 디코딩된 페이로드
 * @throws 유효하지 않은 토큰인 경우 오류 발생
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};