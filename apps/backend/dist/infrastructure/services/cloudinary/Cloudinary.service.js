"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class CloudinaryService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadFile(file, folder) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'image',
            }, (error, result) => {
                if (error) {
                    return reject(new AppError_1.AppError('Cloudinary upload failed', HttpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR));
                }
                resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
}
exports.CloudinaryService = CloudinaryService;
