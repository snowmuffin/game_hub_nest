import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'game_servers' })
export class GameServer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  game_id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // 서버 코드 (예: 'main', 'creative', 'survival')

  @Column({ type: 'varchar', length: 100 })
  name: string; // 서버 이름 (예: 'Main Server', 'Creative Server')

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 서버 설명

  @Column({ type: 'varchar', length: 255, nullable: true })
  server_url: string; // 서버 URL 또는 IP

  @Column({ type: 'int', nullable: true })
  port: number; // 서버 포트

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // 서버 활성화 상태

  @Column({ type: 'json', nullable: true })
  metadata: object; // 서버별 추가 정보 (설정, 규칙 등)

  @ManyToOne('Game', 'servers')
  @JoinColumn({ name: 'game_id' })
  game: any;

  @OneToMany('Wallet', 'server')
  wallets: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
