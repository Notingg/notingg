import { UploadFileProviderMethod } from './methods/UploadFileProviderMethod';

export class FileProvider {
  uploadFileProviderMethod = new UploadFileProviderMethod();

  public async upload(fileBuffer: Buffer, key: string, mimetype: string) {
    return await this.uploadFileProviderMethod.execute(
      fileBuffer,
      key,
      mimetype,
    );
  }
}
