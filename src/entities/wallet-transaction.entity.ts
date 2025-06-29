import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Wallet } from './wallet.entity';

@Entity({ name: 'wallet_transactions' })
@Index(['wallet_id', 'created_at'])
@Index(['user_id', 'created_at'])
@Index(['transaction_type', 'created_at'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  wallet_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'enum', enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER_IN', 'TRANSFER_OUT', 'PURCHASE', 'SALE', 'REWARD', 'PENALTY'] })
  transaction_type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'PURCHASE' | 'SALE' | 'REWARD' | 'PENALTY';

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balance_before: number; // 거래 전 잔액

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balance_after: number; // 거래 후 잔액

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 거래 설명

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_id: string; // 외부 참조 ID (주문 ID, 아이템 ID 등)

  @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], default: 'COMPLETED' })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @Column({ type: 'json', nullable: true })
  metadata: object; // 거래별 추가 정보

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
