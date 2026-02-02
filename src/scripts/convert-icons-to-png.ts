import { AppDataSource } from '../data-source';
import { IconFile } from '../entities/space_engineers/icon-file.entity';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

async function convertIconsToPng() {
  console.log('🚀 Starting DDS to PNG conversion for existing icons...');

  // Initialize database connection
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const iconFileRepository = AppDataSource.getRepository(IconFile);

  // Get S3 configuration from environment
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const bucket = process.env.S3_BUCKET_NAME || 'snowmuffin-game-assets';

  // Find all icons without PNG version
  const iconsWithoutPng = await iconFileRepository.find({
    where: { pngCdnUrl: null as any },
  });

  console.log(
    `📊 Found ${iconsWithoutPng.length} icons without PNG version`,
  );

  if (iconsWithoutPng.length === 0) {
    console.log('✨ All icons already have PNG versions!');
    await AppDataSource.destroy();
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < iconsWithoutPng.length; i++) {
    const icon = iconsWithoutPng[i];
    console.log(
      `\n[${i + 1}/${iconsWithoutPng.length}] Processing: ${icon.fileName}`,
    );

    let tmpDdsPath: string | null = null;
    let tmpPngPath: string | null = null;

    try {
      // Extract S3 key from CDN URL
      const s3Key = icon.cdnUrl.split('.com/')[1];
      if (!s3Key) {
        console.log(`⚠️  Could not extract S3 key from: ${icon.cdnUrl}`);
        skipCount++;
        continue;
      }

      // Download DDS from S3
      console.log(`  📥 Downloading from S3...`);
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });

      const response = await s3Client.send(getCommand);
      const ddsBuffer = Buffer.from(await response.Body!.transformToByteArray());

      // Create temporary files
      const tmpDir = os.tmpdir();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      tmpDdsPath = path.join(tmpDir, `icon_${timestamp}_${randomId}.dds`);
      tmpPngPath = path.join(tmpDir, `icon_${timestamp}_${randomId}.png`);

      // Write DDS to temp file
      await fs.writeFile(tmpDdsPath, ddsBuffer);

      // Convert using ImageMagick
      console.log(`  🔄 Converting DDS to PNG...`);
      await execAsync(`convert "${tmpDdsPath}" "${tmpPngPath}"`);

      // Read PNG buffer
      const pngBuffer = await fs.readFile(tmpPngPath);

      // Generate PNG filename
      const pngFileName = icon.fileName.replace(/\.(dds|DDS)$/, '.png');
      const pngS3Key = `icons/${pngFileName}`;

      // Upload PNG to S3
      console.log(`  📤 Uploading PNG to S3...`);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: pngS3Key,
          Body: pngBuffer,
          ContentType: 'image/png',
          CacheControl: 'public, max-age=31536000',
        }),
      );

      const pngCdnUrl = `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${pngS3Key}`;

      // Update database
      await iconFileRepository.update(
        { id: icon.id },
        { pngCdnUrl: pngCdnUrl },
      );

      console.log(
        `  ✅ Success! ${ddsBuffer.length} bytes → ${pngBuffer.length} bytes`,
      );
      successCount++;
    } catch (error) {
      console.error(
        `  ❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      failCount++;
    } finally {
      // Clean up temporary files
      try {
        if (tmpDdsPath) await fs.unlink(tmpDdsPath).catch(() => {});
        if (tmpPngPath) await fs.unlink(tmpPngPath).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Conversion Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed:  ${failCount}`);
  console.log(`  ⚠️  Skipped: ${skipCount}`);
  console.log(`  📝 Total:   ${iconsWithoutPng.length}`);
  console.log('='.repeat(60));

  await AppDataSource.destroy();
  console.log('✨ Done!');
}

// Run the script
convertIconsToPng()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
