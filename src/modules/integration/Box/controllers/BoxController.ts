import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCode } from '../../../../shared/utils/StatusCode';
import { GenerateBoxTokenService } from '../services/GenerateBoxTokenService';

export class BoxController {
  generateBoxTokenService = new GenerateBoxTokenService();

  public async postHandler(_req: NextApiRequest, res: NextApiResponse) {
    try {
      const token = await this.generateBoxTokenService.execute();

      res.status(StatusCode.CREATED).json({
        status: 'CREATED',
        message: 'Your token has been generated successfully',
        code: StatusCode.CREATED,
        data: token,
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
