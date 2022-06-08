import nextConnect from 'next-connect';
import fs from 'fs';

export default nextConnect({
  attachParams: true,
}).get(getHandler);

function getHandler(req: any, res: any) {
  try {
    const key = req.query.key;

    const file = fs.readFileSync(`./tmp/uploads/${key}`);

    res.send(file);
  } catch (error) {
    console.log(`[File:getHandler] Error while getting file, error: ${error}`);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error while getting file',
      code: 500,
    });
  }
}
