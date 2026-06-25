import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { IStorageService } from '@application/interfaces/IStorageService';

export class CloudinaryService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(new AppError('Cloudinary upload failed', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR));
          }
          resolve(result!.secure_url);
        }
      );

      uploadStream.end(file.buffer);
    });
  }
}
