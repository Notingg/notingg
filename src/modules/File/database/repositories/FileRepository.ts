import FileModel from '../models/FileModel';
import { dbConnect } from '../../../../database/dbConnect';
import { IFileModel } from '../../../../shared/interfaces/IFileModel';
import { AppError } from '../../../../shared/utils/AppError';
import { StatusCode } from '../../../../shared/utils/StatusCode';

export class FileRepository {
  public async create(file: IFileModel): Promise<IFileModel> {
    try {
      await dbConnect();
      return FileModel.create({
        ...file,
        storage_type: process.env.STORAGE_TYPE,
      });
    } catch (error) {
      console.log(
        `[File:FileRepository:create] Error while creating file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while creating file',
      );
    }
  }
  public async findByWhere(where: any): Promise<IFileModel[]> {
    try {
      await dbConnect();
      return await FileModel.find(where);
    } catch (error) {
      console.log(
        `[File:FileRepository:findByWhere] Error while finding file, error: ${error}`,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        'Error while finding file',
      );
    }
  }
}
