import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateHangarGridDto {
  @IsOptional()
  @IsInt()
  serverId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentType?: string; // e.g., application/zip
}

export class IssueUploadUrlDto {
  @IsOptional()
  @IsInt()
  serverId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}

export class ConfirmUploadDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  fileHash?: string;

  @IsOptional()
  @IsString()
  sizeBytes?: string; // bigint represented as string
}
