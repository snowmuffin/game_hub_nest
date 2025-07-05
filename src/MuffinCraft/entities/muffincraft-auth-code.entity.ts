import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'muffincraft_auth_codes' })
@Index('idx_auth_code', ['authCode'])
@Index('idx_minecraft_username', ['minecraftUsername'])
export class MuffinCraftAuthCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 12, unique: true })
  authCode: string; // 12자리 인증 코드 (영문 대소문자 + 숫자 + 특수문자)

  @Column({ type: 'varchar', length: 16 })
  minecraftUsername: string; // 요청한 마인크래프트 유저명

  @Column({ type: 'varchar', length: 36, nullable: true })
  minecraftUuid: string | null; // 마인크래프트 UUID

  @Column({ type: 'boolean', default: false })
  isUsed: boolean; // 사용 여부

  @Column({ type: 'int', nullable: true })
  usedBy: number | null; // 사용한 유저 ID

  @Column({ type: 'timestamp' })
  expiresAt: Date; // 만료 시간 (발급 후 10분)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
