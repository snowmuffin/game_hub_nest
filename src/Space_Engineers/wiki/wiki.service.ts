import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiCategory } from '../../entities/space_engineers/wiki-category.entity';
import { WikiCategoryI18n } from '../../entities/space_engineers/wiki-category-i18n.entity';
import { WikiArticle } from '../../entities/space_engineers/wiki-article.entity';
import { WikiArticleI18n } from '../../entities/space_engineers/wiki-article-i18n.entity';
import {
  CategoryCreateDto,
  CategoryUpdateDto,
  ArticleCreateDto,
  ArticleUpdateDto,
} from './wiki.dto';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiCategory)
    private categoryRepo: Repository<WikiCategory>,
    @InjectRepository(WikiCategoryI18n)
    private categoryI18nRepo: Repository<WikiCategoryI18n>,
    @InjectRepository(WikiArticle)
    private articleRepo: Repository<WikiArticle>,
    @InjectRepository(WikiArticleI18n)
    private articleI18nRepo: Repository<WikiArticleI18n>,
  ) {}

  // ===== Public API Methods =====

  /**
   * Get all published categories with translations
   */
  async getCategories(language: string = 'ko') {
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation', 'translation.language = :language', { language })
      .leftJoinAndSelect('category.articles', 'articles', 'articles.is_published = true')
      .where('category.is_published = true')
      .orderBy('category.display_order', 'ASC')
      .getMany();

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      icon: category.icon,
      title: category.translations[0]?.title || category.slug,
      description: category.translations[0]?.description,
      articlesCount: category.articles?.length || 0,
    }));
  }

  /**
   * Get a specific category with its articles
   */
  async getCategoryBySlug(categorySlug: string, language: string = 'ko') {
    const category = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation', 'translation.language = :language', { language })
      .where('category.slug = :categorySlug', { categorySlug })
      .andWhere('category.is_published = true')
      .getOne();

    if (!category) {
      throw new NotFoundException(`Category with slug '${categorySlug}' not found`);
    }

    const articles = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'translation', 'translation.language = :language', { language })
      .where('article.category_id = :categoryId', { categoryId: category.id })
      .andWhere('article.is_published = true')
      .orderBy('article.display_order', 'ASC')
      .getMany();

    return {
      category: {
        id: category.id,
        slug: category.slug,
        icon: category.icon,
        title: category.translations[0]?.title || category.slug,
        description: category.translations[0]?.description,
      },
      articles: articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.translations[0]?.title || article.slug,
        summary: article.translations[0]?.summary,
      })),
    };
  }

  /**
   * Get a specific article with full content
   */
  async getArticle(categorySlug: string, articleSlug: string, language: string = 'ko') {
    const category = await this.categoryRepo.findOne({
      where: { slug: categorySlug, isPublished: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${categorySlug}' not found`);
    }

    const article = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'translation', 'translation.language = :language', { language })
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('category.translations', 'categoryTranslation', 'categoryTranslation.language = :language', { language })
      .where('article.slug = :articleSlug', { articleSlug })
      .andWhere('article.category_id = :categoryId', { categoryId: category.id })
      .andWhere('article.is_published = true')
      .getOne();

    if (!article) {
      throw new NotFoundException(`Article with slug '${articleSlug}' not found in category '${categorySlug}'`);
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.translations[0]?.title || article.slug,
      content: article.translations[0]?.content,
      summary: article.translations[0]?.summary,
      category: {
        id: article.category.id,
        slug: article.category.slug,
        title: article.category.translations[0]?.title || article.category.slug,
      },
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  // ===== Admin API Methods =====

  /**
   * Create a new category with translations
   */
  async createCategory(data: CategoryCreateDto) {
    // Check if slug already exists
    const existing = await this.categoryRepo.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new BadRequestException(`Category with slug '${data.slug}' already exists`);
    }

    const category = this.categoryRepo.create({
      slug: data.slug,
      icon: data.icon,
      displayOrder: data.displayOrder || 0,
      isPublished: true,
    });

    const savedCategory = await this.categoryRepo.save(category);

    // Create translations
    const translations = [];
    if (data.ko) {
      translations.push(
        this.categoryI18nRepo.create({
          categoryId: savedCategory.id,
          language: 'ko',
          title: data.ko.title,
          description: data.ko.description,
        }),
      );
    }
    if (data.en) {
      translations.push(
        this.categoryI18nRepo.create({
          categoryId: savedCategory.id,
          language: 'en',
          title: data.en.title,
          description: data.en.description,
        }),
      );
    }

    await this.categoryI18nRepo.save(translations);

    return this.categoryRepo.findOne({
      where: { id: savedCategory.id },
      relations: ['translations'],
    });
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: number, data: CategoryUpdateDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    // Update category fields
    if (data.slug !== undefined) category.slug = data.slug;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.displayOrder !== undefined) category.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) category.isPublished = data.isPublished;

    await this.categoryRepo.save(category);

    // Update translations
    if (data.ko) {
      await this.categoryI18nRepo.upsert(
        {
          categoryId: id,
          language: 'ko',
          title: data.ko.title,
          description: data.ko.description,
        },
        ['categoryId', 'language'],
      );
    }
    if (data.en) {
      await this.categoryI18nRepo.upsert(
        {
          categoryId: id,
          language: 'en',
          title: data.en.title,
          description: data.en.description,
        },
        ['categoryId', 'language'],
      );
    }

    return this.categoryRepo.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  /**
   * Delete a category (cascades to translations and articles)
   */
  async deleteCategory(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }

  /**
   * Create a new article with translations
   */
  async createArticle(data: ArticleCreateDto) {
    // Check if category exists
    const category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with id ${data.categoryId} not found`);
    }

    // Check if slug already exists in this category
    const existing = await this.articleRepo.findOne({
      where: { categoryId: data.categoryId, slug: data.slug },
    });
    if (existing) {
      throw new BadRequestException(`Article with slug '${data.slug}' already exists in this category`);
    }

    const article = this.articleRepo.create({
      categoryId: data.categoryId,
      slug: data.slug,
      displayOrder: data.displayOrder || 0,
      isPublished: true,
    });

    const savedArticle = await this.articleRepo.save(article);

    // Create translations
    const translations = [];
    if (data.ko) {
      translations.push(
        this.articleI18nRepo.create({
          articleId: savedArticle.id,
          language: 'ko',
          title: data.ko.title,
          content: data.ko.content,
          summary: data.ko.summary,
        }),
      );
    }
    if (data.en) {
      translations.push(
        this.articleI18nRepo.create({
          articleId: savedArticle.id,
          language: 'en',
          title: data.en.title,
          content: data.en.content,
          summary: data.en.summary,
        }),
      );
    }

    await this.articleI18nRepo.save(translations);

    return this.articleRepo.findOne({
      where: { id: savedArticle.id },
      relations: ['translations', 'category'],
    });
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: number, data: ArticleUpdateDto) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    // Update article fields
    if (data.categoryId !== undefined) article.categoryId = data.categoryId;
    if (data.slug !== undefined) article.slug = data.slug;
    if (data.displayOrder !== undefined) article.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) article.isPublished = data.isPublished;

    await this.articleRepo.save(article);

    // Update translations
    if (data.ko) {
      await this.articleI18nRepo.upsert(
        {
          articleId: id,
          language: 'ko',
          title: data.ko.title,
          content: data.ko.content,
          summary: data.ko.summary,
        },
        ['articleId', 'language'],
      );
    }
    if (data.en) {
      await this.articleI18nRepo.upsert(
        {
          articleId: id,
          language: 'en',
          title: data.en.title,
          content: data.en.content,
          summary: data.en.summary,
        },
        ['articleId', 'language'],
      );
    }

    return this.articleRepo.findOne({
      where: { id },
      relations: ['translations', 'category'],
    });
  }

  /**
   * Delete an article (cascades to translations)
   */
  async deleteArticle(id: number) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    await this.articleRepo.remove(article);
    return { message: 'Article deleted successfully' };
  }

  /**
   * Get all categories (including unpublished, for admin)
   */
  async getAllCategoriesAdmin() {
    return this.categoryRepo.find({
      relations: ['translations', 'articles'],
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Get all articles (including unpublished, for admin)
   */
  async getAllArticlesAdmin(categoryId?: number) {
    const query = this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.translations', 'translations')
      .leftJoinAndSelect('article.category', 'category')
      .orderBy('article.display_order', 'ASC');

    if (categoryId) {
      query.where('article.category_id = :categoryId', { categoryId });
    }

    return query.getMany();
  }
}
