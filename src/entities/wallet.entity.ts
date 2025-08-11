import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { Game } from './game.entity';
import { GameServer } from './game-server.entity';
import { Currency } from './currency.entity';

@Entity({ name: 'wallets' })
@Index(['user_id', 'game_id', 'server_id', 'currency_id'], { unique: true }) // 유저+게임+서버+화폐 조합의 유일성 보장
export class Wallet {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  game_id: number;

  @Column({ type: 'int', nullable: true })
  server_id: number; // null이면 게임 전체 지갑

  @Column({ type: 'int' })
  currency_id: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  balance: number; // 높은 정밀도를 위해 precision 증가

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  locked_balance: number; // 거래 중인 잠긴 잔액

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // 지갑 활성화 상태

  @Column({ type: 'json', nullable: true })
  metadata: object; // 지갑별 추가 정보 (마지막 거래 시간 등)

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => GameServer, { nullable: true })
  @JoinColumn({ name: 'server_id' })
  server: GameServer;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 사용 가능한 잔액 계산 (총 잔액 - 잠긴 잔액)
  get available_balance(): number {
    return Number(this.balance) - Number(this.locked_balance);
  }
}
