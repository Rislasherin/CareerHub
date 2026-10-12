import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { Company } from "@domain/entities/Company";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IDeleteCompanyVerificationDocumentUseCase {
  execute(companyId: string, documentId: string): Promise<ReturnType<Company["toJSON"]>>;
}

export class DeleteCompanyVerificationDocumentUseCase implements IDeleteCompanyVerificationDocumentUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) {}

  async execute(companyId: string, documentId: string): Promise<ReturnType<Company["toJSON"]>> {
    if (!companyId || !documentId) {
      throw new AppError("Company ID and Document ID are required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const existing = (company.verificationDocuments || []).find(d => d.id === documentId);
    if (!existing) {
      throw new AppError("Verification document not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    company.removeVerificationDocument(documentId);
    const updated = await this._companyRepository.update(companyId, company);

    return updated.toJSON();
  }
}
