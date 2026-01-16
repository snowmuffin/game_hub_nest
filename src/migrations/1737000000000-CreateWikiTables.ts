import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWikiTables1737000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wiki_categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."wiki_categories" (
        "id" SERIAL PRIMARY KEY,
        "slug" VARCHAR(255) UNIQUE NOT NULL,
        "icon" VARCHAR(100),
        "display_order" INT DEFAULT 0,
        "is_published" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create wiki_category_i18n table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."wiki_category_i18n" (
        "id" SERIAL PRIMARY KEY,
        "category_id" INT NOT NULL,
        "language" VARCHAR(10) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        CONSTRAINT "FK_wiki_category_i18n_category" 
          FOREIGN KEY ("category_id") 
          REFERENCES "space_engineers"."wiki_categories"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "UQ_wiki_category_i18n_category_language" 
          UNIQUE ("category_id", "language")
      );
    `);

    // Create wiki_articles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."wiki_articles" (
        "id" SERIAL PRIMARY KEY,
        "category_id" INT NOT NULL,
        "slug" VARCHAR(255) NOT NULL,
        "display_order" INT DEFAULT 0,
        "is_published" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_wiki_articles_category" 
          FOREIGN KEY ("category_id") 
          REFERENCES "space_engineers"."wiki_categories"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "UQ_wiki_articles_category_slug" 
          UNIQUE ("category_id", "slug")
      );
    `);

    // Create wiki_article_i18n table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."wiki_article_i18n" (
        "id" SERIAL PRIMARY KEY,
        "article_id" INT NOT NULL,
        "language" VARCHAR(10) NOT NULL,
        "title" VARCHAR(500) NOT NULL,
        "content" TEXT NOT NULL,
        "summary" TEXT,
        CONSTRAINT "FK_wiki_article_i18n_article" 
          FOREIGN KEY ("article_id") 
          REFERENCES "space_engineers"."wiki_articles"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "UQ_wiki_article_i18n_article_language" 
          UNIQUE ("article_id", "language")
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_categories_slug" 
        ON "space_engineers"."wiki_categories"("slug");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_categories_published" 
        ON "space_engineers"."wiki_categories"("is_published");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_category_i18n_language" 
        ON "space_engineers"."wiki_category_i18n"("language");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_articles_category" 
        ON "space_engineers"."wiki_articles"("category_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_articles_published" 
        ON "space_engineers"."wiki_articles"("is_published");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wiki_article_i18n_language" 
        ON "space_engineers"."wiki_article_i18n"("language");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(
      `DROP TABLE IF EXISTS "space_engineers"."wiki_article_i18n" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "space_engineers"."wiki_articles" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "space_engineers"."wiki_category_i18n" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "space_engineers"."wiki_categories" CASCADE;`,
    );
  }
}
