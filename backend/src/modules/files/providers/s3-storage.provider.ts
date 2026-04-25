import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3StorageProvider {
  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.getOrThrow<string>("storage.region"),
      endpoint: this.configService.getOrThrow<string>("storage.endpoint"),
      forcePathStyle: this.configService.get<boolean>("storage.forcePathStyle"),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("storage.accessKeyId"),
        secretAccessKey: this.configService.getOrThrow<string>("storage.secretAccessKey")
      }
    });
  }

  async createSignedUpload(fileName: string, mimeType: string) {
    const bucket = this.configService.getOrThrow<string>("storage.bucket");
    const objectKey = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: mimeType
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });
    const publicUrl = `${this.configService.getOrThrow<string>("storage.endpoint")}/${bucket}/${objectKey}`;

    return { uploadUrl, objectKey, publicUrl, bucket };
  }
}
