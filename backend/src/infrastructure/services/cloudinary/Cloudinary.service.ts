import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '@application/errors/AppError';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { ErrorCode } from '@domain/enums/ErrorCodes.enum';
import { IStorageService, UploadMetadata } from '@application/interfaces/IStorageService';
import { url } from 'inspector';
import { format } from 'path';

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
      const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          format: isPdf ? 'pdf' : undefined,
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

  async uploadFileWithMetadata(file: Express.Multer.File, folder: string): Promise<UploadMetadata> {
    return new Promise((resolve,reject)=> {
      const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const uploadStream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: isPdf ? 'raw' : 'auto',
        type: 'upload',
        public_id: uniqueId
      },
        (error,result)=> {
          if(error) {
             return reject(new AppError(`Cloudinary upload failed: ${error.message}`,HttpStatus.INTERNAL_SERVER_ERROR,ErrorCode.INTERNAL_ERROR));
          }
          
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
            format: result!.format,
            bytes: result!.bytes
        })
        }
      );
      uploadStream.end(file.buffer);
    });
  };
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }catch(error) {
      throw new AppError('Failed to delete file from Cloudinary', HttpStatus.INTERNAL_SERVER_ERROR,ErrorCode.INTERNAL_ERROR);
    }
  }
}
