import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('damage_logs')
export class DamageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  steamId: string;

  @Column()
  damage: number;

  @Column()
  sekCoin: number;

  @Column({ nullable: true })
  serverId: string;
}