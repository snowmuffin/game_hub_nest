import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import {
  CategoryCreateDto,
  CategoryUpdateDto,
  ArticleCreateDto,
  ArticleUpdateDto,
} from './wiki.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '../../entities/shared/user-role.enum';

@Controller('space-engineers/wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  // ===== Public Routes =====

  /**
   * GET /api/space-engineers/wiki/categories
   * Get all published categories
   */
  @Get('categories')
  async getCategories(@Query('lang') language: string = 'ko') {
    return this.wikiService.getCategories(language);
  }

  /**
   * GET /api/space-engineers/wiki/categories/:slug
   * Get a specific category with its articles
   */
  @Get('categories/:slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query('lang') language: string = 'ko',
  ) {
    return this.wikiService.getCategoryBySlug(slug, language);
  }

  /**
   * GET /api/space-engineers/wiki/articles/:categorySlug/:articleSlug
   * Get a specific article with full content
   */
  @Get('articles/:categorySlug/:articleSlug')
  async getArticle(
    @Param('categorySlug') categorySlug: string,
    @Param('articleSlug') articleSlug: string,
    @Query('lang') language: string = 'ko',
  ) {
    return this.wikiService.getArticle(categorySlug, articleSlug, language);
  }
}

@Controller('space-engineers/wiki/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GAME_ADMIN)
export class WikiAdminController {
  constructor(private readonly wikiService: WikiService) {}

  // ===== Admin Routes - Categories =====

  /**
   * GET /api/space-engineers/admin/wiki/categories
   * Get all categories (including unpublished)
   */
  @Get('categories')
  async getAllCategories() {
    return this.wikiService.getAllCategoriesAdmin();
  }

  /**
   * POST /api/space-engineers/admin/wiki/categories
   * Create a new category
   */
  @Post('categories')
  async createCategory(@Body() data: CategoryCreateDto) {
    return this.wikiService.createCategory(data);
  }

  /**
   * PUT /api/space-engineers/admin/wiki/categories/:id
   * Update an existing category
   */
  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CategoryUpdateDto,
  ) {
    return this.wikiService.updateCategory(id, data);
  }

  /**
   * DELETE /api/space-engineers/admin/wiki/categories/:id
   * Delete a category
   */
  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.deleteCategory(id);
  }

  // ===== Admin Routes - Articles =====

  /**
   * GET /api/space-engineers/admin/wiki/articles
   * Get all articles (including unpublished)
   */
  @Get('articles')
  async getAllArticles(@Query('categoryId') categoryId?: number) {
    return this.wikiService.getAllArticlesAdmin(categoryId);
  }

  /**
   * POST /api/space-engineers/admin/wiki/articles
   * Create a new article
   */
  @Post('articles')
  async createArticle(@Body() data: ArticleCreateDto) {
    return this.wikiService.createArticle(data);
  }

  /**
   * PUT /api/space-engineers/admin/wiki/articles/:id
   * Update an existing article
   */
  @Put('articles/:id')
  async updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ArticleUpdateDto,
  ) {
    return this.wikiService.updateArticle(id, data);
  }

  /**
   * DELETE /api/space-engineers/admin/wiki/articles/:id
   * Delete an article
   */
  @Delete('articles/:id')
  async deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.wikiService.deleteArticle(id);
  }
}
