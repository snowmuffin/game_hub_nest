import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiController, WikiAdminController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { WikiCategory } from '../../entities/space_engineers/wiki-category.entity';
import { WikiCategoryI18n } from '../../entities/space_engineers/wiki-category-i18n.entity';
import { WikiArticle } from '../../entities/space_engineers/wiki-article.entity';
import { WikiArticleI18n } from '../../entities/space_engineers/wiki-article-i18n.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WikiCategory,
      WikiCategoryI18n,
      WikiArticle,
      WikiArticleI18n,
    ]),
    AuthModule,
  ],
  controllers: [WikiController, WikiAdminController],
  providers: [WikiService],
  exports: [WikiService],
})
export class WikiModule {}
