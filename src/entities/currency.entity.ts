import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'currencies', schema: 'spaceengineers' })
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  game_id: number; // null이면 글로벌 화폐 (예: USD, EUR)

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string; // 화폐 코드 (예: 'USD', 'SE_CREDITS', 'MC_EMERALD')

  @Column({ type: 'varchar', length: 50 })
  name: string; // 화폐 이름 (예: 'US Dollar', 'Space Credits', 'Emerald')

  @Column({ type: 'varchar', length: 5, nullable: true })
  symbol: string; // 화폐 기호 (예: '$', '₹', '💎')

  @Column({ type: 'enum', enum: ['GLOBAL', 'GAME_SPECIFIC'], default: 'GAME_SPECIFIC' })
  type: 'GLOBAL' | 'GAME_SPECIFIC'; // 화폐 유형

  @Column({ type: 'int', default: 2 })
  decimal_places: number; // 소수점 자릿수

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // 화폐 활성화 상태

  @Column({ type: 'json', nullable: true })
  metadata: object; // 화폐별 추가 정보

  @ManyToOne('Game', 'currencies', { nullable: true })
  @JoinColumn({ name: 'game_id' })
  game: any;

  @OneToMany('Wallet', 'currency')
  wallets: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
