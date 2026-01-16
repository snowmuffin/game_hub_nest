import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { WikiArticle } from './wiki-article.entity';

@Entity('wiki_article_i18n')
@Unique(['articleId', 'language'])
@Index(['language'])
export class WikiArticleI18n {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'article_id' })
  articleId: number;

  @Column({ type: 'varchar', length: 10 })
  language: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @ManyToOne(() => WikiArticle, (article) => article.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: WikiArticle;
}
