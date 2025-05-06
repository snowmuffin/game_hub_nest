import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users', schema: 'spaceengineers' }) // 스키마 명시
export class User {
  @PrimaryGeneratedColumn()
  id: number; // 자동 증가하는 기본 키

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string; // 유저 이름 (고유)

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string; // 이메일 (nullable)

  @Column({ type: 'varchar', nullable: true })
  password: string; // 비밀번호 (nullable)

  @Column({ type: 'varchar', length: 50, unique: true })
  steam_id: string; // Steam ID (고유)

  @Column({ type: 'float', default: 0 })
  score: number; // 유저 점수 (기본값 0)

  @CreateDateColumn()
  created_at: Date; // 생성 시간

  @UpdateDateColumn()
  updated_at: Date; // 업데이트 시간
}