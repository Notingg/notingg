import { dbConnect } from '../../../database/dbConnect';

export class GetServicesHealth {
  public async execute() {
    const apiStatus = 'UP';
    let dbStatus = 'UP';

    try {
      await dbConnect();
    } catch (error) {
      console.log(
        `[health:GetServicesHealth] Error connecting to database: ${error}`,
      );
      dbStatus = 'DOWN';
    }

    return {
      status: {
        api: apiStatus,
        db: dbStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
