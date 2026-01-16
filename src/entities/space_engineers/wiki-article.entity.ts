import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { WikiCategory } from './wiki-category.entity';
import { WikiArticleI18n } from './wiki-article-i18n.entity';

@Entity({ name: 'wiki_articles', schema: 'space_engineers' })
@Unique(['categoryId', 'slug'])
@Index(['categoryId'])
export class WikiArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_published' })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WikiCategory, (category) => category.articles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: WikiCategory;

  @OneToMany(() => WikiArticleI18n, (i18n) => i18n.article, { cascade: true })
  translations: WikiArticleI18n[];
}
