import { DataSource } from 'typeorm';
import { WikiCategory } from '../entities/space_engineers/wiki-category.entity';
import { WikiCategoryI18n } from '../entities/space_engineers/wiki-category-i18n.entity';
import { WikiArticle } from '../entities/space_engineers/wiki-article.entity';
import { WikiArticleI18n } from '../entities/space_engineers/wiki-article-i18n.entity';

/**
 * Wiki Seed Data Script
 * Seeds initial categories and articles for Space Engineers Wiki
 * 
 * Usage:
 * ts-node src/scripts/seed-wiki.ts
 */

export async function seedWikiData(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(WikiCategory);
  const categoryI18nRepo = dataSource.getRepository(WikiCategoryI18n);
  const articleRepo = dataSource.getRepository(WikiArticle);
  const articleI18nRepo = dataSource.getRepository(WikiArticleI18n);

  console.log('🌱 Starting Wiki seed...');

  // Create categories
  const categories = [
    {
      slug: 'server-overview',
      icon: '🏠',
      displayOrder: 1,
      translations: [
        {
          language: 'ko',
          title: '서버 개요',
          description: 'SEK 서버의 주요 특징과 개요',
        },
        {
          language: 'en',
          title: 'Server Overview',
          description: 'Key features and overview of SEK server',
        },
      ],
    },
    {
      slug: 'commands',
      icon: '⌨️',
      displayOrder: 2,
      translations: [
        {
          language: 'ko',
          title: '명령어 안내',
          description: '서버 내 사용 가능한 명령어 목록',
        },
        {
          language: 'en',
          title: 'Commands',
          description: 'Available commands in the server',
        },
      ],
    },
    {
      slug: 'rules',
      icon: '📋',
      displayOrder: 3,
      translations: [
        {
          language: 'ko',
          title: '서버 규칙',
          description: '서버 이용 시 준수해야 할 규칙',
        },
        {
          language: 'en',
          title: 'Server Rules',
          description: 'Rules to follow when using the server',
        },
      ],
    },
  ];

  console.log('📦 Creating categories...');
  const savedCategories = [];

  for (const catData of categories) {
    const category = categoryRepo.create({
      slug: catData.slug,
      icon: catData.icon,
      displayOrder: catData.displayOrder,
      isPublished: true,
    });

    const savedCategory = await categoryRepo.save(category);
    savedCategories.push(savedCategory);

    // Create translations
    for (const trans of catData.translations) {
      const translation = categoryI18nRepo.create({
        categoryId: savedCategory.id,
        language: trans.language,
        title: trans.title,
        description: trans.description,
      });
      await categoryI18nRepo.save(translation);
    }

    console.log(`  ✅ Created category: ${catData.slug}`);
  }

  // Create sample articles
  console.log('📝 Creating sample articles...');

  const articles = [
    {
      categorySlug: 'commands',
      slug: 'basic-commands',
      displayOrder: 1,
      translations: [
        {
          language: 'ko',
          title: '기본 명령어',
          summary: '서버의 기본적인 명령어 사용법',
          content: `
            <h2>기본 명령어</h2>
            <p>SEK 서버에서 사용 가능한 기본 명령어입니다.</p>
            <ul>
              <li><strong>/help</strong> - 도움말 표시</li>
              <li><strong>/info</strong> - 서버 정보 확인</li>
              <li><strong>/status</strong> - 플레이어 상태 확인</li>
            </ul>
          `,
        },
        {
          language: 'en',
          title: 'Basic Commands',
          summary: 'Basic command usage in the server',
          content: `
            <h2>Basic Commands</h2>
            <p>Basic commands available on SEK server.</p>
            <ul>
              <li><strong>/help</strong> - Display help</li>
              <li><strong>/info</strong> - Check server information</li>
              <li><strong>/status</strong> - Check player status</li>
            </ul>
          `,
        },
      ],
    },
    {
      categorySlug: 'rules',
      slug: 'general-rules',
      displayOrder: 1,
      translations: [
        {
          language: 'ko',
          title: '일반 규칙',
          summary: '서버의 기본 규칙',
          content: `
            <h2>일반 규칙</h2>
            <ol>
              <li>다른 플레이어를 존중하세요.</li>
              <li>그리핑(griefing)은 금지됩니다.</li>
              <li>버그 악용은 금지됩니다.</li>
              <li>관리자의 지시를 따르세요.</li>
            </ol>
          `,
        },
        {
          language: 'en',
          title: 'General Rules',
          summary: 'Basic server rules',
          content: `
            <h2>General Rules</h2>
            <ol>
              <li>Respect other players.</li>
              <li>Griefing is prohibited.</li>
              <li>Bug exploitation is prohibited.</li>
              <li>Follow administrator instructions.</li>
            </ol>
          `,
        },
      ],
    },
  ];

  for (const artData of articles) {
    const category = savedCategories.find((c) => c.slug === artData.categorySlug);
    if (!category) continue;

    const article = articleRepo.create({
      categoryId: category.id,
      slug: artData.slug,
      displayOrder: artData.displayOrder,
      isPublished: true,
    });

    const savedArticle = await articleRepo.save(article);

    // Create translations
    for (const trans of artData.translations) {
      const translation = articleI18nRepo.create({
        articleId: savedArticle.id,
        language: trans.language,
        title: trans.title,
        content: trans.content,
        summary: trans.summary,
      });
      await articleI18nRepo.save(translation);
    }

    console.log(`  ✅ Created article: ${artData.slug}`);
  }

  console.log('✅ Wiki seed completed successfully!');
}

// Run if executed directly
if (require.main === module) {
  import('../data-source').then(async ({ AppDataSource }) => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await seedWikiData(AppDataSource);
      await AppDataSource.destroy();
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  });
}
