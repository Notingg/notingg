import fs from 'fs';
import S3 from 'aws-sdk/clients/s3';
import { AppError } from '../../../../shared/utils/AppError';
import { StatusCode } from '../../../../shared/utils/StatusCode';
import axios from 'axios';
import FormData from 'form-data';

type storageTypeFunctionArgs = {
  fileBuffer: Buffer;
  key: string;
  mimetype: string;
};

type ALLOWED_STORAGE_TYPES = 'local' | 's3' | 'imgbb';

export class UploadFileProviderMethod {
  private readonly s3Client = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.NOTINGG_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NOTINGG_AWS_SECRET_ACCESS_KEY,
    region: process.env.NOTINGG_AWS_DEFAULT_REGION,
  });

  IMGBB_BASE_URL = 'https://api.imgbb.com/1';

  public async execute(fileBuffer: Buffer, key: string, mimetype: string) {
    try {
      const storageType = process.env.STORAGE_TYPE as ALLOWED_STORAGE_TYPES;
      if (!this[storageType]) {
        throw new AppError(
          StatusCode.INTERNAL_SERVER_ERROR,
          'INTERNAL_SERVER_ERROR',
          'this storage type is not supported',
        );
      }

      return await this[storageType]({ fileBuffer, key, mimetype });
    } catch (error) {
      console.log(
        `[File:UploadFileProviderMethod:execute] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }

  private async local({ fileBuffer, key }: storageTypeFunctionArgs) {
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
        `[File:FileProvider:local] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }

  private async s3({ fileBuffer, key, mimetype }: storageTypeFunctionArgs) {
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
        `[File:FileProvider:s3] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }

  private async imgbb({ fileBuffer }: storageTypeFunctionArgs) {
    try {
      const form = new FormData();
      form.append('image', fileBuffer.toString('base64'));
      const {
        data: {
          data: { url, id: key },
        },
      } = await axios.post(
        `${this.IMGBB_BASE_URL}/upload?key=${process.env.IMGBB_API_KEY}`,
        form,
        {
          headers: form.getHeaders(),
        },
      );
      return {
        key,
        url,
      };
    } catch (error: any) {
      console.log(
        `[File:FileProvider:imgbb] Error while uploading file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while uploading file',
      );
    }
  }
}
