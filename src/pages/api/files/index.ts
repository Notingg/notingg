import nextConnect from 'next-connect';
import { FileController } from '../../../modules/File/controllers/FileController';
import multer from 'multer';

const fileController = new FileController();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

export default nextConnect({
  attachParams: true,
  onError: (error, _req, _res, next) => {
    console.log(error);
    next();
  },
})
  .use(upload.single('file'))
  .post((req, res) => fileController.postHandler(req as any, res as any));

export const config = {
  api: {
    bodyParser: false,
  },
};
