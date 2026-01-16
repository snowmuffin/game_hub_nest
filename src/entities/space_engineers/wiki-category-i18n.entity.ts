import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { WikiCategory } from './wiki-category.entity';

@Entity('wiki_category_i18n')
@Unique(['categoryId', 'language'])
@Index(['language'])
export class WikiCategoryI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 10 })
  language: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => WikiCategory, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: WikiCategory;
}
