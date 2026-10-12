import crypto from "crypto";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IStorageService } from "@application/interfaces/IStorageService";
import { VerificationDocument, Company } from "@domain/entities/Company";
import {
  COMPANY_DOCUMENT_CATEGORIES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_FILE_SIZE,
  isValidMagicBytes,
  sanitizeFileName
} from "@domain/constants/verification-documents.constants";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IUploadCompanyVerificationDocumentUseCase {
  execute(
    companyId: string,
    file: Express.Multer.File | undefined,
    category: string | undefined
  ): Promise<{ company: ReturnType<Company["toJSON"]>; document: VerificationDocument }>;
}

export class UploadCompanyVerificationDocumentUseCase implements IUploadCompanyVerificationDocumentUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _storageService: IStorageService
  ) {}

  async execute(
    companyId: string,
    file: Express.Multer.File | undefined,
    category: string | undefined
  ): Promise<{ company: ReturnType<Company["toJSON"]>; document: VerificationDocument }> {
    if (!companyId) {
      throw new AppError("Company ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (!file || !file.buffer) {
      throw new AppError("A verification document file is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (!category || !COMPANY_DOCUMENT_CATEGORIES.includes(category as any)) {
      throw new AppError(
        `Invalid document category. Allowed categories: ${COMPANY_DOCUMENT_CATEGORIES.join(", ")}`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (file.size > MAX_DOCUMENT_FILE_SIZE) {
      throw new AppError(
        `File size exceeds the limit of ${MAX_DOCUMENT_FILE_SIZE / (1024 * 1024)}MB`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const mime = file.mimetype?.toLowerCase();
    if (!mime || !ALLOWED_DOCUMENT_MIME_TYPES.includes(mime as any)) {
      throw new AppError(
        `Invalid file type (${mime}). Supported formats: PDF, JPG, PNG, WEBP`,
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!isValidMagicBytes(file.buffer, mime)) {
      throw new AppError(
        "File content verification failed: the file signature does not match its claimed extension or MIME type.",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const safeName = sanitizeFileName(file.originalname);
    const folder = `company-verifications/${companyId}`;
    const fileUrl = await this._storageService.uploadFile(file, folder);

    const document: VerificationDocument = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      category,
      fileName: safeName,
      fileUrl,
      fileSize: file.size,
      mimeType: mime,
      uploadedAt: new Date(),
    };

    company.addVerificationDocument(document);
    const updated = await this._companyRepository.update(companyId, company);

    return {
      company: updated.toJSON(),
      document,
    };
  }
}
