import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 게임 코드 (예: 'space_engineers', 'minecraft', 'valheim')

  @Column({ type: 'varchar', length: 100 })
  name: string; // 게임 이름 (예: 'Space Engineers', 'Minecraft', 'Valheim')

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 게임 설명

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon_url: string; // 게임 아이콘 URL

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // 게임 활성화 상태

  @OneToMany('GameServer', 'game')
  servers: any[];

  @OneToMany('Currency', 'game')
  currencies: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
