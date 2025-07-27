import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'muffincraft_players' })
@Index('idx_user_id', ['userId'])
@Index('idx_minecraft_username', ['minecraftUsername'])
export class MuffinCraftPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null; // 연동된 유저 ID (null이면 아직 연동 안됨)

  @Column({ type: 'varchar', length: 16, unique: true })
  minecraftUsername: string; // 마인크래프트 인게임 유저명

  @Column({ type: 'varchar', length: 36, unique: true, nullable: true })
  minecraftUuid: string | null; // 마인크래프트 UUID

  @Column({ type: 'boolean', default: false })
  isLinked: boolean; // 유저와 연동 여부

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
