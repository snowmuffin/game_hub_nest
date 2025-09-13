import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import type {
  S3ClientConfig,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class SeS3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket =
      this.config.get<string>('SE_HANGAR_S3_BUCKET') ||
      this.config.get<string>('S3_BUCKET') ||
      '';
    const cfg: S3ClientConfig = {
      region:
        this.config.get<string>('SE_HANGAR_S3_REGION') ||
        this.config.get<string>('AWS_REGION') ||
        'ap-northeast-2',
    };
    const ak = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const sk = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (ak && sk) {
      cfg.credentials = { accessKeyId: ak, secretAccessKey: sk };
    }
    this.s3 = new S3Client(cfg);
  }

  getBucket() {
    if (!this.bucket) throw new Error('S3 bucket is not configured');
    return this.bucket;
  }

  async createPresignedUploadUrl(
    key: string,
    contentType?: string,
  ): Promise<{ url: string; bucket: string; key: string }> {
    const bucket = this.getBucket();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 10 });
    return { url, bucket, key };
  }

  async createPresignedDownloadUrl(
    key: string,
  ): Promise<{ url: string; bucket: string; key: string }> {
    const bucket = this.getBucket();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 10 });
    return { url, bucket, key };
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput | undefined> {
    const bucket = this.getBucket();
    try {
      const res = await this.s3.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key }),
      );
      return res;
    } catch {
      return undefined;
    }
  }
}
