import { diskStorage } from 'multer';
import { extname } from 'path';

export interface FileUploadConfig {
  destination: string;
  filePrefix: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: RegExp;
}

export function createFileUploadStorage(config: FileUploadConfig) {
  return diskStorage({
    destination: config.destination,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${config.filePrefix}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  });
}

export function createImageFileFilter() {
  return (
    req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };
}

export const DEFAULT_IMAGE_FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB



