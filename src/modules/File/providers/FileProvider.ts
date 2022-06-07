import fs from 'fs';
import S3 from 'aws-sdk/clients/s3';
import { AppError } from '../../../shared/utils/AppError';
import { StatusCode } from '../../../shared/utils/StatusCode';

export class FileProvider {
  private readonly s3Client = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.NOTINGG_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NOTINGG_AWS_SECRET_ACCESS_KEY,
    region: process.env.NOTINGG_AWS_DEFAULT_REGION,
  });

  public async upload(fileBuffer: Buffer, key: string, mimetype: string) {
    switch (process.env.STORAGE_TYPE) {
      case 'local':
        return await this.uploadLocal(fileBuffer, key);
      case 's3':
        return await this.uploadS3(fileBuffer, key, mimetype);
      default:
        throw new AppError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'INTERNAL_SERVER_ERROR',
          'this storage type is not supported',
        );
    }
  }

  private async uploadLocal(fileBuffer: Buffer, key: string) {
    try {
      const filePath = `tmp/uploads/${key}`;

      await fs.promises.writeFile(filePath, fileBuffer);

      const url = `${process.env.API_BASE_URL}/files/uploads/${key}`;

      return {
        key,
        url,
      };
    } catch (error: any) {
      console.log(
        `[File:FileProvider:uploadLocal] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }

  private async uploadS3(fileBuffer: Buffer, key: string, mimetype: string) {
    try {
      const { Location: url, Key: s3Key } = await this.s3Client
        .upload({
          Bucket: process.env.NOTINGG_AWS_PUBLIC_BUCKET_NAME || '',
          ContentType: mimetype,
          ACL: 'public-read',
          Key: key,
          Body: fileBuffer,
        })
        .promise();

      return {
        key: s3Key,
        url,
      };
    } catch (error: any) {
      console.log(
        `[File:FileProvider:uploadS3] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }
}
