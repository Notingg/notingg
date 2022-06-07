import nextConnect from 'next-connect';
import { HealthController } from '../../../modules/health/controllers/HealthController';

const healthController = new HealthController();

export default nextConnect({
  attachParams: true,
}).get(healthController.getHandler);
