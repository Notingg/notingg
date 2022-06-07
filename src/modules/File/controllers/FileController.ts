import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCode } from '../../../shared/utils/StatusCode';
import { CreateFileService } from '../services/CreateFileService';

type reqFile = File & {
  mimetype: string;
  buffer: Buffer;
  originalname: string;
};

type NextApiFileRequest = NextApiRequest & {
  file: reqFile;
};

export class FileController {
  public async postHandler(req: NextApiFileRequest, res: NextApiResponse) {
    try {
      const createFileService = new CreateFileService();

      const file = await createFileService.execute({ file: req.file });

      res.status(StatusCode.OK).json({
        status: 'OK',
        message: 'File uploaded successfully',
        code: StatusCode.OK,
        data: file,
      });
    } catch (error: any) {
      res.status(error.code).json({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
  }
}
