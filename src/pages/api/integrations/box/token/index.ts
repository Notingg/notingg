import nextConnect from 'next-connect';
import { BoxController } from '../../../../../modules/integration/Box/controllers/BoxController';

const boxController = new BoxController();

export default nextConnect({
  attachParams: true,
}).post((req, res) => boxController.postHandler(req as any, res as any));
