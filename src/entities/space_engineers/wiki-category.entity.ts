import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WikiCategoryI18n } from './wiki-category-i18n.entity';
import { WikiArticle } from './wiki-article.entity';

@Entity({ name: 'wiki_categories', schema: 'space_engineers' })
export class WikiCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_published' })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WikiCategoryI18n, (i18n) => i18n.category, { cascade: true })
  translations: WikiCategoryI18n[];

  @OneToMany(() => WikiArticle, (article) => article.category)
  articles: WikiArticle[];
}
