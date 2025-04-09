import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, uuidv4() + '-' + file.originalname)
});

const fileFilter = (_: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  file.mimetype === 'text/csv' ? cb(null, true) : cb(new Error('Only CSV files allowed'));
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});