import { IsString, IsOptional, IsInt, IsBoolean, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ArticleTranslationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class CategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ValidateNested()
  @Type(() => TranslationDto)
  ko: TranslationDto;

  @ValidateNested()
  @Type(() => TranslationDto)
  en: TranslationDto;
}

export class CategoryUpdateDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ValidateNested()
  @Type(() => TranslationDto)
  @IsOptional()
  ko?: TranslationDto;

  @ValidateNested()
  @Type(() => TranslationDto)
  @IsOptional()
  en?: TranslationDto;
}

export class ArticleCreateDto {
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ValidateNested()
  @Type(() => ArticleTranslationDto)
  ko: ArticleTranslationDto;

  @ValidateNested()
  @Type(() => ArticleTranslationDto)
  en: ArticleTranslationDto;
}

export class ArticleUpdateDto {
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ValidateNested()
  @Type(() => ArticleTranslationDto)
  @IsOptional()
  ko?: ArticleTranslationDto;

  @ValidateNested()
  @Type(() => ArticleTranslationDto)
  @IsOptional()
  en?: ArticleTranslationDto;
}
