import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  createFileUploadStorage,
  createImageFileFilter,
  DEFAULT_IMAGE_FILE_SIZE_LIMIT,
} from '../utils/file-upload.util';

export function ImageUploadInterceptor(config: {
  fieldName: string;
  destination: string;
  filePrefix: string;
  maxFiles?: number;
  maxFileSize?: number;
}) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(config.fieldName, config.maxFiles ?? 1, {
        storage: createFileUploadStorage({
          destination: config.destination,
          filePrefix: config.filePrefix,
        }),
        fileFilter: createImageFileFilter(),
        limits: {
          fileSize: config.maxFileSize ?? DEFAULT_IMAGE_FILE_SIZE_LIMIT,
        },
      }),
    ),
  );
}
