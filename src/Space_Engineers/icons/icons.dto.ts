import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UploadIconDto {
  /**
   * Original game file path (e.g., "Textures\\GUI\\Icons\\Cubes\\LargeBlockArmorBlock.dds")
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileName: string;

  /**
   * Base64-encoded DDS file binary data
   */
  @IsString()
  @IsNotEmpty()
  data: string;

  /**
   * MIME type - should be "image/vnd-ms.dds" or "image/png"
   */
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  /**
   * Optional: Base64-encoded PNG preview version
   */
  @IsString()
  @IsOptional()
  pngData?: string;
}
