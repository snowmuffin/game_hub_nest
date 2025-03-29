import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_data')
export class UserData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  steamId: string;

  @Column()
  nickname: string;

  @Column({ default: 0 })
  sekCoin: number;

  @Column({ nullable: true })
  avatarUrl: string;
}