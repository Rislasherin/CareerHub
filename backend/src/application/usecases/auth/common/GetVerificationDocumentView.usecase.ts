import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface RequestingUser {
  id: string;
  role: string;
  companyId?: string;
  orgId?: string;
}

export interface IGetVerificationDocumentViewUseCase {
  execute(
    user: RequestingUser,
    targetType: "company" | "college",
    targetId: string,
    documentId: string
  ): Promise<{ fileUrl: string; fileName: string; mimeType?: string; category: string }>;
}

export class GetVerificationDocumentViewUseCase implements IGetVerificationDocumentViewUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(
    user: RequestingUser,
    targetType: "company" | "college",
    targetId: string,
    documentId: string
  ): Promise<{ fileUrl: string; fileName: string; mimeType?: string; category: string }> {
    if (!user || !user.role) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const isSuperAdmin = user.role.toUpperCase() === "SUPER_ADMIN" || user.role.toUpperCase() === "ADMIN";

    if (!isSuperAdmin) {
      if (targetType === "company") {
        if (user.role.toUpperCase() !== "HR" || user.companyId !== targetId) {
          throw new AppError("Access denied to company documents", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
        }
      } else if (targetType === "college") {
        if (user.role.toUpperCase() !== "COLLEGE_ADMIN" || user.orgId !== targetId) {
          throw new AppError("Access denied to college documents", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
        }
      } else {
        throw new AppError("Invalid target type", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
    }

    if (targetType === "company") {
      const company = await this._companyRepository.findById(targetId);
      if (!company) {
        throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
      }

      const docs = company.verificationDocuments || [];
      const doc = docs.find(d => d.id === documentId);
      if (!doc) {
        // Check legacy fallback
        if (company.verificationDocument && documentId === "legacy-doc") {
          return {
            fileUrl: company.verificationDocument,
            fileName: "Verification Document",
            category: "OTHER"
          };
        }
        throw new AppError("Document not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
      }

      return {
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        category: doc.category
      };
    } else {
      const org = await this._organizationRepository.findById(targetId);
      if (!org) {
        throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
      }

      const docs = org.verificationDocuments || [];
      const doc = docs.find(d => d.id === documentId);
      if (!doc) {
        if (org.verificationDocument && documentId === "legacy-doc") {
          return {
            fileUrl: org.verificationDocument,
            fileName: "Verification Document",
            category: "OTHER"
          };
        }
        throw new AppError("Document not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
      }

      return {
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        category: doc.category
      };
    }
  }
}
