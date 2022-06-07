import sharp from 'sharp';
import { AppError } from '../../../shared/utils/AppError';
import { StatusCode } from '../../../shared/utils/StatusCode';
import { FileRepository } from '../database/repositories/FileRepository';
import { FileProvider } from '../providers/FileProvider';

type reqFile = File & {
  mimetype: string;
  buffer: Buffer;
  originalname: string;
};

interface IData {
  file: reqFile;
}

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export class CreateFileService {
  fileProvider = new FileProvider();
  fileRepository = new FileRepository();

  public async execute({ file }: IData) {
    this.validateFile(file);

    const { originalname, mimetype } = file;
    const key = `${Date.now()}-${originalname}`;

    const buffer = await this.resizeFile(file);

    const size = buffer.byteLength;

    const fileUploadedData = await this.fileProvider.upload(buffer, key);

    const fileCreated = await this.fileRepository.create({
      key,
      original_name: originalname,
      size,
      mimetype,
      url: fileUploadedData.url,
    });

    return fileCreated;
  }

  private validateFile(file: reqFile) {
    if (!file) {
      throw new AppError(
        StatusCode.BAD_REQUEST,
        'BAD_REQUEST',
        '"file" is required',
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new AppError(
        StatusCode.BAD_REQUEST,
        'BAD_REQUEST',
        `"${file.mimetype}" is not allowed`,
      );
    }
  }

  private async resizeFile(file: reqFile): Promise<Buffer> {
    try {
      const buffer = await file.buffer;
      return sharp(buffer as any)
        .resize(1280)
        .toBuffer();
    } catch (error) {
      console.log(
        `[File:CreateFileService:resizeFile] Error while resize image, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while resizing file',
      );
    }
  }
}
